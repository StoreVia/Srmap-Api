import { ObjectId } from "mongodb";
import { useMongo } from "@/lib/database/useMongo";
import { getTime } from "@/shared/utils/functions";
import { NextRequest, NextResponse } from "next/server";
import { requireAuthResponseAdmin, errorResponse } from "@/server/utils/functions";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
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
    return errorResponse(undefined, {}, 500);
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAuthResponseAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json().catch(() => ({}));
    const url = new URL(req.url);
    const notificationId = body.notificationId || body.id || url.searchParams.get("notificationId") || url.searchParams.get("id");

    if (!notificationId || !ObjectId.isValid(notificationId)) {
      return errorResponse("Required Parameters Not Matched!");
    }

    const initDb = await useMongo();
    const db = initDb.db("college_db").collection("notifications");

    const result = await db.deleteOne({ _id: new ObjectId(notificationId) });

    if (result.deletedCount === 0) {
      return errorResponse("Notification Not Found!", {}, 404);
    }

    return NextResponse.json({ success: true, message: "Deleted Notification!" });
  } catch (err) {
    return errorResponse(undefined, {}, 500);
  }
}