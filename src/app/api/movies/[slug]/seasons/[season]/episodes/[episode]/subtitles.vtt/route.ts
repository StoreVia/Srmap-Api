import { NextRequest, NextResponse } from "next/server";
import { getMovie } from "@/server/movies/catalog";
import { OptionItem } from "@/types/movies";

export const dynamic = "force-dynamic";

function srtToVtt(text: string): string {
  if (!text) return "WEBVTT\n\n";
  const trimmed = text.trim();
  if (trimmed.startsWith("WEBVTT")) return text;

  const clean = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, "$1.$2");

  return "WEBVTT\n\n" + clean;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; season: string; episode: string }> }
) {
  const { slug, season: seasonParam, episode: epParam } = await params;
  const movie = await getMovie(slug);

  if (!movie) {
    return new NextResponse("Movie not found", { status: 404 });
  }

  let subtitles: OptionItem[] | undefined = movie.stream?.subtitles;

  if (movie.type === "series" && movie.season && movie.season.length > 0) {
    const sIndex = !isNaN(Number(seasonParam)) ? parseInt(seasonParam) - 1 : 0;
    const seasonObj = movie.season[sIndex] || movie.season[0];

    const epIndex = !isNaN(Number(epParam)) ? parseInt(epParam) - 1 : 0;
    const epObj = seasonObj?.episodes?.[epIndex] || seasonObj?.episodes?.[0];

    if (epObj?.stream?.subtitles) {
      subtitles = epObj.stream.subtitles;
    }
  }

  if (!subtitles || subtitles.length === 0) {
    return new NextResponse("Subtitles not found", { status: 404 });
  }

  const urlParams = new URL(request.url).searchParams;
  const trackIndex = urlParams.get("index");
  const trackName = urlParams.get("name");

  let targetTrack: OptionItem | undefined;
  if (trackIndex !== null) {
    targetTrack = subtitles[Number(trackIndex)];
  } else if (trackName) {
    targetTrack = subtitles.find(
      (s) => s.name.toLowerCase() === trackName.toLowerCase()
    );
  }
  if (!targetTrack) {
    targetTrack = subtitles[0];
  }

  const content = targetTrack?.code || (targetTrack as any)?.content || (targetTrack as any)?.file;
  if (content && !content.trim().startsWith("http://") && !content.trim().startsWith("https://")) {
    return new NextResponse(srtToVtt(content), {
      status: 200,
      headers: {
        "Content-Type": "text/vtt; charset=utf-8",
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  }

  const subUrl = targetTrack?.url || (content && (content.startsWith("http://") || content.startsWith("https://")) ? content : undefined);
  if (subUrl) {
    try {
      const response = await fetch(subUrl);
      if (response.ok) {
        const text = await response.text();
        return new NextResponse(srtToVtt(text), {
          status: 200,
          headers: {
            "Content-Type": "text/vtt; charset=utf-8",
            "Cache-Control": "public, max-age=86400, immutable",
          },
        });
      }
    } catch (error) {
      console.error("Error fetching target subtitle track:", error);
    }
  }

  return new NextResponse("Subtitles not found", { status: 404 });
}