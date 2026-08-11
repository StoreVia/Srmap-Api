"use client";
import { Tv, Film, Edit3, Code, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CatalogGridProps {
  moviesList: any[];
  onEdit: (slug: string) => void;
  onViewJson: (slug: string) => void;
  onDelete: (slug: string, title: string) => void;
}

export function CatalogGrid({ moviesList, onEdit, onViewJson, onDelete }: CatalogGridProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {moviesList.map((item) => (
        <Card
          key={item.Slug}
          className="group relative overflow-hidden border-neutral-800 bg-neutral-900 transition hover:border-neutral-700 hover:shadow-2xl"
        >
          <div
            className="h-44 w-full bg-cover bg-center transition transform duration-300 group-hover:scale-105"
            style={{
              backgroundImage: `url(${
                item.posterUrl ||
                item.heroUrl ||
                "https://imgcdn.kim/pv/c/0KEKSUA04N2G90A8JKW6FO725I.jpg"
              })`,
            }}
          />
          <div className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-white leading-snug">{item.Name}</h3>
                <p className="text-xs font-mono text-neutral-400">slug: {item.Slug}</p>
              </div>
              <Badge
                className={
                  item.type === "series"
                    ? "bg-purple-600/20 text-purple-300 border-purple-500/30"
                    : "bg-blue-600/20 text-blue-300 border-blue-500/30"
                }
              >
                {item.type === "series" ? (
                  <Tv className="mr-1 h-3 w-3 inline" />
                ) : (
                  <Film className="mr-1 h-3 w-3 inline" />
                )}
                {item.type}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {item.featured && (
                <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/40 text-[10px]">
                  ⭐ Featured #{item.featuredOrder ?? 0}
                </Badge>
              )}
              {Array.isArray(item.categories) &&
                item.categories.map((cat: string) => (
                  <Badge key={cat} variant="outline" className="border-neutral-800 bg-neutral-900 text-[10px] text-neutral-400">
                    {cat}
                  </Badge>
                ))}
            </div>

            {item.description && (
              <p className="line-clamp-2 text-xs text-neutral-400">{item.description}</p>
            )}

            <div className="flex items-center justify-between border-t border-neutral-800 pt-3">
              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(item.Slug)}
                  className="h-8 border-neutral-700 text-xs text-neutral-200 hover:bg-neutral-800 hover:text-white"
                >
                  <Edit3 className="mr-1 h-3.5 w-3.5 text-blue-400" /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onViewJson(item.Slug)}
                  className="h-8 border-neutral-700 text-xs text-neutral-200 hover:bg-neutral-800 hover:text-white"
                >
                  <Code className="mr-1 h-3.5 w-3.5 text-purple-400" /> JSON
                </Button>
              </div>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(item.Slug, item.Name)}
                className="h-8 text-xs text-neutral-400 hover:bg-red-950/50 hover:text-red-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}