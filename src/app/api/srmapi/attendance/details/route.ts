import { DateTime } from "luxon";
import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { useMongo } from "@/lib/database/useMongo";
import { PARAMETERS } from "@/fullStackUtils/utils/messages";
import { errorResponse } from "@/backendUtils/utils/functions";
import { UNAUTHORIZED } from "@/fullStackUtils/utils/messages";
import { isSessionValid } from "@/fullStackUtils/utils/functions";
import { requireAuthResponse } from "@/backendUtils/utils/functions";
import { INVALID_CREDENTIALS } from "@/fullStackUtils/utils/messages";
import { fetchAttendance } from "@/backendUtils/srmapi/fetchCheckAttendance";

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { sessionId } = body;

    if (!sessionId) {
        return errorResponse(PARAMETERS);
    }

    const auth = await requireAuthResponse(req);
    if (auth instanceof NextResponse) return auth;

    try {
        const initDb = await useMongo();
        const db = initDb.db("college_db").collection("users1");
        const user = await db.findOne({ username: auth.payload.username });

        if (!user) {
            return errorResponse(UNAUTHORIZED, { action: "logout" });
        }

        const validSession = isSessionValid(user.session_time);

        if (!validSession) {
            return errorResponse(undefined);
        }

        const result = await fetchAttendance(sessionId || user.session);

        if (!result?.attendance) {
            return errorResponse(INVALID_CREDENTIALS, { action: "logout" });
        }

        return NextResponse.json({
            success: true,
            message: "Success!",
            attendance: {
                data: result.attendance,
                last_fetched: DateTime.now().toFormat("dd-MMMM-yyyy, hh:mm:ss a")
            }
        });
    } catch (err) {
        console.log("Error From /api/srmapi/attendance/details:- ", err);
        return errorResponse(undefined, {}, 500);
    }
}