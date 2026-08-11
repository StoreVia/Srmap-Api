"use client";
import { useEffect, useState } from "react";
import { Layers, ArrowUp, ArrowDown, Save, Loader2, Plus, Trash2 } from "lucide-react";
import API from "@/lib/api/axiosClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface CategoryOrderItem {
  name: string;
  order: number;
}

interface CategoryOrderManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export function CategoryOrderManagerModal({ isOpen, onClose, onUpdated }: CategoryOrderManagerModalProps) {
  const [categories, setCategories] = useState<CategoryOrderItem[]>([]);
  const [newCatName, setNewCatName] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setFeedback(null);
      API.get("/admin/movies/categories")
        .then((res) => {
          const items: CategoryOrderItem[] = res.data.data || [];
          setCategories(items);
        })
        .catch((err) => console.error("Failed to load category orders", err))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  const moveOrder = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= categories.length) return;

    const nextCategories = [...categories];
    const temp = nextCategories[index];
    nextCategories[index] = nextCategories[targetIdx];
    nextCategories[targetIdx] = temp;

    nextCategories.forEach((cat, idx) => {
      cat.order = idx + 1;
    });

    setCategories(nextCategories);
  };

  const updateOrderInput = (index: number, newOrder: number) => {
    const nextCategories = [...categories];
    nextCategories[index].order = newOrder;
    setCategories(nextCategories);
  };

  const handleAddCategory = () => {
    const name = newCatName.trim();
    if (!name) return;
    if (categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      setFeedback(`Category "${name}" already exists.`);
      return;
    }
    const nextCategories = [...categories, { name, order: categories.length + 1 }];
    setCategories(nextCategories);
    setNewCatName("");
  };

  const handleRemoveCategory = (name: string) => {
    const nextCategories = categories.filter((c) => c.name !== name);
    nextCategories.forEach((c, idx) => (c.order = idx + 1));
    setCategories(nextCategories);
  };

  const handleSave = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      const sortedToSave = [...categories]
        .sort((a, b) => a.order - b.order)
        .map((c, idx) => ({ name: c.name, order: idx + 1 }));

      await API.post("/admin/movies/categories", { categories: sortedToSave });
      setFeedback("Successfully saved category display order!");
      onUpdated();
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setFeedback("Failed to save category order: " + (err.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto border-neutral-800 bg-neutral-950 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-white">
            <Layers className="h-5 w-5 text-blue-500" />
            Manage Categories & Display Order
          </DialogTitle>
        </DialogHeader>

        {feedback && (
          <div className="rounded-lg bg-blue-950/80 border border-blue-800 p-3 text-xs font-semibold text-blue-200">
            {feedback}
          </div>
        )}

        {loading ? (
          <div className="flex h-40 items-center justify-center text-neutral-400">
            <Loader2 className="mr-2 h-6 w-6 animate-spin text-blue-500" /> Loading Categories...
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-neutral-800 pb-4">
              <Input
                placeholder="Enter new category name (e.g. Anime, Marvel, Sci-Fi)..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                className="border-neutral-800 bg-neutral-900 text-white text-xs"
              />
              <Button onClick={handleAddCategory} size="sm" className="bg-blue-600 font-semibold text-white hover:bg-blue-700">
                <Plus className="mr-1 h-4 w-4" /> Add
              </Button>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-neutral-400">
                Arrange category display sequence (Top category shows first. "Others" is always placed at the very bottom automatically).
              </p>

              {categories.length === 0 ? (
                <div className="rounded-lg border border-dashed border-neutral-800 p-4 text-center text-xs text-neutral-500">
                  No categories found. Add categories above or assign categories to movies.
                </div>
              ) : (
                <div className="space-y-2">
                  {categories.map((cat, idx) => (
                    <div
                      key={cat.name}
                      className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900/60 p-3 hover:border-neutral-700 transition"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600/20 text-xs font-extrabold text-blue-400">
                          {idx + 1}
                        </span>
                        <span className="text-sm font-semibold text-white">{cat.name}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <label className="text-xs text-neutral-400">Order:</label>
                          <Input
                            type="number"
                            value={cat.order}
                            onChange={(e) => updateOrderInput(idx, parseInt(e.target.value) || idx + 1)}
                            className="h-8 w-16 text-center border-neutral-700 bg-neutral-900 text-white text-xs"
                          />
                        </div>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => moveOrder(idx, "up")}
                          disabled={idx === 0}
                          className="h-8 w-8 p-0 text-neutral-300 hover:text-white"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => moveOrder(idx, "down")}
                          disabled={idx === categories.length - 1}
                          className="h-8 w-8 p-0 text-neutral-300 hover:text-white"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveCategory(cat.name)}
                          className="h-8 w-8 p-0 text-neutral-400 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 border-t border-neutral-800 pt-4">
          <Button variant="outline" onClick={onClose} className="border-neutral-700 bg-neutral-900 text-white">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-blue-600 font-semibold text-white hover:bg-blue-700">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
            Save Category Order
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}