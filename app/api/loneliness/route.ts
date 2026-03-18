import { NextRequest, NextResponse } from "next/server";
import { poolPromise } from "@/lib/db";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const pool = await poolPromise;

        if (!body.participant_id || !Array.isArray(body.ratings)) {
            return Response.json({ error: "Invalid request body" }, { status: 400 });
        }

        const conn = await pool.getConnection();

        await conn.execute(`DELETE FROM RoundRobinStudy.Loneliness WHERE participant_id = ?;`, [body.participant_id]);

        if (body.ratings.length === 0) {
            conn.release();
            return Response.json({ data: { message: "No ratings inserted" } });
        }

        const values = body.ratings.map((rating: any) => [
            body.participant_id,
            rating.question,
            rating.rating,
            rating.index
        ]);

        const [result] = await conn.query(
            `REPLACE INTO RoundRobinStudy.Loneliness (participant_id, question, rating, question_index) VALUES ?;`,
            [values]
        );
        conn.release();
        return Response.json({ data: result });
    } catch (error) {
        console.error("Error posting loneliness ratings:", error);
        return Response.json({ error: "Failed to post loneliness ratings" }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const participantId = url.searchParams.get("participant_id");

        if (!participantId) {
            return Response.json({ error: "Missing participant_id" }, { status: 400 });
        }

        const pool = await poolPromise;
        const conn = await pool.getConnection();

        const [rows] = await conn.execute(
            `SELECT * FROM RoundRobinStudy.Loneliness WHERE participant_id = ?;`,
            [participantId]
        );
        conn.release();
        return Response.json({ data: rows }, { status: 200 });

    } catch (error) {
        console.error("Error fetching loneliness ratings:", error);
        return Response.json({ error: "Failed to fetch loneliness ratings" }, { status: 500 });
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
