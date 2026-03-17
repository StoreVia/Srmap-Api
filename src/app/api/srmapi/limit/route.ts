import { useMongo } from "@/lib/database/useMongo";
import { NextRequest, NextResponse } from "next/server";
import { UNAUTHORIZED } from "@/fullStackUtils/utils/messages";
import { requireAuthResponse, errorResponse } from "@/backendUtils/utils/functions";

export async function GET(req: NextRequest) {
    const auth = await requireAuthResponse(req);
    if (auth instanceof NextResponse) return auth;

    try {
        const initDb = await useMongo();
        const db = initDb.db('college_db').collection("users1");
        const user = await db.findOne({ username: auth.payload.username }, { projection: { _id: 0, limit: 1 } });

        if (!user) {
            return errorResponse(UNAUTHORIZED);
        }

        return NextResponse.json({ success: true, message: "Success!", limit: user.limit || 0 });
    } catch (err) {
        console.log("Error From /api/srmapi/limit:- ", err);
        return errorResponse(undefined, {}, 500);
    }
}