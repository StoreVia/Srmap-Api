import { ObjectId } from "mongodb";
import { useMongo } from "@/lib/database/useMongo";
import { NextRequest, NextResponse } from "next/server";
import { VALIDATION } from "@/fullStackUtils/utils/messages";
import { requireAuthResponse, errorResponse } from "@/backendUtils/utils/functions";

// GET METHOD
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
    const commentsCollection = db.collection("comments");

    const comments = await commentsCollection.find({ postId: new ObjectId(id) })
      .sort({ createdAt: -1 })
      .project({
        username: 1,
        content: 1,
        createdAt: 1,
        isPinned: 1,
        _id: 1
      })
      .toArray();

    return NextResponse.json({ success: true, comments });
  } catch (error) {
    console.error("Error From /api/forums/[id]/comments(get):- ", error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

// POST METHOD
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuthResponse(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const { content } = await req.json();

    if (!ObjectId.isValid(id)) {
      return errorResponse("Invalid Forum Id!", {}, 400);
    }

    if (!content || !content.trim()) {
      return errorResponse("Comment Content Is Required!", {}, 400);
    }

    if (content.length > 2048) {
      return errorResponse(VALIDATION);
    }

    const initDb = await useMongo();
    const db = initDb.db("forums");
    const postsCollection = db.collection("data");
    const commentsCollection = db.collection("comments");

    const post = await postsCollection.findOne({ _id: new ObjectId(id) });

    if (!post) {
      return errorResponse("Forum Not Found!", {}, 404);
    }

    if (post.status !== "open") {
      return errorResponse("Forum Closed!", {}, 400);
    }

    const comment = {
      postId: new ObjectId(id),
      username: auth.payload.username,
      content: content.trim(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await commentsCollection.insertOne(comment);

    return NextResponse.json({
      success: true,
      comment: {
        _id: result.insertedId,
        username: comment.username,
        content: comment.content,
        createdAt: comment.createdAt
      }
    });
  } catch (error) {
    console.error("Error From /api/forums/[id]/comments(post):- ", error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}