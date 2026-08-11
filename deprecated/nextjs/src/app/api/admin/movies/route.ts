import { NextRequest, NextResponse } from "next/server";
import { getMoviesSummary, createMovie } from "@/server/movies/catalog";
import { errorResponse, requireAuthResponseAdmin } from "@/server/utils/functions";

export async function GET(request: NextRequest) {
  const auth = await requireAuthResponseAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || undefined;
    const featuredOnly = searchParams.get("featured") === "true";

    const result = await getMoviesSummary({ page, limit, search, category, featuredOnly });
    return NextResponse.json({
      success: true,
      data: result.items,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Unable to load movies summary (admin)", error);
    return errorResponse("Unable to load movies.", {}, 500);
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuthResponseAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    if (!body.Name || !body.Slug || !body.type) {
      return errorResponse("Missing required fields: Name, Slug, and type.", {}, 400);
    }
    const created = await createMovie(body);
    return NextResponse.json({ success: true, data: created });
  } catch (error: any) {
    console.error("Error creating movie/series:", error);
    return errorResponse(error?.message || "Failed to create movie/series.", {}, 500);
  }
}