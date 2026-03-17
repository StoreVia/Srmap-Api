import { useMongo } from "@/lib/database/useMongo";
import { getTime } from "@/fullStackUtils/utils/functions";
import { NextRequest, NextResponse } from "next/server";
import { extractErrorMessage } from "@/fullStackUtils/utils/functions";
import { requireAuthResponseAdmin, errorResponse } from "@/backendUtils/utils/functions";

export async function POST(req: NextRequest) {
    const body = await req.json();
    let { notification } = body;

    if (!notification) {
        return errorResponse("Required Parameters Not Matched!");
    }

    const auth = await requireAuthResponseAdmin(req);
    if (auth instanceof NextResponse) return auth;

    try {
        const initDb = await useMongo();
        const db = initDb.db("college_db").collection("notifications");
        const createdAt = getTime();

        await db.insertOne({ notification, createdAt, notificationBy: auth.payload.username });

        const count = await db.countDocuments();
        if (count > 10) {
            const toDelete = count - 10;

            const cursor = db.find({}).sort({ createdAt: 1 }).limit(toDelete);
            for await (const doc of cursor) {
                await db.deleteOne({ _id: doc._id });
            }
        }

        return NextResponse.json({
            success: true,
            message: "Notification Added!",
            data: { notification, createdAt, notificationBy: auth.payload.username },
        });
    } catch (err) {
        console.error("Error From /api/admin/notification/add:- ", err);
        return errorResponse(undefined, {}, 500);
    }
}
