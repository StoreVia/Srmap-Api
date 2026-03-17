import { useMongo } from "@/lib/database/useMongo";
import { login } from "@/backendUtils/auth/login";
import { NextRequest, NextResponse } from "next/server";
import { getTime } from "@/fullStackUtils/utils/functions";
import { INVALID_CREDENTIALS, UNAUTHORIZED } from "@/fullStackUtils/utils/messages";
import { requireAuthResponse, errorResponse, decryptData } from "@/backendUtils/utils/functions";

export async function GET(req: NextRequest) {
    const auth = await requireAuthResponse(req);
    if (auth instanceof NextResponse) return auth;

    try {
        const initDb = await useMongo();
        const time = getTime();
        const db = initDb.db('college_db').collection("users1");
        const user = await db.findOne({ username: auth.payload.username });
        let limit = user?.limit || (Number(process.env.LIMIT) + 1);

        if(!user){
            return errorResponse(UNAUTHORIZED);
        }

        if (limit <= 0) {
            const isValid = decryptData(user.data, auth.payload.password);
            if (!isValid) {
                return errorResponse(INVALID_CREDENTIALS);
            }
            return errorResponse("User Limit Exceeded!", {}, 429);
        }

        const result = await login(auth.payload.username, auth.payload.password);

        if (!result || !result.success) {
            return errorResponse(INVALID_CREDENTIALS, { action: "logout" });
        } else {
            limit -= 1;
            await db.updateOne(
                { username: auth.payload.username },
                {
                    $set: {
                        limit: limit,
                        session_time: time
                    },
                },
                { upsert: true }
            );
            return NextResponse.json({success: true, message: "Success!", sessionId: result.sessionId, sessionTime: time });
        }
    } catch (err) {
        console.log("Error From /api/auth/initiate/session:- ", err);
        return errorResponse(undefined, {}, 500);
    }
}