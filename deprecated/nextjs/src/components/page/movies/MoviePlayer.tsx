"use client";

import { useEffect, useRef, useState } from "react";
import type Hls from "hls.js";
import {
  ArrowLeft,
  Loader2,
  Maximize,
  Minimize,
  Music,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Settings,
  Subtitles,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Movie, MovieEpisode } from "../../../types/movies";

interface ParsedCue {
  start: number;
  end: number;
  text: string;
}

function parseVttTimestamp(ts: string): number {
  const parts = ts.trim().split(":");
  if (parts.length === 3) {
    return (
      parseFloat(parts[0]) * 3600 +
      parseFloat(parts[1]) * 60 +
      parseFloat(parts[2])
    );
  }
  if (parts.length === 2) {
    return parseFloat(parts[0]) * 60 + parseFloat(parts[1]);
  }
  return 0;
}

function parseVtt(vttText: string): ParsedCue[] {
  const cues: ParsedCue[] = [];
  const text = vttText
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, "$1.$2");

  const blocks = text.split(/\n\n+/);
  for (const block of blocks) {
    const lines = block.trim().split("\n");
    let arrowIdx = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes("-->")) {
        arrowIdx = i;
        break;
      }
    }
    if (arrowIdx === -1) continue;

    const timeParts = lines[arrowIdx].split("-->");
    if (timeParts.length < 2) continue;

    const start = parseVttTimestamp(timeParts[0].trim());
    const end = parseVttTimestamp(timeParts[1].trim().split(" ")[0]);
    const cueText = lines
      .slice(arrowIdx + 1)
      .join("\n")
      .trim();
    if (cueText) {
      cues.push({ start, end, text: cueText });
    }
  }
  return cues;
}

interface MoviePlayerProps {
  slug: string;
  season?: number;
  episode?: MovieEpisode;
  movie?: Movie;
  streamConfig?: any;
  movieTitle?: string;
  movieType?: string;
  onBack?: () => void;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function MoviePlayer({
  slug,
  season = 1,
  episode,
  movie,
  streamConfig,
  movieTitle,
  movieType,
  onBack,
}: MoviePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const [showAudioMenu, setShowAudioMenu] = useState(false);
  const [showSubMenu, setShowSubMenu] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const savedTimeRef = useRef<number>(0);

  const activeDefaults = (episode as any)?.defaults || movie?.defaults;
  const activeStream = movie?.stream || (episode as any)?.stream;
  const audioList = activeStream?.audio || [];
  const videoList = activeStream?.video || [];
  const subtitleList = activeStream?.subtitles || [];

  const [selectedAudioCode, setSelectedAudioCode] = useState<string>("0");
  const [selectedVideoCode, setSelectedVideoCode] = useState<string>("720p");
  const [selectedSubIndex, setSelectedSubIndex] = useState<number>(-1);

  const [subtitleCues, setSubtitleCues] = useState<ParsedCue[]>([]);
  const [activeCueText, setActiveCueText] = useState<string>("");

  useEffect(() => {
    if (activeDefaults?.audio !== undefined) {
      setSelectedAudioCode(String(activeDefaults.audio));
    } else if (audioList.length > 0 && audioList[0].code !== undefined) {
      setSelectedAudioCode(String(audioList[0].code));
    }

    if (activeDefaults?.video !== undefined) {
      setSelectedVideoCode(String(activeDefaults.video));
    } else if (videoList.length > 0 && videoList[0].code !== undefined) {
      setSelectedVideoCode(String(videoList[0].code));
    }
  }, [episode, movie]);

  const epNum = (episode as any)?.number || 1;
  const playlistUrl = `/api/movies/${encodeURIComponent(slug)}/seasons/${season}/episodes/${epNum}/playlist.m3u8?vCode=${encodeURIComponent(selectedVideoCode)}&aCode=${encodeURIComponent(selectedAudioCode)}`;

  useEffect(() => {
    if (selectedSubIndex === -1 || subtitleList.length === 0) {
      setSubtitleCues([]);
      setActiveCueText("");
      return;
    }

    const subtitleUrl = `/api/movies/${encodeURIComponent(slug)}/seasons/${season}/episodes/${epNum}/subtitles.vtt?index=${selectedSubIndex}`;

    let cancelled = false;
    fetch(subtitleUrl)
      .then((res) => {
        if (!res.ok) throw new Error("Subtitle fetch failed");
        return res.text();
      })
      .then((vttText) => {
        if (cancelled) return;
        const cues = parseVtt(vttText);
        setSubtitleCues(cues);
      })
      .catch(() => {
        if (!cancelled) setSubtitleCues([]);
      });

    return () => {
      cancelled = true;
    };
  }, [slug, season, epNum, selectedSubIndex, subtitleList.length]);

  useEffect(() => {
    if (selectedSubIndex === -1 || subtitleCues.length === 0) {
      setActiveCueText("");
      return;
    }
    let found = "";
    for (const cue of subtitleCues) {
      if (currentTime >= cue.start && currentTime <= cue.end) {
        found = cue.text;
        break;
      }
      if (cue.start > currentTime) break;
    }
    setActiveCueText(found);
  }, [currentTime, subtitleCues, selectedSubIndex]);

  const restorePlaybackPosition = () => {
    const video = videoRef.current;
    if (video && savedTimeRef.current > 0) {
      video.currentTime = savedTimeRef.current;
      savedTimeRef.current = 0;
      if (isPlaying) {
        video.play().catch(() => {});
      }
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
        setShowAudioMenu(false);
        setShowSubMenu(false);
        setShowQualityMenu(false);
      }
    }, 3000);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | undefined;
    let disposed = false;

    video.setAttribute("referrerpolicy", "no-referrer");
    setError(null);

    (async () => {
      try {
        const { default: HlsPlayer } = await import("hls.js");
        if (disposed) return;

        if (HlsPlayer.isSupported()) {
          class NoHeadersLoader extends HlsPlayer.DefaultConfig.loader {
            constructor(config: any) {
              super(config);
              const load = this.load.bind(this);
              this.load = (context: any, config: any, callbacks: any) => {
                context.headers = {};
                load(context, config, callbacks);
              };
            }
          }

          hls = new HlsPlayer({
            maxBufferLength: 30,
            maxMaxBufferLength: 60,
            loader: NoHeadersLoader as any,
            xhrSetup: (xhr) => {
              xhr.withCredentials = false;
            },
          });

          hlsRef.current = hls;

          hls.attachMedia(video);
          hls.on(HlsPlayer.Events.MEDIA_ATTACHED, () => {
            if (!disposed) hls?.loadSource(playlistUrl);
          });

          hls.on(HlsPlayer.Events.MANIFEST_PARSED, () => {
            if (disposed) return;
            setLoading(false);
            restorePlaybackPosition();

            if (hls && hls.audioTracks && hls.audioTracks.length > 0) {
              const matchingIdx = hls.audioTracks.findIndex(
                (t: any) =>
                  String(t.name) === String(selectedAudioCode) ||
                  t.url?.includes(`aCode=${selectedAudioCode}`)
              );
              if (matchingIdx !== -1) {
                hls.audioTrack = matchingIdx;
              }
            }
          });

          hls.on(HlsPlayer.Events.ERROR, (_, data) => {
            if (disposed) return;
            if (data.fatal) {
              switch (data.type) {
                case HlsPlayer.ErrorTypes.NETWORK_ERROR:
                  console.warn("HLS Network Error, attempting recovery...");
                  hls?.startLoad();
                  break;
                case HlsPlayer.ErrorTypes.MEDIA_ERROR:
                  console.warn("HLS Media Error, attempting recovery...");
                  hls?.recoverMediaError();
                  break;
                default:
                  setLoading(false);
                  setError(`The stream could not be played (${data.type}).`);
                  hls?.destroy();
                  break;
              }
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = playlistUrl;
        } else {
          throw new Error("Your browser does not support HLS playback.");
        }
      } catch (cause) {
        setLoading(false);
        setError(cause instanceof Error ? cause.message : "The player could not be started.");
      }
    })();

    return () => {
      disposed = true;
      if (hls) {
        try {
          hls.stopLoad();
          hls.detachMedia();
          hls.destroy();
        } catch {}
      }
      hlsRef.current = null;
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [playlistUrl]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video) {
      setCurrentTime(video.currentTime);
      setDuration(video.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    setCurrentTime(targetTime);
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime;
    }
  };

  const skipTime = (amount: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(
        Math.max(videoRef.current.currentTime + amount, 0),
        duration
      );
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMuted = !isMuted;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);
    }
  };

  const selectSubtitleTrack = (index: number) => {
    setSelectedSubIndex(index);
    setShowSubMenu(false);
    if (index === -1) {
      setActiveCueText("");
    }
  };

  const selectAudioTrack = (code: string) => {
    setSelectedAudioCode(code);
    setShowAudioMenu(false);

    if (hlsRef.current && hlsRef.current.audioTracks && hlsRef.current.audioTracks.length > 0) {
      const matchingIdx = hlsRef.current.audioTracks.findIndex(
        (t: any, idx: number) =>
          String(audCodeFromUrl(t.url) || idx) === String(code) ||
          String(t.name) === String(code) ||
          String(t.id) === String(code)
      );
      if (matchingIdx !== -1) {
        hlsRef.current.audioTrack = matchingIdx;
        return;
      }
    }
  };

  function audCodeFromUrl(url: string | undefined): string | null {
    if (!url) return null;
    const match = url.match(/aCode=([^&]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  }

  const selectVideoQuality = (code: string) => {
    if (videoRef.current && videoRef.current.currentTime > 0) {
      savedTimeRef.current = videoRef.current.currentTime;
    }
    setSelectedVideoCode(code);
    setShowQualityMenu(false);
    setLoading(true);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video) return;

    if (container.requestFullscreen) {
      if (!document.fullscreenElement) {
        container.requestFullscreen().catch(() => {
          if ((video as any).webkitEnterFullscreen) {
            (video as any).webkitEnterFullscreen();
          }
        });
        setIsFullscreen(true);
      } else {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
      return;
    }

    if ((video as any).webkitEnterFullscreen) {
      if ((video as any).webkitDisplayingFullscreen) {
        if ((video as any).webkitExitFullscreen) {
          (video as any).webkitExitFullscreen();
        }
      } else {
        (video as any).webkitEnterFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    const video = videoRef.current;
    const handleWebkitBegin = () => setIsFullscreen(true);
    const handleWebkitEnd = () => setIsFullscreen(false);

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    if (video) {
      video.addEventListener("webkitbeginfullscreen", handleWebkitBegin);
      video.addEventListener("webkitendfullscreen", handleWebkitEnd);
    }

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      if (video) {
        video.removeEventListener("webkitbeginfullscreen", handleWebkitBegin);
        video.removeEventListener("webkitendfullscreen", handleWebkitEnd);
      }
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      switch (key) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "m":
          e.preventDefault();
          toggleMute();
          break;
        case "arrowleft":
        case "j":
          e.preventDefault();
          skipTime(-5);
          break;
        case "arrowright":
        case "l":
          e.preventDefault();
          skipTime(5);
          break;
        case "arrowup":
          e.preventDefault();
          if (videoRef.current) {
            const newVol = Math.min(videoRef.current.volume + 0.1, 1);
            setVolume(newVol);
            videoRef.current.volume = newVol;
            videoRef.current.muted = false;
            setIsMuted(false);
          }
          break;
        case "arrowdown":
          e.preventDefault();
          if (videoRef.current) {
            const newVol = Math.max(videoRef.current.volume - 0.1, 0);
            setVolume(newVol);
            videoRef.current.volume = newVol;
            if (newVol === 0) {
              videoRef.current.muted = true;
              setIsMuted(true);
            }
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, duration, isMuted, volume]);

  const activeAudioName = audioList.find((a: any) => String(a.code) === String(selectedAudioCode))?.name || "Audio";
  const activeSubName = selectedSubIndex === -1 ? "Off" : (subtitleList[selectedSubIndex]?.name || "Subtitle");

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className="group relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-2xl transition-all"
    >
      <video
        ref={videoRef}
        playsInline
        webkit-playsinline="true"
        x5-playsinline="true"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => {
          handleTimeUpdate();
          restorePlaybackPosition();
        }}
        onCanPlay={() => {
          setLoading(false);
          restorePlaybackPosition();
        }}
        onLoadedData={() => {
          setLoading(false);
          restorePlaybackPosition();
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onWaiting={() => setLoading(true)}
        onContextMenu={(e) => e.preventDefault()}
        onClick={togglePlay}
        className="h-full w-full cursor-pointer object-cover"
      />

      <div
        className={`absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/90 via-black/50 to-transparent p-4 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 rounded-xl bg-blue-600/90 px-3.5 py-1.5 text-sm font-semibold text-white backdrop-blur-md shadow-lg transition hover:bg-blue-600 hover:scale-105"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          )}
          <div>
            <h3 className="text-base font-semibold text-white leading-tight">
              {movieTitle ?? "Movie"}
            </h3>
            {movieType === "series" && episode && (
              <p className="text-xs text-white/70">
                Season {season} · {episode.name ?? `Episode`}
              </p>
            )}
          </div>
        </div>
      </div>

      {!isPlaying && !loading && !error && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 m-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-600/90 text-white shadow-xl backdrop-blur-sm transition transform hover:scale-110 hover:bg-blue-600"
        >
          <Play className="ml-1 h-8 w-8 fill-current" />
        </button>
      )}

      {loading && !error && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center bg-black/40 text-white backdrop-blur-xs">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        </div>
      )}

      {error && (
        <div className="absolute inset-0 grid place-items-center bg-black/80 p-6 text-center text-sm text-white">
          <p className="rounded-lg bg-blue-950/80 px-4 py-2 text-blue-200 border border-blue-800">
            {error}
          </p>
        </div>
      )}

      {selectedSubIndex !== -1 && activeCueText && (
        <div className="pointer-events-none absolute bottom-20 inset-x-0 z-40 flex justify-center px-4">
          <div className="max-w-3xl rounded bg-black/80 px-4 py-2 text-center text-base md:text-lg font-medium text-white leading-snug whitespace-pre-line">
            {activeCueText}
          </div>
        </div>
      )}

      <div
        className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-4 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="group/scrubber relative mb-3 flex items-center">
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-white/30 accent-blue-600 transition group-hover/scrubber:h-2.5"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <button
                onClick={togglePlay}
                className="text-white hover:text-blue-400 transition shrink-0"
                title={isPlaying ? "Pause (Space/K)" : "Play (Space/K)"}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5 fill-current" />
                ) : (
                  <Play className="h-5 w-5 fill-current" />
                )}
              </button>

              <button
                onClick={() => skipTime(-10)}
                className="text-white/80 hover:text-white transition shrink-0"
                title="Rewind 10s"
              >
                <RotateCcw className="h-4 w-4" />
              </button>

              <button
                onClick={() => skipTime(10)}
                className="text-white/80 hover:text-white transition shrink-0"
                title="Forward 10s"
              >
                <RotateCw className="h-4 w-4" />
              </button>

              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className="text-white/80 hover:text-white transition shrink-0"
                  title="Mute (M)"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="h-4 w-4 text-blue-400" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="h-1 w-16 cursor-pointer appearance-none rounded bg-white/30 accent-blue-600"
                />
              </div>

              <span className="text-[10px] sm:text-xs font-mono text-white/80 whitespace-nowrap">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {audioList.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowAudioMenu(!showAudioMenu);
                      setShowSubMenu(false);
                      setShowQualityMenu(false);
                    }}
                    className="flex items-center gap-1 rounded bg-white/10 px-1.5 sm:px-2.5 py-1 text-[10px] sm:text-xs font-medium text-white/90 hover:bg-white/20 transition"
                    title="Audio"
                  >
                    <Music className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                    <span className="hidden sm:inline">{activeAudioName}</span>
                  </button>

                  {showAudioMenu && (
                    <div className="absolute bottom-9 right-0 z-50 min-w-36 overflow-hidden rounded-xl bg-neutral-900/95 p-1.5 text-xs text-white shadow-2xl border border-neutral-700 backdrop-blur-md">
                      <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                        Audio Track
                      </p>
                      {audioList.map((aud: any, idx: number) => {
                        const isSelected = String(aud.code) === String(selectedAudioCode);
                        return (
                          <button
                            key={idx}
                            onClick={() => selectAudioTrack(String(aud.code))}
                            className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left transition ${
                              isSelected
                                ? "bg-blue-600 font-semibold text-white"
                                : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
                            }`}
                          >
                            <span>{aud.name}</span>
                            {isSelected && <span>✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {subtitleList.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowSubMenu(!showSubMenu);
                      setShowAudioMenu(false);
                      setShowQualityMenu(false);
                    }}
                    className={`flex items-center gap-1 rounded px-1.5 sm:px-2.5 py-1 text-[10px] sm:text-xs font-medium transition ${
                      selectedSubIndex !== -1
                        ? "bg-blue-600 text-white"
                        : "bg-white/10 text-white/80 hover:bg-white/20"
                    }`}
                    title="Subtitles"
                  >
                    <Subtitles className="h-3.5 w-3.5 shrink-0" />
                    <span className="hidden sm:inline">{activeSubName}</span>
                  </button>

                  {showSubMenu && (
                    <div className="absolute bottom-9 right-0 z-50 min-w-36 overflow-hidden rounded-xl bg-neutral-900/95 p-1.5 text-xs text-white shadow-2xl border border-neutral-700 backdrop-blur-md">
                      <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                        Subtitles
                      </p>
                      <button
                        onClick={() => selectSubtitleTrack(-1)}
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left transition ${
                          selectedSubIndex === -1
                            ? "bg-blue-600 font-semibold text-white"
                            : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
                        }`}
                      >
                        <span>Off</span>
                        {selectedSubIndex === -1 && <span>✓</span>}
                      </button>
                      {subtitleList.map((sub: any, idx: number) => {
                        const isSelected = idx === selectedSubIndex;
                        return (
                          <button
                            key={idx}
                            onClick={() => selectSubtitleTrack(idx)}
                            className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left transition ${
                              isSelected
                                ? "bg-blue-600 font-semibold text-white"
                                : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
                            }`}
                          >
                            <span>{sub.name}</span>
                            {isSelected && <span>✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {videoList.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowQualityMenu(!showQualityMenu);
                      setShowAudioMenu(false);
                      setShowSubMenu(false);
                    }}
                    className="flex items-center gap-1 rounded bg-white/10 px-1.5 sm:px-2 py-1 text-[10px] sm:text-xs text-white/80 hover:bg-white/20 hover:text-white transition"
                    title="Quality"
                  >
                    <Settings className="h-3.5 w-3.5 shrink-0" />
                    <span>{selectedVideoCode}</span>
                  </button>

                  {showQualityMenu && (
                    <div className="absolute bottom-9 right-0 z-50 min-w-36 overflow-hidden rounded-xl bg-neutral-900/95 p-1.5 text-xs text-white shadow-2xl border border-neutral-700 backdrop-blur-md">
                      <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                        Quality
                      </p>
                      {videoList.map((vid: any, idx: number) => {
                        const isSelected = vid.code === selectedVideoCode;
                        return (
                          <button
                            key={idx}
                            onClick={() => selectVideoQuality(vid.code)}
                            className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left transition ${
                              isSelected
                                ? "bg-blue-600 font-semibold text-white"
                                : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
                            }`}
                          >
                            <span>{vid.name}</span>
                            {isSelected && <span>✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={toggleFullscreen}
                className="text-white/80 hover:text-white transition shrink-0"
                title={isFullscreen ? "Exit Fullscreen (F)" : "Fullscreen (F)"}
              >
                {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}