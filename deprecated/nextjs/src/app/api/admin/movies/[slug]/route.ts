import { NextRequest, NextResponse } from "next/server";
import { getMovie, updateMovie, deleteMovie } from "@/server/movies/catalog";
import { errorResponse, requireAuthResponseAdmin } from "@/server/utils/functions";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const auth = await requireAuthResponseAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { slug } = await params;
    const movie = await getMovie(slug);
    if (!movie) {
      return errorResponse("Movie not found.", {}, 404);
    }
    return NextResponse.json({ success: true, data: movie });
  } catch (error) {
    console.error("Unable to load movie details (admin)", error);
    return errorResponse("Unable to load movie details.", {}, 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const auth = await requireAuthResponseAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { slug } = await params;
    const body = await request.json();
    const updated = await updateMovie(slug, body);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("Error updating movie/series:", error);
    return errorResponse(error?.message || "Failed to update movie/series.", {}, 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const auth = await requireAuthResponseAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { slug } = await params;
    const success = await deleteMovie(slug);
    if (!success) {
      return errorResponse("Movie/Series not found or already deleted.", {}, 404);
    }
    return NextResponse.json({ success: true, message: "Deleted successfully." });
  } catch (error: any) {
    console.error("Error deleting movie/series:", error);
    return errorResponse(error?.message || "Failed to delete movie/series.", {}, 500);
  }
}