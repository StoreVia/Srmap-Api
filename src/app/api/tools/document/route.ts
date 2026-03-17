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
        const user = await db.findOne({ username: auth.payload.username }, { projection: { _id: 0 } });

        if (!user) {
            return errorResponse(UNAUTHORIZED, { action: "logout" });
        }

        return NextResponse.json({ success: true, document: user });
    } catch (err) {
        console.log("Error From /api/tools/document:- ", err);
        return errorResponse(undefined, {}, 500);
    }
}