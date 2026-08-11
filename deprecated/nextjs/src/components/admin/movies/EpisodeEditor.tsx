"use client";
import { useState } from "react";
import { ChevronRight, Video, Music, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EpisodeData } from "./types";
import { OptionArrayEditor } from "./OptionArrayEditor";
import { StreamConfigEditor } from "./StreamConfigEditor";

interface EpisodeEditorProps {
  episode: EpisodeData;
  episodeIndex?: number;
  onChange: (updated: EpisodeData) => void;
  onDelete: () => void;
}

export function EpisodeEditor({ episode, episodeIndex = 0, onChange, onDelete }: EpisodeEditorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const title = episode.name || `Episode ${episodeIndex + 1}`;

  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-950 overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left hover:bg-neutral-900 transition"
      >
        <div className="flex items-center gap-2">
          <ChevronRight
            className={`h-3.5 w-3.5 text-blue-400 transition-transform duration-200 ${
              isOpen ? "rotate-90" : ""
            }`}
          />
          <span className="text-xs font-semibold text-white">{title}</span>
          <span className="rounded bg-neutral-800 px-1.5 py-0.5 text-[10px] text-neutral-500">
            Ep {episodeIndex + 1}
          </span>
        </div>

        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="h-6 px-2 text-[10px] text-red-400 hover:bg-red-950/50"
        >
          Delete
        </Button>
      </button>

      {isOpen && (
        <div className="border-t border-neutral-800 p-3 space-y-3">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Episode Title"
              value={episode.name || ""}
              onChange={(e) => onChange({ ...episode, name: e.target.value })}
              className="font-semibold border-neutral-800 bg-neutral-900 text-white max-w-xs h-8 text-xs"
            />
          </div>

          <Textarea
            placeholder="Episode description..."
            rows={1}
            value={episode.description || ""}
            onChange={(e) => onChange({ ...episode, description: e.target.value })}
            className="border-neutral-800 bg-neutral-900 text-white text-xs"
          />

          <div className="grid gap-3 sm:grid-cols-2 text-xs">
            <div>
              <label className="text-neutral-500">Stream CDN URL</label>
              <Input
                value={episode.streamCdn || ""}
                onChange={(e) => onChange({ ...episode, streamCdn: e.target.value })}
                className="h-7 border-neutral-800 bg-neutral-900 text-white text-xs"
              />
            </div>
            <div>
              <label className="text-neutral-500">CDN ID</label>
              <Input
                value={episode.cdnId || ""}
                onChange={(e) => onChange({ ...episode, cdnId: e.target.value })}
                className="h-7 border-neutral-800 bg-neutral-900 text-white text-xs"
              />
            </div>
            <div>
              <label className="text-neutral-500">Default Video Code</label>
              <Input
                value={episode.defaults?.video || "720p"}
                onChange={(e) =>
                  onChange({
                    ...episode,
                    defaults: { ...episode.defaults, video: e.target.value },
                  })
                }
                className="h-7 border-neutral-800 bg-neutral-900 text-white text-xs"
              />
            </div>
            <div>
              <label className="text-neutral-500">Default Audio Code</label>
              <Input
                value={episode.defaults?.audio || "3"}
                onChange={(e) =>
                  onChange({
                    ...episode,
                    defaults: { ...episode.defaults, audio: e.target.value },
                  })
                }
                className="h-7 border-neutral-800 bg-neutral-900 text-white text-xs"
              />
            </div>
          </div>

          <StreamConfigEditor
            config={episode.streamConfig}
            onChange={(newConf) => onChange({ ...episode, streamConfig: newConf })}
            compact
          />

          <div className="grid gap-3 sm:grid-cols-3 pt-2">
            <OptionArrayEditor
              title="Video Qualities"
              icon={Video}
              items={episode.stream?.video || []}
              onChange={(newItems) =>
                onChange({
                  ...episode,
                  stream: { ...episode.stream, video: newItems },
                })
              }
            />

            <OptionArrayEditor
              title="Audio Tracks"
              icon={Music}
              items={episode.stream?.audio || []}
              onChange={(newItems) =>
                onChange({
                  ...episode,
                  stream: { ...episode.stream, audio: newItems },
                })
              }
            />

            <OptionArrayEditor
              title="Subtitles"
              icon={FileText}
              items={episode.stream?.subtitles || []}
              onChange={(newItems) =>
                onChange({
                  ...episode,
                  stream: { ...episode.stream, subtitles: newItems },
                })
              }
              isSubtitle
            />
          </div>
        </div>
      )}
    </div>
  );
}