"use client";
import { ArrowLeft, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Movie } from "../../../types/movies";
import { MoviePlayer } from "./MoviePlayer";

interface MovieWatchViewProps {
  movie: Movie;
  seasonIndex: number;
  selectedEpisode: any;
  movieLoading: boolean;
  onBack: () => void;
  onSelectSeason: (index: number) => void;
  onSelectEpisode: (episode: any, index: number) => void;
}

export function MovieWatchView({
  movie,
  seasonIndex,
  selectedEpisode,
  movieLoading,
  onBack,
  onSelectSeason,
  onSelectEpisode,
}: MovieWatchViewProps) {
  const activeSeason = movie.season?.[seasonIndex];

  const isSeries =
    movie.type === "series" ||
    ((movie.season?.length ?? 0) > 1) ||
    (activeSeason && (activeSeason.episodes?.length ?? 0) > 1);

  return (
    <section className="space-y-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <Button
          onClick={onBack}
          variant="outline"
          size="sm"
          className="gap-2 border-neutral-700 bg-neutral-900/80 text-white hover:bg-neutral-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Movies
        </Button>
      </div>

      {movieLoading ? (
        <div className="flex h-64 items-center justify-center text-neutral-400">
          Loading movie player...
        </div>
      ) : (
        <>
          <MoviePlayer
            slug={movie.Slug}
            season={seasonIndex + 1}
            episode={selectedEpisode}
            movie={movie}
            streamConfig={movie.streamConfig as any}
            movieTitle={movie.Name}
            movieType={movie.type}
            onBack={onBack}
          />

          <div className="rounded-2xl bg-neutral-900/80 p-6 backdrop-blur-md border border-neutral-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">{movie.Name}</h2>
                {isSeries && activeSeason && selectedEpisode && (
                  <p className="text-sm text-neutral-400">
                    {activeSeason.name ?? `Season ${seasonIndex + 1}`}
                    {" · "}
                    {selectedEpisode.name ?? `Episode`}
                  </p>
                )}
                {movie.description && (
                  <p className="mt-1 text-sm text-neutral-400">{movie.description}</p>
                )}
              </div>

              {movie.season && movie.season.length > 1 && (
                <div className="flex flex-wrap gap-2">
                  {movie.season.map((season, idx) => (
                    <Button
                      key={idx}
                      size="sm"
                      variant={idx === seasonIndex ? "default" : "outline"}
                      onClick={() => onSelectSeason(idx)}
                      className={
                        idx === seasonIndex
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                      }
                    >
                      {season.name ?? `Season ${idx + 1}`}
                    </Button>
                  ))}
                </div>
              )}
            </div>

            {isSeries && activeSeason && activeSeason.episodes?.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-neutral-800">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Episodes
                </h4>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {activeSeason.episodes.map((ep, idx) => {
                    const isCurrent = selectedEpisode && ep.name === selectedEpisode.name;
                    return (
                      <button
                        key={idx}
                        onClick={() => onSelectEpisode(ep, idx)}
                        className={`flex items-center gap-3 rounded-xl p-3 text-left transition ${
                          isCurrent
                            ? "bg-blue-600/20 border-blue-500/50 text-white border"
                            : "bg-neutral-800/50 border border-neutral-800 text-neutral-300 hover:bg-neutral-800 hover:text-white"
                        }`}
                      >
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                            isCurrent ? "bg-blue-600 text-white" : "bg-neutral-700 text-neutral-300"
                          }`}
                        >
                          <Play className="h-4 w-4 fill-current ml-0.5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{ep.name ?? `Episode ${idx + 1}`}</p>
                          <p className="text-xs text-neutral-500">Ep {idx + 1}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}