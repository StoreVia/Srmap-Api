"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Film, Search, ChevronDown, Loader2, RefreshCw, Filter } from "lucide-react";
import API from "@/lib/api/axiosClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Movie } from "@/types/movies";
import { MovieCard } from "@/components/page/movies/MovieCard";
import { HeroBanner } from "@/components/page/movies/HeroBanner";
import { MovieWatchView } from "@/components/page/movies/MovieWatchView";
import { CategoryRow } from "@/components/page/movies/CategoryRow";

interface Selection {
  movie: Movie;
  seasonIndex: number;
  episode: any;
}

export default function MoviesPage() {
  const searchParams = useSearchParams();
  const watchSlug = searchParams.get("watch");

  const [movies, setMovies] = useState<Movie[]>([]);
  const [featuredMovies, setFeaturedMovies] = useState<Movie[]>([]);
  const [categoryOrderMap, setCategoryOrderMap] = useState<{ [key: string]: number }>({});
  const [selected, setSelected] = useState<Selection | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [movieLoading, setMovieLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "movie" | "series" | "short-film">("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchMovies = useCallback((p: number, q: string, append = false) => {
    if (append) setLoadingMore(true);
    else setLoading(true);

    API.get("/movies", { params: { page: p, limit: 200, search: q } })
      .then((response) => {
        const loadedMovies: Movie[] = response.data.data ?? [];
        const pag = response.data.pagination;
        if (append) {
          setMovies((prev) => [...prev, ...loadedMovies]);
        } else {
          setMovies(loadedMovies);
        }
        setHasMore(pag?.hasMore ?? false);
        setPage(p);
      })
      .catch(() => {
        if (!append) setMovies([]);
      })
      .finally(() => {
        setLoading(false);
        setLoadingMore(false);
      });
  }, []);

  const fetchCategoryOrders = useCallback(() => {
    API.get("/movies/categories")
      .then((res) => {
        const orderMap = res.data.orderMap || {};
        setCategoryOrderMap(orderMap);
      })
      .catch((err) => console.error("Failed to load category orders", err));
  }, []);

  const handleRefresh = () => {
    fetchMovies(1, searchQuery, false);
    API.get("/movies", { params: { featured: "true" } })
      .then((res) => setFeaturedMovies(res.data.data ?? []))
      .catch(() => {});
    fetchCategoryOrders();
  };

  useEffect(() => {
    API.get("/movies", { params: { featured: "true" } })
      .then((res) => {
        const feat = res.data.data ?? [];
        setFeaturedMovies(feat);
      })
      .catch((err) => console.error("Failed to load featured movies", err));

    fetchCategoryOrders();
  }, [fetchCategoryOrders]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMovies(1, searchQuery, false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchMovies]);

  const handleLoadMore = () => {
    if (!hasMore || loadingMore) return;
    fetchMovies(page + 1, searchQuery, true);
  };

  useEffect(() => {
    if (!watchSlug) {
      setSelected(null);
      return;
    }

    setMovieLoading(true);
    API.get(`/movies/${encodeURIComponent(watchSlug)}`)
      .then((response) => {
        const fullMovie: Movie = response.data.data;
        if (fullMovie) {
          const season = fullMovie.season?.[0];
          const ep = season?.episodes?.[0]
            ? { ...season.episodes[0], number: 1 }
            : {
                name: fullMovie.Name,
                streamConfig: fullMovie.streamConfig,
                number: 1,
              };
          setSelected({
            movie: fullMovie,
            seasonIndex: 0,
            episode: ep,
          });
        }
      })
      .catch((err) => console.error("Error fetching single movie:", err))
      .finally(() => setMovieLoading(false));
  }, [watchSlug]);

  function selectMovie(movieSummary: Movie) {
    window.history.pushState(null, "", `/movies?watch=${encodeURIComponent(movieSummary.Slug)}`);
    setMovieLoading(true);
    API.get(`/movies/${encodeURIComponent(movieSummary.Slug)}`)
      .then((response) => {
        const fullMovie: Movie = response.data.data;
        if (fullMovie) {
          const season = fullMovie.season?.[0];
          const ep = season?.episodes?.[0]
            ? { ...season.episodes[0], number: 1 }
            : {
                name: fullMovie.Name,
                streamConfig: fullMovie.streamConfig,
                number: 1,
              };
          setSelected({
            movie: fullMovie,
            seasonIndex: 0,
            episode: ep,
          });
        }
      })
      .finally(() => setMovieLoading(false));
  }

  function handleBack() {
    setSelected(null);
    window.history.pushState(null, "", "/movies");
  }

  function selectSeason(index: number) {
    if (!selected) return;
    const season = selected.movie.season?.[index];
    if (!season?.episodes.length) return;
    setSelected({ ...selected, seasonIndex: index, episode: { ...season.episodes[0], number: 1 } });
  }

  function selectEpisode(episode: any, index: number) {
    if (!selected) return;
    setSelected({ ...selected, episode: { ...episode, number: index + 1 } });
  }

  const filteredMovies = useMemo(() => {
    if (typeFilter === "all") return movies;
    if (typeFilter === "movie") return movies.filter((m) => m.type === "movie");
    if (typeFilter === "series") return movies.filter((m) => m.type === "series");
    return movies;
  }, [movies, typeFilter]);

  const categoryGroups = useMemo(() => {
    const groups: { [key: string]: Movie[] } = {};

    filteredMovies.forEach((m) => {
      if (Array.isArray(m.categories) && m.categories.length > 0) {
        m.categories.forEach((cat) => {
          const trimmed = String(cat).trim();
          if (trimmed) {
            if (!groups[trimmed]) groups[trimmed] = [];
            if (!groups[trimmed].some((x) => x.Slug === m.Slug)) {
              groups[trimmed].push(m);
            }
          }
        });
      } else {
        if (!groups["Others"]) groups["Others"] = [];
        if (!groups["Others"].some((x) => x.Slug === m.Slug)) {
          groups["Others"].push(m);
        }
      }
    });

    const entries = Object.entries(groups);
    entries.sort(([catA], [catB]) => {
      if (catA === "Others") return 1;
      if (catB === "Others") return -1;

      const orderA = categoryOrderMap[catA] !== undefined ? categoryOrderMap[catA] : 999;
      const orderB = categoryOrderMap[catB] !== undefined ? categoryOrderMap[catB] : 999;

      if (orderA !== orderB) return orderA - orderB;
      return catA.localeCompare(catB);
    });

    return entries;
  }, [filteredMovies, categoryOrderMap]);

  return (
    <div className="w-full">
      {selected ? (
        <MovieWatchView
          movie={selected.movie}
          seasonIndex={selected.seasonIndex}
          selectedEpisode={selected.episode}
          movieLoading={movieLoading}
          onBack={handleBack}
          onSelectSeason={selectSeason}
          onSelectEpisode={selectEpisode}
        />
      ) : (
        <Card className="w-full border-neutral-800 bg-neutral-900/60 backdrop-blur-md shadow-2xl p-4 md:p-6 space-y-6">
          <CardHeader className="p-0 pb-4 border-b border-neutral-800 flex flex-row flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
                <Film className="h-6 w-6 text-blue-500" /> Movies & Series
              </CardTitle>
              <CardDescription className="text-xs text-neutral-400">
                Browse dynamic movie category collections, series, and featured releases.
              </CardDescription>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-neutral-400 hidden sm:inline" />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as any)}
                  className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="all">All Types</option>
                  <option value="movie">Movies Only</option>
                  <option value="series">Series Only</option>
                </select>
              </div>

              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
                <Input
                  placeholder="Search movies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 border-neutral-800 bg-neutral-900 text-white placeholder:text-neutral-500 text-xs"
                />
              </div>

              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                className="border-neutral-700 bg-neutral-900 text-neutral-300 hover:bg-neutral-800 hover:text-white"
                title="Refresh Movies & Categories"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="hidden sm:inline ml-1.5">Refresh</span>
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0 space-y-8">
            {!searchQuery && (
              <HeroBanner
                movies={featuredMovies.length > 0 ? featuredMovies : movies.slice(0, 3)}
                onSelect={selectMovie}
              />
            )}

            {loading ? (
              <div className="flex h-48 items-center justify-center text-neutral-400">
                <Loader2 className="mr-2 h-6 w-6 animate-spin text-blue-500" /> Loading Catalog via API...
              </div>
            ) : filteredMovies.length === 0 ? (
              <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-8 text-center text-neutral-400">
                No items match your filter criteria or search query.
              </div>
            ) : searchQuery ? (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white">Search Results</h3>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredMovies.map((movie) => (
                    <MovieCard key={movie.Slug} movie={movie} onSelect={selectMovie} />
                  ))}
                </div>

                {hasMore && (
                  <div className="flex justify-center pt-6 border-t border-neutral-800">
                    <Button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      variant="outline"
                      className="border-neutral-700 bg-neutral-900 text-white hover:bg-neutral-800"
                    >
                      {loadingMore ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading more...
                        </>
                      ) : (
                        <>
                          <ChevronDown className="mr-1.5 h-4 w-4" /> Load More via API
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-8">
                {categoryGroups.map(([catTitle, catMovies]) => (
                  <CategoryRow
                    key={catTitle}
                    title={catTitle}
                    movies={catMovies}
                    onSelect={selectMovie}
                  />
                ))}

                {hasMore && (
                  <div className="flex justify-center pt-6 border-t border-neutral-800">
                    <Button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      variant="outline"
                      className="border-neutral-700 bg-neutral-900 text-white hover:bg-neutral-800"
                    >
                      {loadingMore ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading more categories...
                        </>
                      ) : (
                        <>
                          <ChevronDown className="mr-1.5 h-4 w-4" /> Load More via API
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}