import { NextRequest, NextResponse } from "next/server";
import { getMovie } from "@/server/movies/catalog";
import { errorResponse, requireAuthResponse } from "@/server/utils/functions";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const auth = await requireAuthResponse(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { slug } = await params;
    const movie = await getMovie(slug);
    if (!movie) {
      return errorResponse("Movie not found.", {}, 404);
    }

    const stripSubContent = (subtitles: any[] | undefined) => {
      if (!subtitles) return undefined;
      return subtitles.map((s: any) => ({ name: s.name }));
    };

    const sanitized: any = { ...movie };

    if (sanitized.stream?.subtitles) {
      sanitized.stream = {
        ...sanitized.stream,
        subtitles: stripSubContent(sanitized.stream.subtitles),
      };
    }

    if (sanitized.season) {
      sanitized.season = sanitized.season.map((s: any) => ({
        ...s,
        episodes: s.episodes?.map((ep: any) => ({
          ...ep,
          stream: ep.stream
            ? {
                ...ep.stream,
                subtitles: stripSubContent(ep.stream.subtitles),
              }
            : ep.stream,
        })),
      }));
    }

    return NextResponse.json({ success: true, data: sanitized });
  } catch (error) {
    console.error("Unable to load movie details", error);
    return errorResponse("Unable to load movie details.", {}, 500);
  }
}