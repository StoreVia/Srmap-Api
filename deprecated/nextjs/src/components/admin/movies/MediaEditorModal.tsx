"use client";
import { useEffect, useState } from "react";
import { Settings2, Video, Music, FileText, Loader2, Check, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MediaFormData } from "./types";
import { OptionArrayEditor } from "./OptionArrayEditor";
import { StreamConfigEditor } from "./StreamConfigEditor";
import { SeasonEditor } from "./SeasonEditor";

interface MediaEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEditing: boolean;
  formData: MediaFormData;
  setFormData: React.Dispatch<React.SetStateAction<MediaFormData>>;
  onSave: (payload: any) => Promise<void>;
  saving: boolean;
  feedback: { type: "success" | "error"; text: string } | null;
}

export function MediaEditorModal({
  isOpen,
  onClose,
  isEditing,
  formData,
  setFormData,
  onSave,
  saving,
  feedback,
}: MediaEditorModalProps) {
  const [rawJsonText, setRawJsonText] = useState("");
  const [isRootStreamOpen, setIsRootStreamOpen] = useState(false);

  useEffect(() => {
    setRawJsonText(JSON.stringify(formData, null, 2));
  }, [formData]);

  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    setFormData((prev) => ({
      ...prev,
      Name: name,
      Slug: isEditing ? prev.Slug : slug,
    }));
  };

  const handleFormSubmit = () => {
    let payload = formData;
    try {
      if (rawJsonText) {
        payload = JSON.parse(rawJsonText);
      }
    } catch {
      onSave(null);
      return;
    }
    onSave(payload);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto border-neutral-800 bg-neutral-950 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-white">
            {isEditing ? `Edit "${formData.Name}"` : "Create New Movie or Series"}
          </DialogTitle>
        </DialogHeader>

        {feedback && (
          <div
            className={`rounded-lg p-3 text-xs font-semibold border ${
              feedback.type === "success"
                ? "bg-blue-950/80 border-blue-800 text-blue-200"
                : "bg-red-950/80 border-red-800 text-red-200"
            }`}
          >
            {feedback.text}
          </div>
        )}

        <Tabs defaultValue="visual" className="w-full space-y-4">
          <TabsList className="border-neutral-800 bg-neutral-900 border">
            <TabsTrigger value="visual" className="text-xs">
              Visual Form Builder
            </TabsTrigger>
            <TabsTrigger value="rawjson" className="text-xs">
              Raw Document JSON
            </TabsTrigger>
          </TabsList>

          <TabsContent value="visual" className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-300">Title / Name *</label>
                <Input
                  placeholder="e.g. Se7en or Off Campus"
                  value={formData.Name || ""}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="border-neutral-800 bg-neutral-900 text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-300">URL Slug *</label>
                <Input
                  placeholder="e.g. seven or off-campus"
                  value={formData.Slug || ""}
                  onChange={(e) => setFormData({ ...formData, Slug: e.target.value })}
                  className="border-neutral-800 bg-neutral-900 text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-300">Media Type *</label>
                <select
                  value={formData.type || "movie"}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white"
                >
                  <option value="movie">Movie</option>
                  <option value="series">Series</option>
                  <option value="short-film">Short Film</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-300">Poster Image URL</label>
                <Input
                  placeholder="https://..."
                  value={formData.posterUrl || ""}
                  onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
                  className="border-neutral-800 bg-neutral-900 text-white"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-medium text-neutral-300">Hero Banner URL</label>
                <Input
                  placeholder="https://..."
                  value={formData.heroUrl || ""}
                  onChange={(e) => setFormData({ ...formData, heroUrl: e.target.value })}
                  className="border-neutral-800 bg-neutral-900 text-white"
                />
              </div>

              <div className="space-y-1.5 flex items-center gap-3 self-end border border-neutral-800 bg-neutral-900/60 p-2.5 rounded-md">
                <input
                  type="checkbox"
                  id="featured-checkbox"
                  checked={Boolean(formData.featured)}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="h-4 w-4 rounded accent-blue-600 cursor-pointer"
                />
                <label htmlFor="featured-checkbox" className="text-xs font-semibold text-white cursor-pointer select-none">
                  Featured Movie (Show on Hero Banner)
                </label>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-300">Featured Display Order</label>
                <Input
                  type="number"
                  placeholder="e.g. 1, 2, 3..."
                  value={formData.featuredOrder ?? 0}
                  onChange={(e) => setFormData({ ...formData, featuredOrder: parseInt(e.target.value) || 0 })}
                  className="border-neutral-800 bg-neutral-900 text-white"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="text-xs font-medium text-neutral-300">
                  Categories (Click options to toggle or type custom below)
                </label>

                <Input
                  placeholder="Or enter custom categories (comma-separated, e.g. Spider-Man, Anime)"
                  value={formData.categories ? formData.categories.join(", ") : ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      categories: e.target.value.split(",").map((c) => c.trim()).filter(Boolean),
                    })
                  }
                  className="border-neutral-800 bg-neutral-900 text-white text-xs"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-medium text-neutral-300">Description</label>
                <Textarea
                  placeholder="Short description or synopsis..."
                  rows={2}
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="border-neutral-800 bg-neutral-900 text-white"
                />
              </div>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 overflow-hidden">
              <button
                type="button"
                onClick={() => setIsRootStreamOpen((prev) => !prev)}
                className="flex w-full items-center justify-between p-4 text-left hover:bg-neutral-800/40 transition"
              >
                <div className="flex items-center gap-2">
                  <ChevronRight
                    className={`h-4 w-4 text-blue-400 transition-transform duration-200 ${
                      isRootStreamOpen ? "rotate-90" : ""
                    }`}
                  />
                  <h4 className="text-sm font-bold text-blue-400 flex items-center gap-1.5">
                    <Settings2 className="h-4 w-4" /> Root Stream & CDN Configuration
                  </h4>
                </div>
                <span className="text-xs text-neutral-500 font-mono">
                  {isRootStreamOpen ? "Click to collapse" : "Click to expand"}
                </span>
              </button>

              {isRootStreamOpen && (
                <div className="border-t border-neutral-800 p-4 space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-xs text-neutral-400">Stream CDN URL</label>
                      <Input
                        placeholder="https://s15.freecdn13.top"
                        value={formData.streamCdn || ""}
                        onChange={(e) => setFormData({ ...formData, streamCdn: e.target.value })}
                        className="border-neutral-800 bg-neutral-900 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-neutral-400">CDN ID</label>
                      <Input
                        placeholder="0KEKSUA04N2G90A8JKW6FO725I"
                        value={formData.cdnId || ""}
                        onChange={(e) => setFormData({ ...formData, cdnId: e.target.value })}
                        className="border-neutral-800 bg-neutral-900 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-neutral-400">Default Video Code</label>
                      <Input
                        placeholder="720p"
                        value={formData.defaults?.video || "720p"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            defaults: { ...formData.defaults, video: e.target.value },
                          })
                        }
                        className="border-neutral-800 bg-neutral-900 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-neutral-400">Default Audio Code</label>
                      <Input
                        placeholder="0"
                        value={formData.defaults?.audio || "0"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            defaults: { ...formData.defaults, audio: e.target.value },
                          })
                        }
                        className="border-neutral-800 bg-neutral-900 text-white text-xs"
                      />
                    </div>
                  </div>

                  <StreamConfigEditor
                    config={formData.streamConfig}
                    onChange={(newConf) => setFormData({ ...formData, streamConfig: newConf })}
                  />

                  <div className="grid gap-4 sm:grid-cols-3 border-t border-neutral-800 pt-3">
                    <OptionArrayEditor
                      title="Video Qualities"
                      icon={Video}
                      items={formData.stream?.video || []}
                      onChange={(newItems) =>
                        setFormData({
                          ...formData,
                          stream: { ...formData.stream, video: newItems },
                        })
                      }
                    />

                    <OptionArrayEditor
                      title="Audio Tracks"
                      icon={Music}
                      items={formData.stream?.audio || []}
                      onChange={(newItems) =>
                        setFormData({
                          ...formData,
                          stream: { ...formData.stream, audio: newItems },
                        })
                      }
                    />

                    <OptionArrayEditor
                      title="Subtitles"
                      icon={FileText}
                      items={formData.stream?.subtitles || []}
                      onChange={(newItems) =>
                        setFormData({
                          ...formData,
                          stream: { ...formData.stream, subtitles: newItems },
                        })
                      }
                      isSubtitle
                    />
                  </div>
                </div>
              )}
            </div>

            {formData.type === "series" && (
              <SeasonEditor
                seasons={formData.season || []}
                onChange={(newSeasons) => setFormData({ ...formData, season: newSeasons })}
              />
            )}
          </TabsContent>

          <TabsContent value="rawjson" className="space-y-2">
            <p className="text-xs text-neutral-400">
              You can directly edit or paste the full MongoDB JSON document string here (e.g. from movies.json or series.json).
            </p>
            <Textarea
              rows={16}
              value={rawJsonText}
              onChange={(e) => setRawJsonText(e.target.value)}
              className="font-mono text-xs border-neutral-800 bg-neutral-900 text-neutral-200"
            />
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-end gap-3 border-t border-neutral-800 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-neutral-700 bg-neutral-900 text-white hover:bg-neutral-800"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleFormSubmit}
            disabled={saving}
            className="bg-blue-600 font-semibold text-white hover:bg-blue-700"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Check className="mr-1.5 h-4 w-4" /> Save Document
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}