import { useMongo } from "@/lib/database/useMongo";
import { NextRequest, NextResponse } from "next/server";
import { isSessionValid } from "@/fullStackUtils/utils/functions";
import { submitFeedback } from "@/backendUtils/srmapi/submitFeedback";
import { PARAMETERS, UNAUTHORIZED } from "@/fullStackUtils/utils/messages";
import { requireAuthResponse, errorResponse } from "@/backendUtils/utils/functions";

export async function POST(req: NextRequest) {
    const body = await req.json();
    let { sessionId, comment, optionNo } = body;

    if (!sessionId || !comment || !optionNo) {
        return errorResponse(PARAMETERS);
    }

    const auth = await requireAuthResponse(req);
    if (auth instanceof NextResponse) return auth;

    try {
        const initDb = await useMongo();
        const db = initDb.db('college_db').collection("users1");
        const settingsDb = initDb.db('college_db').collection("settings");

        const user = await db.findOne({ username: auth.payload.username });
        const settings = await settingsDb.findOne({ id: "app-settings" });

        if (!user) {
            return errorResponse(UNAUTHORIZED);
        }

        if (settings?.feedback === false) {
            return errorResponse("Feedback Isn't Enabled By Developer!");
        }

        const validSession = isSessionValid(user.session_time);

        if (validSession && sessionId) {
            try {
                const { success, message } = await submitFeedback(sessionId, comment, optionNo);
                if(!success){
                    return NextResponse.json({ success: false, message }, { status: 200 });
                }
                const result = await settingsDb.findOneAndUpdate({ id: "feedback" }, { $inc: { count: 1 } }, { upsert: true, returnDocument: "after" });
                return NextResponse.json({ success, message });
            } catch (error) {
                console.error("Error From /api/srmapi/feedback(Submittion):- ", error);
                return errorResponse(undefined, {}, 500);
            }
        } else {
            return errorResponse("Something Went Wrong!", { action: "logout" });
        }

    } catch (err) {
        console.log("Error From /api/srmapi/feedback:- ", err);
        return errorResponse(undefined, {}, 500);
    }
}