import { poolPromise } from "@/lib/db";

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const sessionDate = url.searchParams.get("session_date");
        const sessionTime = url.searchParams.get("session_time");

        const pool = await poolPromise;
        const conn = await pool.getConnection();

        if (sessionDate && sessionTime) {
            // Find participants whose availability_string contains the session date and time
            // Because availability_string format wasn't strictly defined as JSON, we'll try a flexible search.
            // Adjust this LIKE pattern if the actual format is known (e.g. JSON string).
            const searchPattern = `%${sessionDate}%${sessionTime}%`;
            const [rows] = await conn.execute(`SELECT participant_id, availability_string FROM RoundRobinStudy.Availability WHERE availability_string LIKE ?;`, [searchPattern]);
            conn.release();
            return Response.json({ data: rows }, { status: 200 });
        } else {
            // Return all available times to populate the dropdown
            const [rows] = await conn.execute(`SELECT session_date, session_time FROM RoundRobinStudy.AvailableTimes;`);
            conn.release();
            return Response.json({ data: rows }, { status: 200 });
        }

    } catch (error) {
        console.error("Error fetching available times:", error);
        return Response.json({ error: "Failed to fetch available times" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { added = [], deleted = [] } = body;

        const pool = await poolPromise;
        const conn = await pool.getConnection();

        await conn.beginTransaction();

        try {
            for (const time of deleted) {
                await conn.execute(
                    `DELETE FROM RoundRobinStudy.AvailableTimes WHERE session_date = ? AND session_time = ?`,
                    [time.session_date, time.session_time]
                );
            }
            for (const time of added) {
                await conn.execute(
                    `INSERT INTO RoundRobinStudy.AvailableTimes (session_date, session_time) VALUES (?, ?)`,
                    [time.session_date, time.session_time]
                );
            }
            await conn.commit();
        } catch (e) {
            await conn.rollback();
            throw e;
        } finally {
            conn.release();
        }

        return Response.json({ message: "Successfully updated available times" }, { status: 200 });

    } catch (error) {
        console.error("Error updating available times:", error);
        return Response.json({ error: "Failed to update available times" }, { status: 500 });
    }
}
