import { NextRequest, NextResponse } from "next/server";
import { getMoviesSummary } from "@/server/movies/catalog";
import { errorResponse, requireAuthResponse } from "@/server/utils/functions";

export async function GET(request: NextRequest) {
  const auth = await requireAuthResponse(request);
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
    console.error("Unable to load movies summary", error);
    return errorResponse("Unable to load movies.", {}, 500);
  }
}