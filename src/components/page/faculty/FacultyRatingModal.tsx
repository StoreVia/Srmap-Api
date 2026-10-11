"use client";
import React, { useState } from "react";
import API from "@/lib/api/axiosClient";
import { toast } from "@/hooks/utils/useToast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogWindowClose } from "@/components/ui/dialog";
import { FacultyItem } from "@/types/faculty";
import { Star, Loader2 } from "lucide-react";

interface FacultyRatingModalProps {
  faculty: FacultyItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRatingSuccess: (facultyId: string, summary: any, userRating: any) => void;
}

const CATEGORIES = [
  { key: "teaching", label: "Teaching", desc: "Clarity & syllabus coverage" },
  { key: "exams", label: "Exams", desc: "Paper fairness & syllabus alignment" },
  { key: "correction", label: "Correction", desc: "Strict vs lenient paper evaluation" },
  { key: "marks", label: "Marks", desc: "Generosity with internals & grading" }
] as const;

export function FacultyRatingModal({
  faculty,
  open,
  onOpenChange,
  onRatingSuccess
}: FacultyRatingModalProps) {
  const [ratings, setRatings] = useState<Record<string, number>>({
    teaching: 4,
    exams: 4,
    correction: 4,
    marks: 4
  });
  const [submitting, setSubmitting] = useState(false);

  const cleanName = (name: string) => {
    if (!name) return "";
    let n = name.trim();
    const half = n.length / 2;
    if (n.length % 2 === 0 && n.slice(0, half) === n.slice(half)) {
      n = n.slice(0, half);
    }
    return n.replace(/^(Prof\.|Dr\.)([^\s])/i, "$1 $2");
  };

  const displayName = cleanName(faculty?.name || "");

  const handleSubmit = async () => {
    const targetId = faculty?._id || faculty?.slug;
    if (!targetId) return;
    setSubmitting(true);
    try {
      const res = await API.post(`/faculty/${targetId}/rate`, ratings);
      if (res.data?.success) {
        toast({
          title: "Rating Submitted",
          description: `Thank you for rating ${displayName}.`
        });
        onRatingSuccess(String(faculty?._id || targetId), res.data.data.ratingSummary, res.data.data.userRating);
        onOpenChange(false);
      }
    } catch (err: any) {
      toast({
        title: "Submission failed",
        description: err.response?.data?.message || "Could not submit rating",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[94vw] sm:w-full max-h-[85vh] overflow-hidden flex flex-col p-0 rounded-xl">
        <DialogHeader className="p-3.5 sm:p-4 border-b bg-muted/20 flex-shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-base font-bold truncate">
                Rate {displayName}
              </DialogTitle>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Scale: 1 (Worst) to 5 (Nice). One rating allowed per student.
              </p>
            </div>
            <DialogWindowClose />
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-3.5 space-y-2">
          {CATEGORIES.map(({ key, label, desc }) => (
            <div key={key} className="p-2.5 rounded-lg border bg-muted/20 flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-foreground">{label}</div>
                <div className="text-[10px] text-muted-foreground truncate">{desc}</div>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRatings(prev => ({ ...prev, [key]: star }))}
                    className={`p-1 rounded transition-colors ${
                      star <= ratings[key]
                        ? "text-amber-500"
                        : "text-muted-foreground/40 hover:text-muted-foreground"
                    }`}
                  >
                    <Star className={`w-4 h-4 ${star <= ratings[key] ? "fill-amber-500" : ""}`} />
                  </button>
                ))}
                <span className="text-xs font-mono font-bold ml-1 w-6 text-right text-primary">
                  {ratings[key]}
                </span>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter className="p-3 border-t bg-muted/20 flex-shrink-0 flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={submitting}>
            {submitting && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
            Submit Rating
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
