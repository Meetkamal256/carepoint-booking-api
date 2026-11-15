import { NextRequest, NextResponse } from "next/server";


export async function GET(request: NextRequest) {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    console.error("API_KEY is not configured");

    return NextResponse.json(
      { error: "Server authentication is not configured" },
      { status: 500 },
    );
  }

  try {
    // Forward the provider filter, if one was supplied.
    const apiUrl = new URL("/slots", request.url);

    const provider = request.nextUrl.searchParams.get("provider");

    if (provider) {
      apiUrl.searchParams.set("provider", provider);
    }

    // Call the existing protected backend API.
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "X-API-Key": apiKey,
      },
      cache: "no-store",
    });

    const responseBody = await response.text();

    return new NextResponse(responseBody, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Failed to retrieve appointment slots:", error);

    return NextResponse.json(
      { error: "Unable to retrieve appointment slots" },
      { status: 500 },
    );
  }
}
