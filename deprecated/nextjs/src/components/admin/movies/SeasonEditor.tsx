"use client";
import { useState } from "react";
import { ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SeasonData, DEFAULT_EPISODE } from "./types";
import { EpisodeEditor } from "./EpisodeEditor";

interface SeasonEditorProps {
  seasons: SeasonData[];
  onChange: (updatedSeasons: SeasonData[]) => void;
}

export function SeasonEditor({ seasons = [], onChange }: SeasonEditorProps) {
  const [openSeasons, setOpenSeasons] = useState<Record<number, boolean>>({});

  const toggleSeason = (idx: number) => {
    setOpenSeasons((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleAddSeason = () => {
    const newSeasons = [...seasons];
    newSeasons.push({
      name: `Season ${newSeasons.length + 1}`,
      description: "",
      episodes: [JSON.parse(JSON.stringify(DEFAULT_EPISODE))],
    });
    onChange(newSeasons);
    setOpenSeasons((prev) => ({ ...prev, [newSeasons.length - 1]: true }));
  };

  const handleRemoveSeason = (sIdx: number) => {
    onChange(seasons.filter((_, i) => i !== sIdx));
  };

  const handleSeasonNameChange = (sIdx: number, newName: string) => {
    const updated = [...seasons];
    updated[sIdx].name = newName;
    onChange(updated);
  };

  const handleAddEpisode = (sIdx: number) => {
    const updated = [...seasons];
    const epCount = updated[sIdx].episodes.length + 1;
    updated[sIdx].episodes.push({
      ...JSON.parse(JSON.stringify(DEFAULT_EPISODE)),
      name: `Episode ${epCount}`,
    });
    onChange(updated);
  };

  const handleEpisodeChange = (sIdx: number, epIdx: number, updatedEp: any) => {
    const updated = [...seasons];
    updated[sIdx].episodes[epIdx] = updatedEp;
    onChange(updated);
  };

  const handleRemoveEpisode = (sIdx: number, epIdx: number) => {
    const updated = [...seasons];
    updated[sIdx].episodes = updated[sIdx].episodes.filter((_, i) => i !== epIdx);
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
        <h4 className="text-sm font-bold text-purple-400">Series Seasons & Episodes</h4>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleAddSeason}
          className="h-8 border-neutral-700 text-xs text-neutral-300 hover:bg-neutral-800"
        >
          <Plus className="mr-1 h-3.5 w-3.5" /> Add Season
        </Button>
      </div>

      {seasons.map((s, sIdx) => {
        const isOpen = openSeasons[sIdx] ?? false;
        const epCount = s.episodes?.length ?? 0;

        return (
          <div
            key={sIdx}
            className="rounded-xl border border-neutral-800 bg-neutral-900/60 overflow-hidden"
          >
            <button
              type="button"
              onClick={() => toggleSeason(sIdx)}
              className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left hover:bg-neutral-800/50 transition"
            >
              <div className="flex items-center gap-2">
                <ChevronRight
                  className={`h-4 w-4 text-purple-400 transition-transform duration-200 ${
                    isOpen ? "rotate-90" : ""
                  }`}
                />
                <span className="text-sm font-bold text-white">
                  {s.name || `Season ${sIdx + 1}`}
                </span>
                <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-[10px] font-medium text-neutral-400">
                  {epCount} ep{epCount !== 1 ? "s" : ""}
                </span>
              </div>

              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveSeason(sIdx);
                }}
                className="h-7 text-xs text-red-400 hover:bg-red-950/50"
              >
                Remove
              </Button>
            </button>

            {isOpen && (
              <div className="border-t border-neutral-800 p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-neutral-500 shrink-0">Name:</label>
                  <Input
                    value={s.name || `Season ${sIdx + 1}`}
                    onChange={(e) => handleSeasonNameChange(sIdx, e.target.value)}
                    className="font-semibold border-neutral-800 bg-neutral-900 text-white max-w-xs h-8 text-xs"
                  />
                </div>

                <div className="pl-3 space-y-3 border-l-2 border-purple-900/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-400">Episodes</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddEpisode(sIdx)}
                      className="h-7 text-xs border-neutral-700"
                    >
                      <Plus className="mr-1 h-3 w-3" /> Add Episode
                    </Button>
                  </div>

                  {s.episodes?.map((ep, epIdx) => (
                    <EpisodeEditor
                      key={epIdx}
                      episode={ep}
                      episodeIndex={epIdx}
                      onChange={(updatedEp) => handleEpisodeChange(sIdx, epIdx, updatedEp)}
                      onDelete={() => handleRemoveEpisode(sIdx, epIdx)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}