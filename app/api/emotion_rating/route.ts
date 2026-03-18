import { NextRequest, NextResponse } from "next/server";
import { poolPromise } from "@/lib/db";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const pool = await poolPromise;

        if (!body.participant_id || !Array.isArray(body.ratings)) {
            return Response.json({ error: "Invalid request body" }, { status: 400 });
        }

        const ratingPerson = body.ratingPerson; // "you" or "an average UW-Madison student"

        const conn = await pool.getConnection();

        // Delete existing ratings for this person for this participant
        await conn.execute(`DELETE FROM RoundRobinStudy.EmotionScenerio WHERE participant_id = ? AND ratingPerson = ?;`, [body.participant_id, ratingPerson]);

        if (body.ratings.length === 0) {
            conn.release();
            return Response.json({ data: { message: "No ratings inserted" } });
        }

        const values = body.ratings.map((rating: any) => [
            body.participant_id,
            rating.scenerio,
            rating.ratingPerson,
            rating.anger,
            rating.guilt,
            rating.sadness,
            rating.sympathy,
            rating.happiness,
            rating.anxiety,
            rating.boredom,
            rating.interest,
            rating.relief,
            rating.questionIndex
        ]);

        const [result] = await conn.query(
            `REPLACE INTO RoundRobinStudy.EmotionScenerio (participant_id, scenerio, ratingPerson, Anger, Guilt, Sadness, Sympathy, Happiness, Anxiety, Boredom, Interest, Relief, question_index) VALUES ?;`,
            [values]
        );
        conn.release();
        return Response.json({ data: result });
    } catch (error) {
        console.error("Error posting emotion ratings:", error);
        return Response.json({ error: "Failed to post emotion ratings" }, { status: 500 });
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
            `SELECT * FROM RoundRobinStudy.EmotionScenerio WHERE participant_id = ?;`,
            [participantId]
        );
        conn.release();
        return Response.json({ data: rows }, { status: 200 });

    } catch (error) {
        console.error("Error fetching emotion ratings:", error);
        return Response.json({ error: "Failed to fetch emotion ratings" }, { status: 500 });
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
