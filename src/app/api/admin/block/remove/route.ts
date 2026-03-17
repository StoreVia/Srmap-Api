import { useMongo } from "@/lib/database/useMongo";
import { NextRequest, NextResponse } from "next/server";
import { requireAuthResponseAdmin, errorResponse } from "@/backendUtils/utils/functions";

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { username } = body;

    if (!username) {
        return errorResponse("Required Parameters Not Matched!");
    }

    const auth = await requireAuthResponseAdmin(req);
    if (auth instanceof NextResponse) return auth;

    try {
        const initDb = await useMongo();
        const db = initDb.db('college_db').collection("blocked");

        const result = await db.deleteOne({ username });

        if (result.deletedCount === 0) {
            return errorResponse("User Was Not Found In Blocked List!", {}, 404);
        }

        return NextResponse.json({ success: true, message: `User ${username} Unblocked!` });
    } catch (err) {
        console.log("Error From /api/admin/block/remove:- ", err);
        return errorResponse(undefined, {}, 500);
    }
}
