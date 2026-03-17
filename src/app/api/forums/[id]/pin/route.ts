import { ObjectId } from "mongodb";
import { useMongo } from "@/lib/database/useMongo";
import { NextRequest, NextResponse } from "next/server";
import { requireAuthResponse, errorResponse, isAdmin } from "@/backendUtils/utils/functions";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuthResponse(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const { commentId } = await req.json();
    
    if (!ObjectId.isValid(id) || !ObjectId.isValid(commentId)) {
      return errorResponse("Invalid ID", {}, 400);
    }

    const initDb = await useMongo();
    const db = initDb.db("forums");
    const postsCollection = db.collection("data");
    const commentsCollection = db.collection("comments");

    const post = await postsCollection.findOne({ _id: new ObjectId(id) });
    
    if (!post) {
      return errorResponse("Forum post not found", {}, 404);
    }

    if (post.username !== auth.payload.username && !isAdmin(auth.payload.username)) {
      return errorResponse("Only the post owner can pin answers", {}, 403);
    }

    if (post.status !== "open") {
      return errorResponse("Cannot pin answers in closed forums", {}, 400);
    }

    const comment = await commentsCollection.findOne({ 
      _id: new ObjectId(commentId),
      postId: new ObjectId(id)
    });
    
    if (!comment) {
      return errorResponse("Comment not found", {}, 404);
    }

    await postsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { pinnedAnswer: commentId, updatedAt: new Date() } }
    );

    await commentsCollection.updateMany(
      { postId: new ObjectId(id) },
      { $set: { isPinned: false } }
    );

    await commentsCollection.updateOne(
      { _id: new ObjectId(commentId) },
      { $set: { isPinned: true } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error pinning answer:", error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}