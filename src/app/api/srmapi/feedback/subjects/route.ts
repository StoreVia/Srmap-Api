import { useMongo } from "@/lib/database/useMongo";
import { NextRequest, NextResponse } from "next/server";
import { isSessionValid } from "@/shared/utils/functions";
import { PARAMETERS, UNAUTHORIZED } from "@/shared/utils/messages";
import { requireAuthResponse, errorResponse } from "@/server/utils/functions";
import { fetchFeedbackSubjects } from "@/server/srmapi/feedback/feedbackSubjects";

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
        const db = initDb.db('college_db').collection("users");
        const user = await db.findOne({ username: auth.payload.username });

        if (!user) return errorResponse(UNAUTHORIZED);
        if (!isSessionValid(user.session_time)) return errorResponse("Something Went Wrong!", { action: "logout" });

        const { subjects } = await fetchFeedbackSubjects(sessionId);

        if (subjects.length === 0) {
            return NextResponse.json({ success: false, message: 'No subjects found, feedback may have already been submitted!' });
        }

        return NextResponse.json({ success: true, subjects });
    } catch (err) {
        console.error("Error From /api/srmapi/feedback/subjects:- ", err);
        return errorResponse(undefined, {}, 500);
    }
}