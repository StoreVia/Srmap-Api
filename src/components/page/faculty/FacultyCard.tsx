"use client";
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { FacultyItem } from "@/types/faculty";
import { Star, ChevronDown, MapPin, Maximize2 } from "lucide-react";

interface FacultyCardProps {
  faculty: FacultyItem;
  onSelect: (faculty: FacultyItem) => void;
  onRate: (faculty: FacultyItem) => void;
}

export function FacultyCard({ faculty, onSelect, onRate }: FacultyCardProps) {
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const summary = faculty.ratingSummary;
  const hasRating = summary && summary.totalRatings > 0;

  const cleanName = (name: string) => {
    if (!name) return "";
    let n = name.trim();
    const half = n.length / 2;
    if (n.length % 2 === 0 && n.slice(0, half) === n.slice(half)) {
      n = n.slice(0, half);
    }
    return n.replace(/^(Prof\.|Dr\.)([^\s])/i, "$1 $2");
  };

  const displayName = cleanName(faculty.name);
  const displayImage = faculty.imageUrl || "https://www.srmap.edu.in/wp-content/uploads/2025/03/Faculty-Fallback_1.png";

  return (
    <>
      <Card className="w-full overflow-hidden hover:shadow-md transition-all border-border/60 hover:border-primary/40 flex flex-col justify-between group">
        <CardContent className="p-4 sm:p-5 flex flex-col h-full justify-between gap-4">
          <div className="cursor-pointer" onClick={() => onSelect(faculty)}>
            <div className="flex items-center gap-3">
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setImageModalOpen(true);
                }}
                className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-muted border border-border flex-shrink-0 hover:ring-2 hover:ring-primary/50 transition-all group/avatar"
                title="Click to view full photo"
              >
                <img
                  src={displayImage}
                  alt={displayName}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity">
                  <Maximize2 className="w-4 h-4 text-white" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors leading-snug break-words">
                  {displayName}
                </h3>
              </div>
            </div>

            <div className="mt-3 space-y-1">
              <p className="text-xs text-primary font-medium leading-normal break-words">
                {faculty.designation}
              </p>

              {faculty.departments && faculty.departments.length > 0 && (
                <p className="text-xs text-muted-foreground leading-normal break-words">
                  {faculty.departments.join(", ")}
                </p>
              )}
            </div>

            <div className="mt-3.5 space-y-2 pt-3 border-t border-border/40 text-xs">
              {faculty.degree && (
                <div className="flex items-start gap-2 text-muted-foreground">
                  <img
                    decoding="async"
                    src="https://www.srmap.edu.in/wp-content/uploads/2025/06/degree_icon.svg"
                    className="w-4 h-4 flex-shrink-0 mt-0.5"
                    alt="degree"
                  />
                  <span className="leading-tight break-words">{faculty.degree}</span>
                </div>
              )}

              {faculty.email && (
                <div className="flex items-center gap-2 text-muted-foreground truncate">
                  <img
                    decoding="async"
                    src="https://www.srmap.edu.in/wp-content/uploads/2025/05/mail_icon.svg"
                    className="w-4 h-4 flex-shrink-0"
                    alt="email"
                  />
                  <span className="truncate">{faculty.email}</span>
                </div>
              )}

              {faculty.officeLocation && (
                <div className="flex items-center gap-2 text-muted-foreground truncate">
                  <MapPin className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                  <span className="truncate">{faculty.officeLocation}</span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold bg-muted/60 hover:bg-muted transition-colors border"
                  >
                    <Star className={`w-3.5 h-3.5 ${hasRating ? "text-amber-500 fill-amber-500" : "text-muted-foreground"}`} />
                    <span>{hasRating ? `${summary.overallAvg}` : "Unrated"}</span>
                    <ChevronDown className="w-3 h-3 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 p-2">
                  <DropdownMenuLabel className="text-xs font-bold">
                    Rating Breakdown
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {hasRating ? (
                    <div className="space-y-2 py-1 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Teaching:</span>
                        <span className="font-mono font-bold">{summary.teachingAvg} / 5</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Exams:</span>
                        <span className="font-mono font-bold">{summary.examsAvg} / 5</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Correction:</span>
                        <span className="font-mono font-bold">{summary.correctionAvg} / 5</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Marks:</span>
                        <span className="font-mono font-bold">{summary.marksAvg} / 5</span>
                      </div>
                      <DropdownMenuSeparator />
                      <div className="text-[11px] text-muted-foreground text-center">
                        Based on {summary.totalRatings} student reviews
                      </div>
                    </div>
                  ) : (
                    <div className="py-2 text-xs text-muted-foreground text-center">
                      No ratings submitted yet
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {hasRating && (
                <span className="text-[11px] text-muted-foreground">
                  ({summary.totalRatings})
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs px-2.5"
                onClick={() => onRate(faculty)}
              >
                Rate
              </Button>
              <Button
                variant="default"
                size="sm"
                className="h-7 text-xs px-2.5"
                onClick={() => onSelect(faculty)}
              >
                Details
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
        <DialogContent className="max-w-md p-4 flex flex-col items-center">
          <DialogTitle className="text-base font-bold text-center truncate w-full">
            {displayName}
          </DialogTitle>
          <div className="w-full max-h-[70vh] rounded-lg overflow-hidden border mt-2 flex items-center justify-center bg-black/5 dark:bg-black/40">
            <img
              src={displayImage}
              alt={displayName}
              className="w-full h-auto max-h-[70vh] object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
