"use client";
import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Play, Film, Tv } from "lucide-react";
import { Movie } from "../../../types/movies";
import { Badge } from "@/components/ui/badge";

interface CategoryRowProps {
  title: string;
  movies: Movie[];
  onSelect: (movie: Movie) => void;
  icon?: React.ReactNode;
}

export function CategoryRow({ title, movies, onSelect, icon }: CategoryRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkScroll = () => {
    if (!rowRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
    setShowLeftArrow(scrollLeft > 10);
    setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [movies]);

  const scroll = (direction: "left" | "right") => {
    if (!rowRef.current) return;
    const { clientWidth } = rowRef.current;
    const scrollAmount = direction === "left" ? -clientWidth * 0.75 : clientWidth * 0.75;
    rowRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  if (!movies || movies.length === 0) return null;

  return (
    <div className="space-y-3 py-2">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
          {icon}
          {title}
          <span className="text-xs font-semibold text-neutral-400 font-mono ml-2 bg-neutral-800 px-2 py-0.5 rounded-full">
            {movies.length}
          </span>
        </h3>
      </div>

      <div className="group/row relative">
        {showLeftArrow && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-0 bottom-0 z-30 flex w-12 items-center justify-center bg-gradient-to-r from-black/90 via-black/50 to-transparent text-white opacity-0 transition-opacity duration-300 group-hover/row:opacity-100"
            title="Scroll Left"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900/80 border border-neutral-700 backdrop-blur-md shadow-xl hover:scale-110 transition">
              <ChevronLeft className="h-6 w-6" />
            </div>
          </button>
        )}

        <div
          ref={rowRef}
          onScroll={checkScroll}
          className="flex gap-4 overflow-x-auto scroll-smooth py-3 px-1 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none]"
          style={{ scrollbarWidth: "none" }}
        >
          {movies.map((movie) => (
            <div
              key={movie.Slug}
              onClick={() => onSelect(movie)}
              className="group/card relative flex-none w-44 sm:w-52 cursor-pointer rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900/80 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-neutral-700 hover:shadow-2xl hover:z-20"
            >
              <div
                className="h-64 sm:h-72 w-full bg-cover bg-center transition-transform duration-500 group-hover/card:scale-110"
                style={{
                  backgroundImage: `url(${
                    movie.posterUrl ||
                    movie.heroUrl ||
                    "https://imgcdn.kim/pv/c/0KEKSUA04N2G90A8JKW6FO725I.jpg"
                  })`,
                }}
              >
                <div className="h-full w-full bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent p-4 flex flex-col justify-between opacity-90 group-hover/card:opacity-100 transition-opacity">
                  <div className="flex justify-end">
                    <Badge
                      className={
                        movie.type === "series"
                          ? "bg-purple-600/90 text-white font-bold"
                          : "bg-blue-600/90 text-white font-bold"
                      }
                    >
                      {movie.type === "series" ? (
                        <Tv className="mr-1 h-3 w-3 inline" />
                      ) : (
                        <Film className="mr-1 h-3 w-3 inline" />
                      )}
                      {movie.type}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-sm sm:text-base font-extrabold text-white leading-tight drop-shadow">
                      {movie.Name}
                    </h4>

                    <div className="flex items-center gap-2 pt-1 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                      <span className="flex items-center gap-1 text-xs font-bold text-blue-400 bg-blue-950/80 border border-blue-800 px-2 py-1 rounded-lg">
                        <Play className="h-3 w-3 fill-current" /> Watch
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {showRightArrow && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-0 bottom-0 z-30 flex w-12 items-center justify-center bg-gradient-to-l from-black/90 via-black/50 to-transparent text-white opacity-0 transition-opacity duration-300 group-hover/row:opacity-100"
            title="Scroll Right"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900/80 border border-neutral-700 backdrop-blur-md shadow-xl hover:scale-110 transition">
              <ChevronRight className="h-6 w-6" />
            </div>
          </button>
        )}
      </div>
    </div>
  );
}