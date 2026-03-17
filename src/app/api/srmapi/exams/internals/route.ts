import { useMongo } from "@/lib/database/useMongo";
import { NextRequest, NextResponse } from "next/server";
import { isSessionValid } from "@/fullStackUtils/utils/functions";
import { fetchInternalMarks } from "@/backendUtils/srmapi/fetchInternals";
import { requireAuthResponse, errorResponse } from "@/backendUtils/utils/functions";
import { INVALID_CREDENTIALS, PARAMETERS, UNAUTHORIZED } from "@/fullStackUtils/utils/messages";

export async function POST(req: NextRequest) {
    const body = await req.json();
    let { sessionId } = body;

    if(!sessionId){
        return errorResponse(PARAMETERS);
    }

    const auth = await requireAuthResponse(req);
    if (auth instanceof NextResponse) return auth;

    try {
        const initDb = await useMongo();
        const db = initDb.db('college_db').collection("users1");
        const user = await db.findOne({ username: auth.payload.username });

        if (!user) {
            return errorResponse(UNAUTHORIZED, { action: "logout" });
        }

        const validSession = isSessionValid(user.session_time);
        
        if(validSession){
            const result = await fetchInternalMarks(sessionId ? sessionId : user.session);
            if (!result) {
                return errorResponse(INVALID_CREDENTIALS, { action: "logout" });
            }
            return NextResponse.json({ success: true, message: "Success!", internals: result });
        } else {
            return errorResponse(undefined);
        }

    } catch (err) {
        console.log("Error From /api/srmapi/exams/internals:- ", err);
        return errorResponse(undefined, {}, 500);
    }
}