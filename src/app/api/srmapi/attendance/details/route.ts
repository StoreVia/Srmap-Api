import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { useMongo } from "@/lib/database/useMongo";
import { PARAMETERS } from "@/shared/utils/messages";
import { errorResponse } from "@/server/utils/functions";
import { UNAUTHORIZED } from "@/shared/utils/messages";
import { getFullDateAndTime, isSessionValid } from "@/shared/utils/functions";
import { requireAuthResponse } from "@/server/utils/functions";
import { INVALID_CREDENTIALS } from "@/shared/utils/messages";
import { fetchAttendance } from "@/server/srmapi/utils/fetchCheckAttendance";

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
        const db = initDb.db("college_db").collection("users");
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
                last_fetched: getFullDateAndTime()
            }
        });
    } catch (err) {
        console.log("Error From /api/srmapi/attendance/details:- ", err);
        return errorResponse(undefined, {}, 500);
    }
}