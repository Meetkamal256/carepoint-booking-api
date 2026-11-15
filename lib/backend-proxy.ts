import { connection, NextRequest, NextResponse } from "next/server";

type BackendMethod = "GET" | "POST" | "DELETE";

const MAX_ATTEMPTS = 3;
const REQUEST_TIMEOUT_MS = 5000;

const RETRYABLE_STATUS_CODES = new Set([408, 500, 502, 503, 504]);

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export async function proxyBackendRequest(
  request: NextRequest,
  backendPath: string,
  method: BackendMethod,
) {
  // Require request-time execution for GET handlers with Cache Components.
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

    // Read the request body once so it can be reused safely.
    const body = method === "POST" ? await request.text() : undefined;

    // Only retry GET and idempotent POST requests.
    const canRetry =
      method === "GET" || (method === "POST" && Boolean(idempotencyKey));

    const maxAttempts = canRetry ? MAX_ATTEMPTS : 1;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await fetch(backendUrl, {
          method,
          headers,
          body,
          cache: "no-store",
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });

        // Read the body within the attempt so body-reading failures
        // can also be retried when the operation is safe.
        const responseBody = await response.text();

        const shouldRetry =
          canRetry &&
          RETRYABLE_STATUS_CODES.has(response.status) &&
          attempt < maxAttempts;

        if (shouldRetry) {
          console.warn(
            `Backend returned ${response.status}. Retrying attempt ${attempt + 1}.`,
          );

          await wait(300 * 2 ** (attempt - 1));
          continue;
        }

        const responseHeaders = new Headers({
          "Content-Type":
            response.headers.get("content-type") ?? "application/json",
          "Cache-Control": "no-store",
        });

        // Preserve rate-limit information for the frontend.
        const retryAfter = response.headers.get("Retry-After");

        if (retryAfter) {
          responseHeaders.set("Retry-After", retryAfter);
        }

        return new NextResponse(responseBody, {
          status: response.status,
          headers: responseHeaders,
        });
      } catch (error) {
        if (!canRetry || attempt === maxAttempts) {
          throw error;
        }

        console.warn(
          `Backend request failed. Retrying attempt ${attempt + 1}.`,
          error,
        );

        await wait(300 * 2 ** (attempt - 1));
      }
    }

    throw new Error("Backend request failed after all retry attempts");
  } catch (error) {
    console.error("Backend proxy request failed:", error);

    return NextResponse.json(
      { error: "Unable to communicate with the booking service" },
      { status: 500 },
    );
  }
}
