import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { requireAuthResponse, errorResponse } from "@/server/utils/functions";
import { useSecondaryMongo } from "@/lib/database/useMongo";
import { matchFacultyProfiles } from "@/server/faculty/timetableService";

export async function GET(req: NextRequest) {
  const auth = await requireAuthResponse(req);
  if (auth instanceof NextResponse) return auth;

  const url = new URL(req.url);
  const type = url.searchParams.get("type") === "staff" ? "staff" : "faculty";
  const search = (url.searchParams.get("search") || "").trim();
  const slug = (url.searchParams.get("slug") || "").trim();
  const sort = url.searchParams.get("sort") || "default";
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
  const PAGE_SIZE = 20;
  const skip = (page - 1) * PAGE_SIZE;

  try {
    const client = await useSecondaryMongo();
    const db = client.db("faculty");
    const collection = db.collection(type);

    const query: Record<string, any> = {};

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

    const projection: Record<string, any> = type === "faculty" && !slug ? {
      name: 1,
      slug: 1,
      designation: 1,
      departments: 1,
      degree: 1,
      email: 1,
      imageUrl: 1,
      officeLocation: 1,
      ratingSummary: 1
    } : {};

    const pipeline: any[] = [{ $match: query }];

    if (type === "faculty" && !slug) {
      if (sort === "rating_high") {
        pipeline.push(
          {
            $addFields: {
              hasRating: {
                $cond: [
                  { $and: [{ $ne: ["$ratingSummary", null] }, { $gt: ["$ratingSummary.totalRatings", 0] }] },
                  1,
                  0
                ]
              },
              sortRating: { $ifNull: ["$ratingSummary.overallAvg", 0] }
            }
          },
          { $sort: { hasRating: -1, sortRating: -1, _id: 1 } }
        );
      } else if (sort === "rating_low") {
        pipeline.push(
          {
            $addFields: {
              hasRating: {
                $cond: [
                  { $and: [{ $ne: ["$ratingSummary", null] }, { $gt: ["$ratingSummary.totalRatings", 0] }] },
                  1,
                  0
                ]
              },
              sortRating: { $ifNull: ["$ratingSummary.overallAvg", 999] }
            }
          },
          { $sort: { hasRating: -1, sortRating: 1, _id: 1 } }
        );
      } else {
        pipeline.push({ $sort: { _id: 1 } });
      }
    } else {
      pipeline.push({ $sort: { _id: 1 } });
    }

    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: PAGE_SIZE + 1 });

    if (Object.keys(projection).length > 0) {
      pipeline.push({ $project: projection });
    }

    const items = await collection.aggregate(pipeline).toArray();
    const hasMore = items.length > PAGE_SIZE;
    const rawResultItems = hasMore ? items.slice(0, PAGE_SIZE) : items;
    const resultItems = rawResultItems.map((item: any) => {
      let name = item.name || "";
      const half = name.length / 2;
      if (name.length % 2 === 0 && name.slice(0, half) === name.slice(half)) {
        name = name.slice(0, half);
      }
      name = name.replace(/^(Prof\.|Dr\.)([^\s])/i, "$1 $2");
      return { ...item, _id: item._id?.toString() || item.slug, name };
    });

    return NextResponse.json({
      success: true,
      data: {
        items: resultItems,
        hasMore,
        nextPage: hasMore ? page + 1 : null,
        page
      }
    });
  } catch (err: any) {
    return errorResponse(err.message || "Failed to load directory", {}, 500);
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuthResponse(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const facultyNames = Array.isArray(body?.facultyNames) ? body.facultyNames : [];
    const results = await matchFacultyProfiles(facultyNames);
    return NextResponse.json({ success: true, data: results });
  } catch (err: any) {
    return errorResponse(err.message || "Failed to match assigned faculty", {}, 500);
  }
}
