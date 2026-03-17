import { useMongo } from "@/lib/database/useMongo";
import { NextRequest, NextResponse } from "next/server";
import { requireAuthResponseAdmin, errorResponse } from "@/backendUtils/utils/functions";

export async function POST(req: NextRequest) {
    const auth = await requireAuthResponseAdmin(req);
    if (auth instanceof NextResponse) return auth;

    if (auth.payload.username?.trim() != "AP24110010198") {
        return errorResponse("You don't have main admin permissions.");
    }

    try {
        const initDb = await useMongo();
        const db = initDb.db("college_db").collection("settings");

        await db.updateOne(
            { id: "feedback" },
            { $set: { count: 0 } }
        );

        return NextResponse.json({ success: true });
    } catch (err) {
        console.log("Error From /api/admin/settings/feedback/reset:- ", err);
        return errorResponse(undefined, {}, 500);
    }
}