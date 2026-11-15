import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { authenticateRequest } from "@/lib/auth";

export async function POST(request: NextRequest) {
  // Every endpoint must require a valid API key.
  const authError = authenticateRequest(request);

  if (authError) {
    return authError;
  }

  // Read and validate the request body.
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request body" },
      { status: 400 },
    );
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("slots" in body) ||
    !Array.isArray(body.slots)
  ) {
    return NextResponse.json(
      { error: "Request body must contain a slots array" },
      { status: 400 },
    );
  }

  // Validate every slot before changing the database.
  for (const slot of body.slots) {
    if (
      typeof slot !== "object" ||
      slot === null ||
      !("id" in slot) ||
      !("provider" in slot) ||
      !("start" in slot) ||
      !("end" in slot) ||
      typeof slot.id !== "string" ||
      !slot.id.trim() ||
      typeof slot.provider !== "string" ||
      !slot.provider.trim() ||
      typeof slot.start !== "string" ||
      typeof slot.end !== "string" ||
      !slot.start.trim() ||
      !slot.end.trim()
    ) {
      return NextResponse.json(
        { error: "Each slot must have a valid id, provider, start and end" },
        { status: 400 },
      );
    }

    const startTime = Date.parse(slot.start);
    const endTime = Date.parse(slot.end);

    if (
      !Number.isFinite(startTime) ||
      !Number.isFinite(endTime) ||
      endTime <= startTime
    ) {
      return NextResponse.json(
        {
          error: "Each slot must have valid dates and end must be after start",
        },
        { status: 400 },
      );
    }
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    
    // Remove existing bookings before replacing slots.
    await client.query("DELETE FROM bookings");
    
    // Remove all existing slots.
    await client.query("DELETE FROM slots");
    
    // Insert the replacement slots.
    for (const slot of body.slots) {
      await client.query(
        `INSERT INTO slots (id, provider, start, "end")
         VALUES ($1, $2, $3, $4)`,
        [slot.id, slot.provider.trim(), slot.start, slot.end],
      );
    }

    await client.query("COMMIT");

    return NextResponse.json({ message: "Done" }, { status: 200 });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Failed to reset slots:", error);

    return NextResponse.json(
      { error: "Failed to replace slots" },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
