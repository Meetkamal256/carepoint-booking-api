import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(
      "SELECT NOW() AS database_time, current_database() AS database_name",
    );

    return NextResponse.json({
      success: true,
      message: "Database connection successful!",
      database: result.rows[0].database_name,
      time: result.rows[0].database_time,
    });
  } catch (error) {
    console.error("Database connection error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Could not connect to the database",
      },
      { status: 500 },
    );
  }
}
