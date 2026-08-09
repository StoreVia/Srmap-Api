"use client";
import { useEffect, useState } from "react";
import { Star, ArrowUp, ArrowDown, Save, Loader2 } from "lucide-react";
import API from "@/lib/api/axiosClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface FeaturedManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export function FeaturedManagerModal({ isOpen, onClose, onUpdated }: FeaturedManagerModalProps) {
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setFeedback(null);
      API.get("/admin/movies", { params: { limit: 200 } })
        .then((res) => {
          const items = res.data.data || [];
          setMovies(items);
        })
        .catch((err) => console.error("Failed to load catalog for featured manager", err))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  const toggleFeatured = (slug: string) => {
    setMovies((prev) =>
      prev.map((m) => {
        if (m.Slug === slug) {
          const newFeatured = !m.featured;
          return {
            ...m,
            featured: newFeatured,
            featuredOrder: newFeatured ? (m.featuredOrder ?? 1) : 0,
          };
        }
        return m;
      })
    );
  };

  const updateOrder = (slug: string, newOrder: number) => {
    setMovies((prev) =>
      prev.map((m) => (m.Slug === slug ? { ...m, featuredOrder: newOrder } : m))
    );
  };

  const moveOrder = (slug: string, direction: "up" | "down") => {
    const featuredItems = movies
      .filter((m) => m.featured)
      .sort((a, b) => (a.featuredOrder ?? 0) - (b.featuredOrder ?? 0));

    const index = featuredItems.findIndex((m) => m.Slug === slug);
    if (index === -1) return;

    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= featuredItems.length) return;

    const itemA = featuredItems[index];
    const itemB = featuredItems[targetIdx];

    const tempOrder = itemA.featuredOrder ?? 1;
    itemA.featuredOrder = itemB.featuredOrder ?? 2;
    itemB.featuredOrder = tempOrder;

    setMovies((prev) =>
      prev.map((m) => {
        if (m.Slug === itemA.Slug) return { ...m, featuredOrder: itemA.featuredOrder };
        if (m.Slug === itemB.Slug) return { ...m, featuredOrder: itemB.featuredOrder };
        return m;
      })
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      for (const m of movies) {
        await API.put(`/admin/movies/${encodeURIComponent(m.Slug)}`, {
          featured: Boolean(m.featured),
          featuredOrder: Number(m.featuredOrder || 0),
        });
      }
      setFeedback("Successfully saved featured movies and order!");
      onUpdated();
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setFeedback("Failed to save: " + (err.message || "Error updating movies"));
    } finally {
      setSaving(false);
    }
  };

  const featuredList = movies
    .filter((m) => m.featured)
    .sort((a, b) => (a.featuredOrder ?? 0) - (b.featuredOrder ?? 0));

  const unfeaturedList = movies.filter((m) => !m.featured);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto border-neutral-800 bg-neutral-950 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-white">
            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            Manage Featured Movies & Banner Order
          </DialogTitle>
        </DialogHeader>

        {feedback && (
          <div className="rounded-lg bg-blue-950/80 border border-blue-800 p-3 text-xs font-semibold text-blue-200">
            {feedback}
          </div>
        )}

        {loading ? (
          <div className="flex h-40 items-center justify-center text-neutral-400">
            <Loader2 className="mr-2 h-6 w-6 animate-spin text-blue-500" /> Loading Catalog...
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-yellow-400 flex items-center justify-between">
                <span>Featured Movies (Hero Banner Carousel)</span>
                <Badge variant="outline" className="border-yellow-500/40 text-yellow-300">
                  {featuredList.length} Selected
                </Badge>
              </h4>
              {featuredList.length === 0 ? (
                <div className="rounded-lg border border-dashed border-neutral-800 p-4 text-center text-xs text-neutral-500">
                  No movies selected as featured. Check movies below to feature them.
                </div>
              ) : (
                <div className="space-y-2">
                  {featuredList.map((m, idx) => (
                    <div
                      key={m.Slug}
                      className="flex items-center justify-between rounded-lg border border-yellow-500/30 bg-yellow-950/20 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500/20 text-xs font-extrabold text-yellow-300">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-white">{m.Name}</p>
                          <p className="text-xs text-neutral-400 font-mono">slug: {m.Slug}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <label className="text-xs text-neutral-400">Order:</label>
                          <Input
                            type="number"
                            value={m.featuredOrder ?? idx + 1}
                            onChange={(e) => updateOrder(m.Slug, parseInt(e.target.value) || 0)}
                            className="h-8 w-16 text-center border-neutral-700 bg-neutral-900 text-white text-xs"
                          />
                        </div>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => moveOrder(m.Slug, "up")}
                          disabled={idx === 0}
                          className="h-8 w-8 p-0 text-neutral-300 hover:text-white"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => moveOrder(m.Slug, "down")}
                          disabled={idx === featuredList.length - 1}
                          className="h-8 w-8 p-0 text-neutral-300 hover:text-white"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleFeatured(m.Slug)}
                          className="h-8 border-red-800 text-xs text-red-300 hover:bg-red-950"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3 border-t border-neutral-800 pt-4">
              <h4 className="text-sm font-bold text-neutral-300">All Other Movies (Click to Feature)</h4>
              <div className="grid gap-2 sm:grid-cols-2 max-h-56 overflow-y-auto p-1">
                {unfeaturedList.map((m) => (
                  <div
                    key={m.Slug}
                    onClick={() => toggleFeatured(m.Slug)}
                    className="flex cursor-pointer items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900/60 p-2.5 hover:border-neutral-700 transition"
                  >
                    <span className="text-xs font-medium text-neutral-200">{m.Name}</span>
                    <Button size="sm" variant="ghost" className="h-7 text-xs text-yellow-400 hover:text-yellow-300">
                      + Feature
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 border-t border-neutral-800 pt-4">
          <Button variant="outline" onClick={onClose} className="border-neutral-700 bg-neutral-900 text-white">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-yellow-600 font-semibold text-white hover:bg-yellow-700">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
            Save Featured Selection & Order
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}