"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Loader2,
  RefreshCw,
  Search,
  ChevronDown,
  Layers,
} from "lucide-react";
import API from "@/lib/api/axiosClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  MediaFormData,
  DEFAULT_FORM_DATA,
} from "../../../../components/admin/movies/types";
import { CatalogGrid } from "../../../../components/admin/movies/CatalogGrid";
import { JsonViewerModal } from "../../../../components/admin/movies/JsonViewerModal";
import { MediaEditorModal } from "../../../../components/admin/movies/MediaEditorModal";
import { FeaturedManagerModal } from "../../../../components/admin/movies/FeaturedManagerModal";
import { CategoryOrderManagerModal } from "../../../../components/admin/movies/CategoryOrderManagerModal";

export default function AdminMoviesPage() {
  const router = useRouter();
  const [moviesList, setMoviesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isFeaturedManagerOpen, setIsFeaturedManagerOpen] = useState(false);
  const [isCategoryOrderOpen, setIsCategoryOrderOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<MediaFormData>(DEFAULT_FORM_DATA);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [jsonViewerData, setJsonViewerData] = useState<any | null>(null);

  const loadCatalog = useCallback((p: number, q: string, append = false) => {
    if (append) setLoadingMore(true);
    else setLoading(true);

    API.get("/admin/movies", { params: { page: p, limit: 50, search: q } })
      .then((res) => {
        const items = res.data.data ?? [];
        const pag = res.data.pagination;
        if (append) {
          setMoviesList((prev) => [...prev, ...items]);
        } else {
          setMoviesList(items);
        }
        setHasMore(pag?.hasMore ?? false);
        setTotalCount(pag?.total ?? items.length);
        setPage(p);
      })
      .catch((err) => {
        console.error("Failed to fetch movies catalog:", err);
        if (!append) setMoviesList([]);
      })
      .finally(() => {
        setLoading(false);
        setLoadingMore(false);
      });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCatalog(1, searchQuery, false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, loadCatalog]);

  const handleLoadMore = () => {
    if (!hasMore || loadingMore) return;
    loadCatalog(page + 1, searchQuery, true);
  };

  const handleOpenCreate = () => {
    setFormData(JSON.parse(JSON.stringify(DEFAULT_FORM_DATA)));
    setIsEditing(false);
    setFeedback(null);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (slug: string) => {
    setSaving(true);
    API.get(`/admin/movies/${encodeURIComponent(slug)}`)
      .then((res) => {
        setFormData(res.data.data);
        setIsEditing(true);
        setFeedback(null);
        setIsEditorOpen(true);
      })
      .catch((err) => console.error("Failed to fetch raw movie document:", err))
      .finally(() => setSaving(false));
  };

  const handleViewJson = (slug: string) => {
    API.get(`/admin/movies/${encodeURIComponent(slug)}`)
      .then((res) => setJsonViewerData(res.data.data))
      .catch((err) => console.error("Failed to fetch raw json:", err));
  };

  const handleDelete = (slug: string, title: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${title}" (${slug}) from MongoDB?`,
      )
    ) {
      return;
    }
    API.delete(`/admin/movies/${encodeURIComponent(slug)}`)
      .then(() => loadCatalog(1, searchQuery, false))
      .catch((err) =>
        alert(
          "Failed to delete item: " +
            (err?.response?.data?.message || err.message),
        ),
      );
  };

  const handleSave = async (submitPayload: any) => {
    if (!submitPayload) {
      setFeedback({
        type: "error",
        text: "Invalid raw JSON text syntax. Please check syntax.",
      });
      return;
    }

    if (!submitPayload.Name || !submitPayload.Slug || !submitPayload.type) {
      setFeedback({
        type: "error",
        text: "Please enter Name, Slug, and select Type.",
      });
      return;
    }

    setSaving(true);
    setFeedback(null);

    const request = isEditing
      ? API.put(
          `/admin/movies/${encodeURIComponent(submitPayload.Slug)}`,
          submitPayload,
        )
      : API.post("/admin/movies", submitPayload);

    request
      .then(() => {
        setFeedback({
          type: "success",
          text: `Successfully saved "${submitPayload.Name}"!`,
        });
        loadCatalog(1, searchQuery, false);
        setTimeout(() => setIsEditorOpen(false), 1200);
      })
      .catch((err) => {
        setFeedback({
          type: "error",
          text:
            err?.response?.data?.message ||
            err.message ||
            "Failed to save media document.",
        });
      })
      .finally(() => setSaving(false));
  };

  return (
    <div className="w-full">
      <Card className="w-full border-neutral-800 bg-neutral-900/60 backdrop-blur-md shadow-2xl overflow-hidden">
        <CardHeader className="px-4 py-4 md:px-6 md:py-5 border-b border-neutral-800">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={() => setIsFeaturedManagerOpen(true)}
                variant="outline"
                size="sm"
                className="border-yellow-600/40 bg-yellow-950/20 text-yellow-300 hover:bg-yellow-900/40 font-semibold"
              >
                Manage Featured
              </Button>

              <Button
                onClick={() => setIsCategoryOrderOpen(true)}
                variant="outline"
                size="sm"
                className="border-blue-600/40 bg-blue-950/20 text-blue-300 hover:bg-blue-900/40 font-semibold"
              >
                <Layers className="mr-1.5 h-3.5 w-3.5 text-blue-400" />
                Manage Categories
              </Button>

              <Button
                onClick={() => loadCatalog(1, searchQuery, false)}
                variant="outline"
                size="sm"
                className="border-neutral-700 bg-neutral-900 text-neutral-300 hover:bg-neutral-800"
              >
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                Refresh
              </Button>

              <Button
                onClick={handleOpenCreate}
                size="sm"
                className="bg-blue-600 font-semibold text-white hover:bg-blue-700 shadow-lg"
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Add Movie / Series
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-4 py-5 md:px-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />

              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 border-neutral-800 bg-neutral-900 text-white placeholder:text-neutral-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="border-neutral-700 text-neutral-300"
              >
                Total Results: {totalCount}
              </Badge>

              <Badge
                variant="outline"
                className="border-neutral-700 text-blue-400"
              >
                Movies:{" "}
                {
                  moviesList.filter(
                    (m) => m.type === "movie" || m.type === "short-film",
                  ).length
                }
              </Badge>

              <Badge
                variant="outline"
                className="border-neutral-700 text-purple-400"
              >
                Series: {moviesList.filter((m) => m.type === "series").length}
              </Badge>
            </div>
          </div>

          {loading ? (
            <div className="flex h-48 items-center justify-center text-neutral-400">
              <Loader2 className="mr-2 h-6 w-6 animate-spin text-blue-500" />
              Loading MongoDB Catalog via API...
            </div>
          ) : moviesList.length === 0 ? (
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-8 text-center text-neutral-400">
              No media items found matching your query. Click "Add Movie /
              Series" to create one.
            </div>
          ) : (
            <div className="space-y-6">
              <CatalogGrid
                moviesList={moviesList}
                onEdit={handleOpenEdit}
                onViewJson={handleViewJson}
                onDelete={handleDelete}
              />

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
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading more...
                      </>
                    ) : (
                      <>
                        <ChevronDown className="mr-1.5 h-4 w-4" />
                        Load More via API
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <MediaEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        isEditing={isEditing}
        formData={formData}
        setFormData={setFormData}
        onSave={handleSave}
        saving={saving}
        feedback={feedback}
      />

      <FeaturedManagerModal
        isOpen={isFeaturedManagerOpen}
        onClose={() => setIsFeaturedManagerOpen(false)}
        onUpdated={() => loadCatalog(1, searchQuery, false)}
      />

      <CategoryOrderManagerModal
        isOpen={isCategoryOrderOpen}
        onClose={() => setIsCategoryOrderOpen(false)}
        onUpdated={() => loadCatalog(1, searchQuery, false)}
      />

      <JsonViewerModal
        data={jsonViewerData}
        onClose={() => setJsonViewerData(null)}
      />
    </div>
  );
}