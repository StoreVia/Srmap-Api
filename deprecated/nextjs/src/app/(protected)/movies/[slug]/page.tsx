"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Play } from "lucide-react";
import API from "@/lib/api/axiosClient";
import { Button } from "@/components/ui/button";
import { Movie } from "../../../../types/movies";
import { MoviePlayer } from "../../../../components/admin/movies/movies/MoviePlayer";

export default function MovieSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [seasonIndex, setSeasonIndex] = useState<number>(0);
  const [selectedEpisode, setSelectedEpisode] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/movies/${encodeURIComponent(slug)}`)
      .then((res) => {
        const match: Movie = res.data.data;
        if (match) {
          setMovie(match);
          const firstSeason = match.season?.[0];
          const ep = firstSeason?.episodes?.[0]
            ? { ...firstSeason.episodes[0], number: 1 }
            : {
                name: match.Name,
                streamConfig: match.streamConfig,
                number: 1,
              };
          setSelectedEpisode(ep);
        }
      })
      .catch((err) => console.error("Unable to load movie:", err))
      .finally(() => setLoading(false));
  }, [slug]);

  const activeSeason = movie?.season?.[seasonIndex];

  const isSeries =
    movie?.type === "series" ||
    (movie && (movie.season?.length ?? 0) > 1) ||
    (activeSeason && (activeSeason.episodes?.length ?? 0) > 1);

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl p-6 text-center text-neutral-400">
        Loading video stream...
      </main>
    );
  }

  if (!movie || (!selectedEpisode && !movie.streamConfig)) {
    return (
      <main className="mx-auto max-w-6xl p-6 space-y-4 text-center">
        <p className="text-neutral-400">Movie not found.</p>
        <Button onClick={() => router.push("/movies")} variant="outline">
          Back to Movies
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <Button
          onClick={() => router.push("/movies")}
          variant="outline"
          size="sm"
          className="gap-2 border-neutral-700 bg-neutral-900/80 text-white hover:bg-neutral-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Movies
        </Button>
      </div>

      <MoviePlayer
        slug={movie.Slug}
        season={seasonIndex + 1}
        episode={selectedEpisode || undefined}
        movie={movie}
        streamConfig={movie.streamConfig as any}
        movieTitle={movie.Name}
        movieType={movie.type}
        onBack={() => router.push("/movies")}
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
                  onClick={() => {
                    setSeasonIndex(idx);
                    if (season.episodes?.length > 0) {
                      setSelectedEpisode(season.episodes[0]);
                    }
                  }}
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

        {isSeries && activeSeason && activeSeason.episodes && activeSeason.episodes.length > 0 && (
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
                    onClick={() => setSelectedEpisode({ ...ep, number: idx + 1 })}
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
    </main>
  );
}