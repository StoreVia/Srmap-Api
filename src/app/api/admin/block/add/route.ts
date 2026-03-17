import { useMongo } from "@/lib/database/useMongo";
import { NextRequest, NextResponse } from "next/server";
import { getTime } from "@/fullStackUtils/utils/functions";
import { requireAuthResponseAdmin, errorResponse, isAdmin } from "@/backendUtils/utils/functions";

export async function POST(req: NextRequest) {
    const body = await req.json();
    let { username } = body;

    if (!username) {
        return errorResponse("Required Parameters Not Matched!");
    }

    username = username.toUpperCase();

    const auth = await requireAuthResponseAdmin(req);
    if (auth instanceof NextResponse) return auth;

    try {
        const initDb = await useMongo();
        const db = initDb.db('college_db').collection("blocked");
        const userDb = initDb.db('college_db').collection("users1");
        const blockedAt = getTime();

        if(await db.findOne({ username })) {
            return errorResponse(`Username Already Blocked!`, {}, 404);
        }

        if(!await userDb.findOne({ username })){
            return errorResponse(`User Not Found In Database!`, {}, 403);
        }

        if(isAdmin(username)){
            return errorResponse(`Admin Cannot Be Blocked!`, {}, 403);
        }

        await db.insertOne({ username, blockedAt, blockedBy: auth.payload.username });
        return NextResponse.json({
            success: true,
            message: `User ${username} Blocked!`,
            data: { username, blockedAt, blockedBy: auth.payload.username },
        });
    } catch (err) {
        console.log("Error From /api/admin/block/add:- ", err);
        return errorResponse(undefined, {}, 500);
    }
}