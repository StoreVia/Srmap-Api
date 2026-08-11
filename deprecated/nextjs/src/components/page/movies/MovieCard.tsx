"use client";
import { Film, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Movie } from "../../../types/movies";

interface MovieCardProps {
  movie: Movie;
  onSelect: (movie: Movie) => void;
}

export function MovieCard({ movie, onSelect }: MovieCardProps) {
  return (
    <div
      onClick={() => onSelect(movie)}
      className="group relative cursor-pointer overflow-hidden rounded-2xl bg-neutral-900 border border-neutral-800 shadow-lg transition hover:border-neutral-700 hover:shadow-2xl"
    >
      <div
        className="h-52 w-full bg-cover bg-center transition transform duration-300 group-hover:scale-105"
        style={{
          backgroundImage: `url(${
            movie.posterUrl ||
            movie.heroUrl ||
            "https://imgcdn.kim/pv/c/0KEKSUA04N2G90A8JKW6FO725I.jpg"
          })`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent p-4 flex flex-col justify-end">
        <h3 className="flex items-center gap-2 text-base font-bold text-white leading-tight">
          <Film className="h-4 w-4 shrink-0 text-blue-500" />
          {movie.Name}
        </h3>
        <p className="text-xs text-neutral-400 capitalize">{movie.type}</p>
        <Button
          size="sm"
          className="mt-3 w-full bg-blue-600 text-white hover:bg-blue-700"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(movie);
          }}
        >
          <Play className="mr-1.5 h-3.5 w-3.5 fill-current" /> Watch
        </Button>
      </div>
    </div>
  );
}