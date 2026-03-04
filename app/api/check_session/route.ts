import { poolPromise } from "@/lib/db";

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const participantId = url.searchParams.get("participant_id");
        const fullName = url.searchParams.get("full_name");
        const email = url.searchParams.get("email");

        if (!participantId || !fullName || !email) {
            return Response.json({ error: "Missing required fields: participant_id, full_name, or email" }, { status: 400 });
        }

        const pool = await poolPromise;
        const conn = await pool.getConnection();

        const [rows] = await conn.execute(
            `SELECT session_state FROM RoundRobinStudy.Participant WHERE participant_id = ? AND full_name = ? AND email = ?;`,
            [participantId, fullName, email]
        );
        conn.release();

        const typedRows = rows as any[];
        if (typedRows.length === 0) {
            return Response.json({ error: "Participant not found with the provided details" }, { status: 404 });
        }

        return Response.json({ session_state: typedRows[0].session_state }, { status: 200 });

    } catch (error) {
        console.error("Error fetching session state:", error);
        return Response.json({ error: "Failed to fetch session state" }, { status: 500 });
    }
}
