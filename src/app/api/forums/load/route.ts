import { ObjectId } from "mongodb";
import { useMongo } from "@/lib/database/useMongo";
import { NextRequest, NextResponse } from "next/server";
import { requireAuthResponse, errorResponse } from "@/backendUtils/utils/functions";

export async function GET(req: NextRequest) {
  const auth = await requireAuthResponse(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);
    const searchQuery = url.searchParams.get("search");

    const lastCreatedAtParam = url.searchParams.get("lastCreatedAt");
    const lastIdParam = url.searchParams.get("lastId");

    const initDb = await useMongo();
    const db = initDb.db("forums").collection("data");

    let query: any = {};

    if (searchQuery) {
      query = {
        $or: [
          { title: { $regex: searchQuery, $options: "i" } },
          { description: { $regex: searchQuery, $options: "i" } },
          { username: { $regex: searchQuery, $options: "i" } }
        ]
      };
    } else if (lastCreatedAtParam && lastIdParam) {
      const lastCreatedAt = new Date(lastCreatedAtParam);
      const lastId = new ObjectId(lastIdParam);

      query = {
        $or: [
          { createdAt: { $lt: lastCreatedAt } },
          {
            $and: [
              { createdAt: { $eq: lastCreatedAt } },
              { _id: { $lt: lastId } },
            ],
          },
        ],
      };
    }

    const forums = await db
      .find(query)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit)
      .project({
        username: 1,
        title: 1,
        description: 1,
        category: 1,
        createdAt: 1,
        status: 1,
        _id: 1,
      })
      .toArray();

    return NextResponse.json({ success: true, forums });
  } catch (error) {
    console.error("Error From /api/forums/load:- ", error);
    return errorResponse("Internal Server Error");
  }
}