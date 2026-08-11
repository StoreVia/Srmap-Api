"use client";
import { useState, useEffect } from "react";
import { Play, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Movie } from "../../../types/movies";

interface HeroBannerProps {
  movie?: Movie;
  movies?: Movie[];
  onSelect: (movie: Movie) => void;
}

export function HeroBanner({ movie, movies, onSelect }: HeroBannerProps) {
  const featuredList = movies && movies.length > 0 ? movies : movie ? [movie] : [];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (featuredList.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredList.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [featuredList.length]);

  if (featuredList.length === 0) return null;

  const currentMovie = featuredList[currentIndex] || featuredList[0];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredList.length) % featuredList.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredList.length);
  };

  return (
    <div className="hidden md:block relative overflow-hidden rounded-3xl bg-neutral-950 text-white shadow-2xl border border-neutral-800 transition-all duration-500">
      <div
        className="h-88 md:h-96 w-full bg-cover bg-center transition-all duration-700"
        style={{
          backgroundImage: `url(${
            currentMovie.heroUrl ||
            currentMovie.posterUrl ||
            "https://imgcdn.kim/pv/c/0KEKSUA04N2G90A8JKW6FO725I.jpg"
          })`,
        }}
      >
        <div className="h-full w-full bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-neutral-950/20 p-6 md:p-10 flex flex-col justify-end relative">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-md">
              Featured Selection
            </span>
            {currentMovie.type && (
              <span className="rounded-full bg-neutral-800/90 border border-neutral-700 px-2.5 py-0.5 text-xs font-semibold uppercase text-neutral-300">
                {currentMovie.type}
              </span>
            )}
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl text-white drop-shadow-md">
            {currentMovie.Name}
          </h2>

          {currentMovie.description && (
            <p className="mt-2.5 max-w-2xl text-sm md:text-base text-neutral-300 line-clamp-2 leading-relaxed drop-shadow">
              {currentMovie.description}
            </p>
          )}

          <div className="mt-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                size="lg"
                onClick={() => onSelect(currentMovie)}
                className="bg-blue-600 font-bold text-white hover:bg-blue-700 shadow-xl hover:scale-105 transition-transform"
              >
                <Play className="mr-2 h-5 w-5 fill-current" /> Watch Now
              </Button>
            </div>

            {featuredList.length > 1 && (
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrev}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white border border-neutral-700 backdrop-blur-md hover:bg-neutral-800 transition"
                  title="Previous featured movie"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <div className="flex items-center gap-1.5">
                  {featuredList.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-2 rounded-full transition-all ${
                        idx === currentIndex ? "w-6 bg-blue-500" : "w-2 bg-neutral-600 hover:bg-neutral-400"
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={handleNext}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white border border-neutral-700 backdrop-blur-md hover:bg-neutral-800 transition"
                  title="Next featured movie"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}