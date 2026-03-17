import { ObjectId } from "mongodb";
import { useMongo } from "@/lib/database/useMongo";
import { NextRequest, NextResponse } from "next/server";
import { requireAuthResponseAdmin, errorResponse } from "@/backendUtils/utils/functions";

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { notificationId } = body;

    if (!ObjectId.isValid(notificationId)) {
        return errorResponse("Required Parameters Not Matched!");
    }

    const auth = await requireAuthResponseAdmin(req);
    if (auth instanceof NextResponse) return auth;

    try {
        const initDb = await useMongo();
        const db = initDb.db('college_db').collection("notifications");

        const result = await db.deleteOne({ _id: new ObjectId(notificationId) });

        if (result.deletedCount === 0) {
            return errorResponse("Notification Not Found!", {}, 404);
        }

        return NextResponse.json({ success: true, message: `Deleted Notification!` });
    } catch (err) {
        console.log("Error From /api/admin/notification/remove:- ", err);
        return errorResponse(undefined, {}, 500);
    }
}
