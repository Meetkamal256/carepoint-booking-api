import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { authenticateRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  // Check whether the request contains the correct API key.
  const authError = authenticateRequest(request);
  
  if (authError) {
    return authError;
  }
  
  // Read the optional provider filter from the URL.
  const provider = request.nextUrl.searchParams.get("provider");
  
  try {
    const result = await pool.query(
      `SELECT
        s.id,
        s.provider,
        s.start,
        s."end",
        NOT EXISTS (
          SELECT 1
          FROM bookings b
          WHERE b.slot_id = s.id
          AND b.status = 'confirmed'
        ) AS available
      FROM slots s
      WHERE ($1::text IS NULL OR s.provider = $1)
      ORDER BY s.start ASC`,
      [provider],
    );
    
    return NextResponse.json({
      slots: result.rows,
    });
  } catch (error) {
    console.error("Failed to retrieve slots:", error);
    
    return NextResponse.json(
      { error: "Failed to retrieve slots" },
      { status: 500 },
    );
  }
}
