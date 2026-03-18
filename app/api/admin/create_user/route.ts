import { NextRequest, NextResponse } from "next/server";
import { poolPromise } from "@/lib/db";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { participant_id, full_name, session_date, session_time, email } = body;

        if (!participant_id || !full_name || !session_date || !session_time || !email) {
            return Response.json({ error: "Missing required fields" }, { status: 400 });
        }

        const pool = await poolPromise;
        const conn = await pool.getConnection();

        try {
            await conn.execute(
                `INSERT INTO RoundRobinStudy.Participant (participant_id, full_name, session_state, session_date, session_time, email) 
                 VALUES (?, ?, 0, ?, ?, ?)`,
                [participant_id, full_name, session_date, session_time, email]
            );
            return Response.json({ message: "User created successfully" }, { status: 201 });
        } catch (dbError: any) {
            if (dbError.code === 'ER_DUP_ENTRY') {
                return Response.json({ error: "Participant ID already exists" }, { status: 409 });
            }
            throw dbError;
        } finally {
            conn.release();
        }

    } catch (error: any) {
        console.error("Error creating user:", error);
        return Response.json({ error: "Failed to create user" }, { status: 500 });
    }
}

export async function OPTIONS(_request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
