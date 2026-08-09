import { NextRequest, NextResponse } from "next/server";
import { getMovie } from "@/server/movies/catalog";
import { playlistFromSegmentFile } from "@/server/movies/playlist";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; season: string; episode: string }> }
) {
  const { slug, season: seasonParam, episode: epParam } = await params;
  const movie = await getMovie(slug);

  if (!movie) {
    return new NextResponse("Movie not found", { status: 404 });
  }

  let streamCdn = movie.streamCdn;
  let cdnId = movie.cdnId;
  let defaults = movie.defaults;
  let streamConfig = movie.streamConfig;
  let stream = movie.stream;

  if (movie.type === "series" && movie.season && movie.season.length > 0) {
    const sIndex = !isNaN(Number(seasonParam)) ? parseInt(seasonParam) - 1 : 0;
    const seasonObj = movie.season[sIndex] || movie.season[0];

    const epIndex = !isNaN(Number(epParam)) ? parseInt(epParam) - 1 : 0;
    const epObj = seasonObj?.episodes?.[epIndex] || seasonObj?.episodes?.[0];

    if (epObj) {
      streamCdn = epObj.streamCdn || streamCdn;
      cdnId = epObj.cdnId || cdnId;
      defaults = epObj.defaults || defaults;
      streamConfig = epObj.streamConfig || streamConfig;
      stream = epObj.stream || stream;
    }
  }

  if (!streamCdn || !cdnId || !streamConfig || !stream) {
    return new NextResponse("Stream configuration missing", { status: 404 });
  }

  const urlParams = new URL(request.url).searchParams;
  const type = urlParams.get("type");
  const selectedVideoCode = urlParams.get("vCode") || defaults?.video || stream.video?.[0]?.code || "720p";
  const selectedAudioCode = urlParams.get("aCode") || defaults?.audio || stream.audio?.[0]?.code || "0";

  if (type === "video") {
    const cfg = streamConfig.video;
    const fromSegmentFile = cfg.segmentFile && playlistFromSegmentFile(
      cfg.segmentFile,
      `${streamCdn}/files/${cdnId}/${selectedVideoCode}`,
    );
    if (fromSegmentFile) {
      return new NextResponse(fromSegmentFile, {
        headers: {
          "Content-Type": "application/vnd.apple.mpegurl; charset=utf-8",
          "Cache-Control": "no-store",
        },
      });
    }
    const lines = [
      "#EXTM3U",
      "#EXT-X-VERSION:3",
      "#EXT-X-TARGETDURATION:15",
      "#EXT-X-MEDIA-SEQUENCE:0",
      "#EXT-X-PLAYLIST-TYPE:VOD",
    ];

    for (let seg = cfg.startSegment; seg <= cfg.endSegment; seg++) {
      const paddedSeg = String(seg).padStart(cfg.segmentPadding, "0");
      lines.push(
        "#EXTINF:10.000000,",
        `${streamCdn}/files/${cdnId}/${selectedVideoCode}/${cfg.prefixCode}_${paddedSeg}.jpg`
      );
    }
    lines.push("#EXT-X-ENDLIST");

    return new NextResponse(lines.join("\n"), {
      headers: {
        "Content-Type": "application/vnd.apple.mpegurl; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }

  if (type === "audio") {
    const cfg = streamConfig.audio;
    const fromSegmentFile = cfg.segmentFile && playlistFromSegmentFile(
      cfg.segmentFile,
      `${streamCdn}/files/${cdnId}/a/${selectedAudioCode}`,
    );
    if (fromSegmentFile) {
      return new NextResponse(fromSegmentFile, {
        headers: {
          "Content-Type": "application/vnd.apple.mpegurl; charset=utf-8",
          "Cache-Control": "no-store",
        },
      });
    }
    const lines = [
      "#EXTM3U",
      "#EXT-X-VERSION:3",
      "#EXT-X-TARGETDURATION:10",
      "#EXT-X-MEDIA-SEQUENCE:0",
      "#EXT-X-PLAYLIST-TYPE:VOD",
    ];

    for (let seg = cfg.startSegment; seg <= cfg.endSegment; seg++) {
      const paddedSeg = String(seg).padStart(cfg.segmentPadding, "0");
      lines.push(
        "#EXTINF:10.000000,",
        `${streamCdn}/files/${cdnId}/a/${selectedAudioCode}/${cfg.prefixCode}_${paddedSeg}.js`
      );
    }
    lines.push("#EXT-X-ENDLIST");

    return new NextResponse(lines.join("\n"), {
      headers: {
        "Content-Type": "application/vnd.apple.mpegurl; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }

  const masterLines = ["#EXTM3U", "#EXT-X-VERSION:3"];

  const hasAudioTracks = Boolean(stream.audio && stream.audio.length > 0);

  if (hasAudioTracks) {
    stream.audio?.forEach((aud) => {
      const isDefault = String(aud.code) === String(selectedAudioCode) ? "YES" : "NO";
      masterLines.push(
        `#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio",NAME="${aud.name}",DEFAULT=${isDefault},AUTOSELECT=YES,URI="?type=audio&aCode=${encodeURIComponent(
          aud.code || "0"
        )}"`
      );
    });
  }

  if (hasAudioTracks) {
    masterLines.push(
      `#EXT-X-STREAM-INF:BANDWIDTH=2500000,CODECS="avc1.64001f,mp4a.40.2",AUDIO="audio"`,
      `?type=video&vCode=${encodeURIComponent(selectedVideoCode)}`
    );
  } else {
    masterLines.push(
      `#EXT-X-STREAM-INF:BANDWIDTH=2500000,CODECS="avc1.64001f,mp4a.40.2"`,
      `?type=video&vCode=${encodeURIComponent(selectedVideoCode)}`
    );
  }

  return new NextResponse(masterLines.join("\n"), {
    headers: {
      "Content-Type": "application/vnd.apple.mpegurl; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}