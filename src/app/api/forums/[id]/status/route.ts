import { ObjectId } from "mongodb";
import { useMongo } from "@/lib/database/useMongo";
import { NextRequest, NextResponse } from "next/server";
import { requireAuthResponse, errorResponse, isAdmin } from "@/backendUtils/utils/functions";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }){
  const auth = await requireAuthResponse(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const { status } = await req.json();
    
    if (!ObjectId.isValid(id)) {
      return errorResponse("Invalid forum ID", {}, 400);
    }

    if (!["open", "closed"].includes(status)) {
      return errorResponse("Invalid Status", {}, 400);
    }

    const initDb = await useMongo();
    const db = initDb.db("forums");
    const postsCollection = db.collection("data");

    const post = await postsCollection.findOne({ _id: new ObjectId(id) });
    
    if (!post) {
      return errorResponse("Forum post not found", {}, 404);
    }

    if (post.username !== auth.payload.username && !isAdmin(auth.payload.username)) {
      return errorResponse("Only the post owner can change status", {}, 403);
    }

    await postsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status, updatedAt: new Date() } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating forum status:", error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}