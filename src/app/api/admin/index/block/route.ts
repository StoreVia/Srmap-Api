import { useMongo } from "@/lib/database/useMongo";
import { NextRequest, NextResponse } from "next/server";
import { getTime } from "@/shared/utils/functions";
import { requireAuthResponseAdmin, errorResponse, isAdmin } from "@/server/utils/functions";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  let { username } = body;

  if (!username) {
    return errorResponse("Required Parameters Not Matched!");
  }

  username = username.toUpperCase();

  const auth = await requireAuthResponseAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const initDb = await useMongo();
    const db = initDb.db("college_db").collection("blocked");
    const userDb = initDb.db("college_db").collection("users");
    const blockedAt = getTime();

    if (await db.findOne({ username })) {
      return errorResponse("Username Already Blocked!", {}, 404);
    }

    if (!await userDb.findOne({ username })) {
      return errorResponse("User Not Found In Database!", {}, 403);
    }

    if (isAdmin(username)) {
      return errorResponse("Admin Cannot Be Blocked!", {}, 403);
    }

    await db.insertOne({ username, blockedAt, blockedBy: auth.payload.username });
    return NextResponse.json({
      success: true,
      message: `User ${username} Blocked!`,
      data: { username, blockedAt, blockedBy: auth.payload.username },
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
    const username = (body.username || url.searchParams.get("username"))?.toUpperCase();

    if (!username) {
      return errorResponse("Required Parameters Not Matched!");
    }

    const initDb = await useMongo();
    const db = initDb.db("college_db").collection("blocked");

    const result = await db.deleteOne({ username });

    if (result.deletedCount === 0) {
      return errorResponse("User Was Not Found In Blocked List!", {}, 404);
    }

    return NextResponse.json({ success: true, message: `User ${username} Unblocked!` });
  } catch (err) {
    return errorResponse(undefined, {}, 500);
  }
}
