import { NextRequest, NextResponse } from "next/server";

type BackendMethod = "GET" | "POST" | "DELETE";

export async function proxyBackendRequest(
  request: NextRequest,
  backendPath: string,
  method: BackendMethod,
) {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    console.error("API_KEY is not configured");

    return NextResponse.json(
      { error: "Server authentication is not configured" },
      { status: 500 },
    );
  }
  
  try {
    // Build the backend URL and preserve query parameters.
    const backendUrl = new URL(backendPath, request.url);
    backendUrl.search = request.nextUrl.search;

    // Prepare headers for the protected backend.
    const headers = new Headers({
      "X-API-Key": apiKey,
    });

    const contentType = request.headers.get("content-type");
    const idempotencyKey = request.headers.get("Idempotency-Key");

    if (contentType) {
      headers.set("Content-Type", contentType);
    }

    // Preserve the idempotency key for booking requests.
    if (idempotencyKey) {
      headers.set("Idempotency-Key", idempotencyKey);
    }

    const body = method === "POST" ? await request.text() : undefined;

    const response = await fetch(backendUrl, {
      method,
      headers,
      body,
      cache: "no-store",
    });

    const responseBody = await response.text();

    // Forward important response headers.
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
