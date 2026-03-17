import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { login } from "@/backendUtils/auth/login";
import { useMongo } from "@/lib/database/useMongo";
import { getTime } from "@/fullStackUtils/utils/functions";
import { errorResponse } from "@/backendUtils/utils/functions";
import { UNAUTHORIZED } from "@/fullStackUtils/utils/messages";
import { needsRefresh } from "@/fullStackUtils/utils/functions";
import { requireAuthResponse } from "@/backendUtils/utils/functions";
import { INVALID_CREDENTIALS } from "@/fullStackUtils/utils/messages";

export async function GET(req: NextRequest) {
    const auth = await requireAuthResponse(req);
    if (auth instanceof NextResponse) return auth;

    try {
        const initDb = await useMongo();
        const db = initDb.db("college_db").collection("users1");

        const time = getTime();
        const user = await db.findOne({ username: auth.payload.username });

        if (!user) return errorResponse(UNAUTHORIZED, { action: "logout" });
        if (!needsRefresh(user.session_time)) {
            return errorResponse(UNAUTHORIZED, { action: "logout" }, 429);
        }

        const result = await login(auth.payload.username, auth.payload.password);

        if (!result || !result.success) {
            return errorResponse(INVALID_CREDENTIALS, { action: "logout" });
        }

        const limit = Number(process.env.LIMIT) + 1;

        await db.updateOne(
            { username: auth.payload.username },
            {
                $set: {
                    limit: limit,
                    session_time: time
                }
            }
        );
        return NextResponse.json({ success: true, message: "Success!", sessionId: result.sessionId, sessionTime: time });
    } catch (err) {
        console.log("Error From /api/srmapi/refreshData:- ", err);
        return errorResponse(undefined, {}, 500);
    }
}