import { ObjectId } from "mongodb";
import { useMongo } from "@/lib/database/useMongo";
import { NextRequest, NextResponse } from "next/server";
import { PARAMETERS, VALIDATION } from "@/fullStackUtils/utils/messages";
import { requireAuthResponse, errorResponse } from "@/backendUtils/utils/functions";

export async function POST(req: NextRequest) {
  const auth = await requireAuthResponse(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { title, description, category } = await req.json();

    if (!title || !description || !category) {
      return errorResponse(PARAMETERS);
    }

    if (title.length > 256 || description.length > 2048) {
      return errorResponse(VALIDATION);
    }

    const initDb = await useMongo();
    const db = initDb.db("forums");
    const postsCollection = db.collection("data");
    const categoriesCollection = db.collection("categories");

    const categoryExists = await categoriesCollection.findOne({ _id: new ObjectId(category.toString()) });
    if (!categoryExists) {
      return errorResponse("Invalid Category", {}, 400);
    }

    const forum = {
      username: auth.payload.username,
      title: title.trim(),
      description: description.trim(),
      category: categoryExists.name,
      createdAt: new Date(),
      status: "open"
    };

    const result = await postsCollection.insertOne(forum);

    return NextResponse.json({
      success: true,
      forum: {
        _id: result.insertedId,
        ...forum
      }
    });
  } catch (error) {
    console.error("Error creating forum post:", error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}