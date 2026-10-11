import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { requireAuthResponse, errorResponse } from "@/server/utils/functions";
import { useSecondaryMongo } from "@/lib/database/useMongo";

export async function GET(req: NextRequest) {
  const auth = await requireAuthResponse(req);
  if (auth instanceof NextResponse) return auth;

  const url = new URL(req.url);
  const type = url.searchParams.get("type") === "staff" ? "staff" : "faculty";
  const search = (url.searchParams.get("search") || "").trim();
  const lastId = url.searchParams.get("lastId");

  try {
    const client = await useSecondaryMongo();
    const db = client.db("faculty");
    const collection = db.collection(type);

    const query: Record<string, any> = {};

    if (lastId) {
      if (ObjectId.isValid(lastId)) {
        query._id = { $gt: new ObjectId(lastId) };
      } else {
        query._id = { $gt: lastId };
      }
    }

    const slug = (url.searchParams.get("slug") || "").trim();

    if (slug) {
      query.slug = slug;
    } else if (search) {
      const searchRegex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      query.$or = [
        { name: searchRegex },
        { slug: searchRegex },
        { designation: searchRegex },
        { departments: searchRegex },
        { email: searchRegex }
      ];
    }

    const PAGE_SIZE = 20;
    const projection = type === "faculty" && !slug ? {
      name: 1,
      slug: 1,
      designation: 1,
      departments: 1,
      degree: 1,
      email: 1,
      imageUrl: 1,
      officeLocation: 1,
      ratingSummary: 1
    } : undefined;

    const items = await collection
      .find(query, { projection })
      .sort({ _id: 1 })
      .limit(PAGE_SIZE + 1)
      .toArray();

    const hasMore = items.length > PAGE_SIZE;
    const rawResultItems = hasMore ? items.slice(0, PAGE_SIZE) : items;
    const resultItems = rawResultItems.map((item: any) => {
      let name = item.name || "";
      const half = name.length / 2;
      if (name.length % 2 === 0 && name.slice(0, half) === name.slice(half)) {
        name = name.slice(0, half);
      }
      name = name.replace(/^(Prof\.|Dr\.)([^\s])/i, "$1 $2");
      return { ...item, name };
    });
    const nextLastId = resultItems.length > 0 ? String(resultItems[resultItems.length - 1]._id) : null;

    return NextResponse.json({
      success: true,
      data: {
        items: resultItems,
        hasMore,
        nextLastId
      }
    });
  } catch (err: any) {
    return errorResponse(err.message || "Failed to load directory", {}, 500);
  }
}
