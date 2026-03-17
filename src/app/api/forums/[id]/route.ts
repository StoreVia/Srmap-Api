import { ObjectId } from "mongodb";
import { useMongo } from "@/lib/database/useMongo";
import { NextRequest, NextResponse } from "next/server";
import { requireAuthResponse, errorResponse, isAdmin } from "@/backendUtils/utils/functions";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuthResponse(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    
    if (!ObjectId.isValid(id)) {
      return errorResponse("Invalid Forum Id!", {}, 400);
    }

    const initDb = await useMongo();
    const db = initDb.db("forums");
    const postsCollection = db.collection("data");
    const commentsCollection = db.collection("comments");

    const forum = await postsCollection.findOne(
      { _id: new ObjectId(id) },
      {
        projection: {
          username: 1,
          title: 1,
          description: 1,
          category: 1,
          createdAt: 1,
          status: 1,
          _id: 1
        }
      }
    );

    if (!forum) {
      return errorResponse("Forum Not Found!", {}, 404);
    }

    const commentCount = await commentsCollection.countDocuments({ postId: new ObjectId(id) });

    return NextResponse.json({ success: true, forum: { ...forum, commentCount } });
  } catch (error) {
    console.error("Error From /api/forums/[id]:- ", error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE( req: NextRequest, { params }: { params: Promise<{ id: string }> }){
  const auth = await requireAuthResponse(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    
    if (!ObjectId.isValid(id)) {
      return errorResponse("Invalid Forum ID!", {}, 400);
    }

    const initDb = await useMongo();
    const db = initDb.db("forums");
    const postsCollection = db.collection("data");
    const commentsCollection = db.collection("comments");

    const post = await postsCollection.findOne({ _id: new ObjectId(id) });
    
    if (!post) {
      return errorResponse("Forum Not Found!", {}, 404);
    }

    if (!isAdmin(auth.payload.username)) {
      return errorResponse("Only Admin Can Delete This Post!", {}, 403);
    }

    const session = initDb.startSession();
    
    try {
      await session.withTransaction(async () => {
        await postsCollection.deleteOne({ _id: new ObjectId(id) }, { session });
        await commentsCollection.deleteMany({ postId: new ObjectId(id) }, { session });
      });
    } finally {
      await session.endSession();
    }

    return NextResponse.json({ success: true, message: "Forum Post Deleted!" });
  } catch (error) {
    console.error("Error deleting forum post:", error);
    return NextResponse.json({ success: false, error: "Something Went Wrong!" }, { status: 500 });
  }
}