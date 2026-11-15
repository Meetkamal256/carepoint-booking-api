import { connection, NextRequest, NextResponse } from "next/server";

type BackendMethod = "GET" | "POST" | "DELETE";

const MAX_ATTEMPTS = 3;

const RETRYABLE_STATUS_CODES = new Set([408, 500, 502, 503, 504]);

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export async function proxyBackendRequest(
  request: NextRequest,
  backendPath: string,
  method: BackendMethod,
) {
  // GET handlers need request-time execution before accessing request properties.
  // This is required by Next.js when Cache Components are enabled.
  if (method === "GET") {
    await connection();
  }

  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    console.error("API_KEY is not configured");

    return NextResponse.json(
      { error: "Server authentication is not configured" },
      { status: 500 },
    );
  }

  try {
    const backendUrl = new URL(backendPath, request.url);
    backendUrl.search = request.nextUrl.search;

    const headers = new Headers({
      "X-API-Key": apiKey,
    });

    const contentType = request.headers.get("content-type");
    const idempotencyKey = request.headers.get("Idempotency-Key");

    if (contentType) {
      headers.set("Content-Type", contentType);
    }

    if (idempotencyKey) {
      headers.set("Idempotency-Key", idempotencyKey);
    }

    // Read the request body once so it can be safely reused for retries.
    const body = method === "POST" ? await request.text() : undefined;

    // GET requests are safe to retry.
    // POST requests are retried only when an idempotency key is provided.
    const canRetry =
      method === "GET" || (method === "POST" && Boolean(idempotencyKey));

    const maxAttempts = canRetry ? MAX_ATTEMPTS : 1;

    let response: Response | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        response = await fetch(backendUrl, {
          method,
          headers,
          body,
          cache: "no-store",
        });

        const shouldRetry =
          canRetry &&
          RETRYABLE_STATUS_CODES.has(response.status) &&
          attempt < maxAttempts;

        if (!shouldRetry) {
          break;
        }

        // Discard the failed response before trying again.
        await response.body?.cancel();

        console.warn(
          `Backend returned ${response.status}. Retrying attempt ${attempt + 1}.`,
        );
      } catch (error) {
        if (attempt === maxAttempts || !canRetry) {
          throw error;
        }

        console.warn(
          `Backend request failed. Retrying attempt ${attempt + 1}.`,
          error,
        );
      }

      // Wait 300ms, then 600ms before subsequent attempts.
      const delay = 300 * 2 ** (attempt - 1);
      await wait(delay);
    }

    if (!response) {
      throw new Error("Backend did not return a response");
    }

    const responseBody = await response.text();

    const responseHeaders = new Headers({
      "Content-Type":
        response.headers.get("content-type") ?? "application/json",
      "Cache-Control": "no-store",
    });

    const retryAfter = response.headers.get("Retry-After");

    if (retryAfter) {
      responseHeaders.set("Retry-After", retryAfter);
    }

    return new NextResponse(responseBody, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Backend proxy request failed:", error);

    return NextResponse.json(
      { error: "Unable to communicate with the booking service" },
      { status: 500 },
    );
  }
}
