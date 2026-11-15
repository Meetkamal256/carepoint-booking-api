import { NextRequest, NextResponse } from "next/server";

export function authenticateRequest(request: NextRequest) {
  const apiKey = process.env.API_KEY;

  // Ensure the API key is configured on the server.
  if (!apiKey) {
    console.error("API_KEY is not configured");
    return NextResponse.json(
      { error: "Server authentication is not configured" },
      { status: 500 },
    );
  }

  // Read the key sent in the request header.
  const providedKey = request.headers.get("X-API-Key");

  // Reject missing or incorrect keys.
  if (!providedKey || providedKey !== apiKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Allow the request to continue.
  return null;
}
