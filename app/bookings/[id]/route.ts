import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { authenticateRequest } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  
  const authError = authenticateRequest(request);
  
  if (authError) return authError;
  
  // 2. Get the booking ID from the URL.
  const { id } = await params;
  
  try {
    // 3. Find the booking using its ID.
    const result = await pool.query(
      `SELECT id, slot_id, name, email, status, created_at
       FROM bookings
       WHERE id = $1`,
      [id],
    );
    
    // 4. Return 404 if the booking doesn't exist.
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    
    // 5. Return the booking details.
    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (error) {
    console.error("Failed to retrieve booking:", error);
    
    return NextResponse.json(
      { error: "Failed to retrieve booking" },
      { status: 500 },
    );
  }
}
