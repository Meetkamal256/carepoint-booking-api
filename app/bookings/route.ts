import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { authenticateRequest } from "@/lib/auth";

// Check that a value is a JSON object.
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// Basic email validation.
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  // 1. Authenticate the request.
  const authError = authenticateRequest(request);

  if (authError) {
    return authError;
  }

  // 2. Read the JSON request body.
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request body" },
      { status: 400 },
    );
  }

  // Read the optional idempotency key.
  const idempotencyKey = request.headers.get("Idempotency-Key")?.trim() || null;

  // Extract an email for rate limiting, even before full validation.
  const emailForRateLimit =
    isRecord(body) && typeof body.email === "string"
      ? body.email.trim().toLowerCase()
      : null;

  const client = await pool.connect();

  let transactionStarted = false;

  try {
    // 3. Start a database transaction.
    await client.query("BEGIN");
    transactionStarted = true;

    // 4. Handle idempotency when a key is provided.
    if (idempotencyKey) {
      await client.query(
        `INSERT INTO idempotency_keys (key, request_body)
         VALUES ($1, $2::jsonb)
         ON CONFLICT (key) DO NOTHING`,
        [idempotencyKey, JSON.stringify(body)],
      );

      const existingKey = await client.query(
        `SELECT
           request_body = $2::jsonb AS same_body,
           response_status,
           response_body
         FROM idempotency_keys
         WHERE key = $1
         FOR UPDATE`,
        [idempotencyKey, JSON.stringify(body)],
      );

      const previousRequest = existingKey.rows[0];

      // The same key cannot be reused with a different body.
      if (!previousRequest.same_body) {
        await client.query("ROLLBACK");
        transactionStarted = false;

        return NextResponse.json(
          { error: "Idempotency key was used with a different request body" },
          { status: 422 },
        );
      }

      // Return the original response if this request was processed before.
      if (previousRequest.response_status !== null) {
        let headers: Record<string, string> | undefined;

        // A repeated rate-limit response must also include Retry-After.
        if (
          Number(previousRequest.response_status) === 429 &&
          emailForRateLimit
        ) {
          const rateResult = await client.query(
            `SELECT MIN(attempted_at) AS oldest_attempt
             FROM booking_attempts
             WHERE email = $1
             AND attempted_at > NOW() - INTERVAL '1 minute'`,
            [emailForRateLimit],
          );

          const oldestAttempt = rateResult.rows[0].oldest_attempt;

          const retryAfter = oldestAttempt
            ? Math.max(
                1,
                Math.ceil(
                  (Date.parse(String(oldestAttempt)) + 60_000 - Date.now()) /
                    1000,
                ),
              )
            : 1;

          headers = { "Retry-After": String(retryAfter) };
        }

        await client.query("COMMIT");
        transactionStarted = false;

        return NextResponse.json(previousRequest.response_body, {
          status: Number(previousRequest.response_status),
          headers,
        });
      }
    }

    // Helper to save the response and finish the transaction.
    const finish = async (
      status: number,
      responseBody: Record<string, unknown>,
      headers?: Record<string, string>,
    ) => {
      if (idempotencyKey) {
        await client!.query(
          `UPDATE idempotency_keys
           SET response_status = $2,
               response_body = $3::jsonb
           WHERE key = $1`,
          [idempotencyKey, status, JSON.stringify(responseBody)],
        );
      }

      await client!.query("COMMIT");
      transactionStarted = false;

      return NextResponse.json(responseBody, {
        status,
        headers,
      });
    };

    // 5. Apply rate limiting.
    if (emailForRateLimit) {
      // Serialize attempts for the same email address.
      await client.query(
        "SELECT pg_advisory_xact_lock(hashtextextended($1, 0))",
        [emailForRateLimit],
      );

      // Remove attempts older than one minute.
      await client.query(
        `DELETE FROM booking_attempts
         WHERE email = $1
         AND attempted_at <= NOW() - INTERVAL '1 minute'`,
        [emailForRateLimit],
      );

      const attemptsResult = await client.query(
        `SELECT
           COUNT(*)::int AS attempt_count,
           MIN(attempted_at) AS oldest_attempt
         FROM booking_attempts
         WHERE email = $1
         AND attempted_at > NOW() - INTERVAL '1 minute'`,
        [emailForRateLimit],
      );

      const attemptCount = Number(attemptsResult.rows[0].attempt_count);

      // Reject the sixth attempt within the rolling minute.
      if (attemptCount >= 5) {
        const oldestAttempt = attemptsResult.rows[0].oldest_attempt;

        const retryAfter = Math.max(
          1,
          Math.ceil(
            (Date.parse(String(oldestAttempt)) + 60_000 - Date.now()) / 1000,
          ),
        );

        return await finish(
          429,
          { error: "Too many booking attempts for this email" },
          { "Retry-After": String(retryAfter) },
        );
      }

      // Record the attempt before validation so failed attempts count.
      await client.query(
        `INSERT INTO booking_attempts (email)
         VALUES ($1)`,
        [emailForRateLimit],
      );
    }

    // 6. Validate the request fields.
    if (!isRecord(body)) {
      return await finish(400, { error: "Request body must be a JSON object" });
    }

    const slotId = typeof body.slot_id === "string" ? body.slot_id : "";

    const name = typeof body.name === "string" ? body.name.trim() : "";

    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!slotId.trim() || !name || !email) {
      return await finish(400, {
        error: "slot_id, name and email are required",
      });
    }

    if (!isValidEmail(email)) {
      return await finish(400, { error: "Invalid email address" });
    }

    // 7. Find and lock the requested appointment slot.
    const slotResult = await client.query(
      `SELECT id, start
       FROM slots
       WHERE id = $1
       FOR UPDATE`,
      [slotId],
    );

    if (slotResult.rows.length === 0) {
      return await finish(404, { error: "Slot not found" });
    }

    // 8. Reject appointments that have already started.
    const slotStart = Date.parse(String(slotResult.rows[0].start));

    if (slotStart <= Date.now()) {
      return await finish(400, {
        error: "This appointment slot has already started",
      });
    }

    // 9. Create the booking.
    // The unique partial index prevents two confirmed bookings
    // from occupying the same slot.
    const bookingResult = await client.query(
      `INSERT INTO bookings (slot_id, name, email, status)
       VALUES ($1, $2, $3, 'confirmed')
       ON CONFLICT (slot_id) WHERE status = 'confirmed'
       DO NOTHING
       RETURNING id, slot_id, name, email, status, created_at`,
      [slotId, name, email],
    );

    // No row returned means another booking already owns this slot.
    if (bookingResult.rows.length === 0) {
      return await finish(409, {
        error: "This appointment slot is already booked",
      });
    }

    // 10. Return the successful booking.
    return await finish(201, bookingResult.rows[0]);
  } catch (error) {
    // Undo incomplete database operations.
    if (client && transactionStarted) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Booking rollback failed:", rollbackError);
      }
    }

    console.error("Failed to create booking:", error);

    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 },
    );
  } finally {
    // Return the database connection to the pool.
    client?.release();
  }
}

function encodeCursor(booking: { id: string; cursor_created_at: string }) {
  return Buffer.from(
    JSON.stringify({
      id: booking.id,
      created_at: booking.cursor_created_at,
    }),
  ).toString("base64url");
}

function decodeCursor(
  cursor: string,
): { id: string; created_at: string } | null {
  try {
    const decoded = JSON.parse(
      Buffer.from(cursor, "base64url").toString("utf8"),
    );

    if (
      typeof decoded.id !== "string" ||
      typeof decoded.created_at !== "string" ||
      !Number.isFinite(Date.parse(decoded.created_at))
    ) {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  // 1. Authenticate the request.
  const authError = authenticateRequest(request);
  if (authError) return authError;

  // 2. Read query parameters.
  const searchParams = request.nextUrl.searchParams;
  const email = searchParams.get("email")?.trim().toLowerCase();
  const limitParam = searchParams.get("limit");
  const cursorParam = searchParams.get("cursor");

  // 3. Validate the email.
  if (!email || !isValidEmail(email)) {
    return NextResponse.json(
      { error: "A valid email address is required" },
      { status: 400 },
    );
  }

  // 4. Validate the result limit.
  const limit = limitParam === null ? 10 : Number(limitParam);

  if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
    return NextResponse.json(
      { error: "Limit must be between 1 and 50" },
      { status: 400 },
    );
  }

  // 5. Decode the optional pagination cursor.
  const cursor = cursorParam ? decodeCursor(cursorParam) : null;

  if (cursorParam && !cursor) {
    return NextResponse.json(
      { error: "Invalid pagination cursor" },
      { status: 400 },
    );
  }

  try {
    // 6. Retrieve one extra booking to check whether another page exists.
    // Preserve the full PostgreSQL timestamp precision for pagination.
    const result = await pool.query(
      `SELECT
         id,
         slot_id,
         name,
         email,
         status,
         created_at,
         created_at::text AS cursor_created_at
       FROM bookings
       WHERE LOWER(email) = $1
       AND (
         $2::timestamptz IS NULL
         OR (created_at, id) > ($2::timestamptz, $3::uuid)
       )
       ORDER BY created_at ASC, id ASC
       LIMIT $4`,
      [email, cursor?.created_at ?? null, cursor?.id ?? null, limit + 1],
    );

    // 7. Check whether another page exists.
    const hasMore = result.rows.length > limit;

    // Keep only the requested number of bookings.
    const pageRows = result.rows.slice(0, limit);

    // Remove the internal pagination timestamp from the response.
    const bookings = pageRows.map(
      ({ cursor_created_at, ...booking }) => booking,
    );

    // 8. Create the next cursor when another page exists.
    const nextCursor = hasMore
      ? encodeCursor(pageRows[pageRows.length - 1])
      : null;

    return NextResponse.json({
      bookings,
      next_cursor: nextCursor,
    });
  } catch (error) {
    console.error("Failed to retrieve bookings:", error);

    return NextResponse.json(
      { error: "Failed to retrieve bookings" },
      { status: 500 },
    );
  }
}
