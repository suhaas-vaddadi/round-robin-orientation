import { NextRequest, NextResponse } from "next/server";
import { poolPromise } from "@/lib/db";

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const participantId = url.searchParams.get("participant_id");

        if (!participantId) {
            return Response.json({ error: "Missing participant_id" }, { status: 400 });
        }

        const pool = await poolPromise;
        const conn = await pool.getConnection();

        // queries to check if at least one row exists for this participant ID in each table
        const [autismRows] = await conn.execute(`SELECT 1 FROM RoundRobinStudy.Autism WHERE participant_id = ? LIMIT 1;`, [participantId]);
        const [emotionRows] = await conn.execute(`SELECT 1 FROM RoundRobinStudy.EmotionScenerio WHERE participant_id = ? LIMIT 1;`, [participantId]);
        const [expressivityRows] = await conn.execute(`SELECT 1 FROM RoundRobinStudy.Expressivity WHERE participant_id = ? LIMIT 1;`, [participantId]);
        const [lonelinessRows] = await conn.execute(`SELECT 1 FROM RoundRobinStudy.Loneliness WHERE participant_id = ? LIMIT 1;`, [participantId]);
        const [selfFrequencyRows] = await conn.execute(`SELECT 1 FROM RoundRobinStudy.SelfFrequency WHERE participant_id = ? LIMIT 1;`, [participantId]);
        const [socialRows] = await conn.execute(`SELECT 1 FROM RoundRobinStudy.SocialConnectedness WHERE participant_id = ? LIMIT 1;`, [participantId]);
        const [availabilityRows] = await conn.execute(`SELECT 1 FROM RoundRobinStudy.Availability WHERE participant_id = ? LIMIT 1;`, [participantId]);
        const [demographicsRows] = await conn.execute(`SELECT 1 FROM RoundRobinStudy.Demographics WHERE participant_id = ? LIMIT 1;`, [participantId]);

        const [participantRows] = await conn.execute(`SELECT session_state FROM RoundRobinStudy.Participant WHERE participant_id = ? LIMIT 1;`, [participantId]);

        conn.release();

        const completionStatus = {
            autism: Array.isArray(autismRows) && autismRows.length > 0,
            emotionScenerio: Array.isArray(emotionRows) && emotionRows.length > 0,
            expressivity: Array.isArray(expressivityRows) && expressivityRows.length > 0,
            loneliness: Array.isArray(lonelinessRows) && lonelinessRows.length > 0,
            selfFrequency: Array.isArray(selfFrequencyRows) && selfFrequencyRows.length > 0,
            socialConnectedness: Array.isArray(socialRows) && socialRows.length > 0,
            availability: Array.isArray(availabilityRows) && availabilityRows.length > 0,
            demographics: Array.isArray(demographicsRows) && demographicsRows.length > 0,
            sessionState: Array.isArray(participantRows) && participantRows.length > 0 ? (participantRows as any)[0].session_state : null
        };

        return Response.json({ data: completionStatus }, { status: 200 });

    } catch (error) {
        console.error("Error fetching completion status:", error);
        return Response.json({ error: "Failed to fetch completion status" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { participant_id, session_state } = body;

        if (!participant_id || session_state === undefined) {
            return Response.json({ error: "Missing participant_id or session_state" }, { status: 400 });
        }

        const pool = await poolPromise;
        const conn = await pool.getConnection();

        await conn.execute(
            `UPDATE RoundRobinStudy.Participant SET session_state = ? WHERE participant_id = ?;`,
            [session_state, participant_id]
        );

        conn.release();

        return Response.json({ message: "Session state updated successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error updating session state:", error);
        return Response.json({ error: "Failed to update session state" }, { status: 500 });
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
