"use client";
import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import API from "@/lib/api/axiosClient";
import { toast } from "@/hooks/utils/useToast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FacultyCard } from "@/components/page/faculty/FacultyCard";
import { StaffCard } from "@/components/page/faculty/StaffCard";
import { FacultyDetailModal } from "@/components/page/faculty/FacultyDetailModal";
import { FacultyRatingModal } from "@/components/page/faculty/FacultyRatingModal";
import { FacultyItem, StaffItem } from "@/types/faculty";
import { Search, Loader2, GraduationCap, Users } from "lucide-react";

function FacultyDirectoryContent() {
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") || "";
  const urlSlug = searchParams.get("slug") || "";
  const urlType = searchParams.get("type");

  const [tab, setTab] = useState<"faculty" | "staff">(urlType === "staff" ? "staff" : "faculty");
  const [searchInput, setSearchInput] = useState(urlSearch || "");
  const [activeSearch, setActiveSearch] = useState(urlSearch || "");

  const [items, setItems] = useState<Array<FacultyItem | StaffItem>>([]);
  const [nextLastId, setNextLastId] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [selectedFaculty, setSelectedFaculty] = useState<FacultyItem | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [ratingFaculty, setRatingFaculty] = useState<FacultyItem | null>(null);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);

  const observerRef = useRef<HTMLDivElement | null>(null);
  const initialModalCheckedRef = useRef(false);

  const fetchItems = useCallback(async (isInitial = false, cursorId: string | null = null, query = activeSearch, currentTab = tab) => {
    if (isInitial) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const params = new URLSearchParams();
      params.set("type", currentTab);
      if (urlSlug && isInitial) {
        params.set("slug", urlSlug);
      } else if (query) {
        params.set("search", query);
      }
      if (cursorId && !isInitial) params.set("lastId", cursorId);

      const res = await API.get(`/faculty?${params.toString()}`);
      if (res.data?.success) {
        const fetched = res.data.data.items || [];
        const more = !!res.data.data.hasMore;
        const nextCursor = res.data.data.nextLastId || null;

        if (isInitial) {
          setItems(fetched);
          if (!initialModalCheckedRef.current) {
            initialModalCheckedRef.current = true;
            if (urlSlug) {
              const matched = fetched.find((f: any) => f.slug === urlSlug);
              if (matched) {
                setSelectedFaculty(matched as FacultyItem);
                setDetailModalOpen(true);
              }
            } else if (urlSearch && fetched.length > 0 && currentTab === "faculty") {
              const exact = fetched.find((f: any) => f.name?.toLowerCase().includes(urlSearch.toLowerCase()));
              if (exact) {
                setSelectedFaculty(exact as FacultyItem);
                setDetailModalOpen(true);
              }
            }
          }
        } else {
          setItems(prev => [...prev, ...fetched]);
        }
        setHasMore(more);
        setNextLastId(nextCursor);
      }
    } catch (err: any) {
      toast({
        title: "Failed to load directory",
        description: err.response?.data?.message || "Error fetching records",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [activeSearch, tab, urlSlug, urlSearch]);

  useEffect(() => {
    fetchItems(true, null, activeSearch, tab);
  }, [tab, activeSearch, fetchItems]);

  const handleManualSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchInput.trim();
    setActiveSearch(query);
    const newUrl = query ? `/faculty?search=${encodeURIComponent(query)}` : `/faculty`;
    window.history.replaceState(null, "", newUrl);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setActiveSearch("");
    window.history.replaceState(null, "", `/faculty`);
  };

  useEffect(() => {
    if (!observerRef.current || !hasMore || loading || loadingMore) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loadingMore && nextLastId) {
        fetchItems(false, nextLastId, activeSearch, tab);
      }
    }, { threshold: 0.1, rootMargin: "200px" });

    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, nextLastId, activeSearch, tab, fetchItems]);

  const handleSelectFaculty = (faculty: FacultyItem) => {
    setSelectedFaculty(faculty);
    setDetailModalOpen(true);
  };

  const handleRateFaculty = (faculty: FacultyItem) => {
    setRatingFaculty(faculty);
    setRatingModalOpen(true);
  };

  const handleRatingSuccess = (facultyId: string, summary: any) => {
    setItems(prev => prev.map(item => {
      if (item._id === facultyId) {
        return { ...item, ratingSummary: summary };
      }
      return item;
    }));
    if (selectedFaculty && selectedFaculty._id === facultyId) {
      setSelectedFaculty(prev => prev ? { ...prev, ratingSummary: summary } : null);
    }
  };

  return (
    <div className="w-full space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Faculty & Staff
          </h1>
        </div>

        <Tabs value={tab} onValueChange={(val: any) => { setTab(val); handleClearSearch(); }} className="w-full md:w-auto">
          <TabsList className="grid w-full md:w-64 grid-cols-2">
            <TabsTrigger value="faculty" className="text-xs sm:text-sm flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              Faculty
            </TabsTrigger>
            <TabsTrigger value="staff" className="text-xs sm:text-sm flex items-center gap-2">
              <Users className="w-4 h-4" />
              Staff
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <form onSubmit={handleManualSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={`Search ${tab === "faculty" ? "faculty by name, dept, designation..." : "staff members..."}`}
            className="pl-9 pr-4"
          />
        </div>
        <Button type="submit">Search</Button>
        {activeSearch && (
          <Button type="button" variant="outline" onClick={handleClearSearch}>
            Clear
          </Button>
        )}
      </form>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm">Loading {tab === "faculty" ? "faculty directory..." : "staff directory..."}</p>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 border rounded-lg bg-card/40">
          <p className="text-base font-medium text-foreground">No records found</p>
          <p className="text-xs text-muted-foreground mt-1">
            {activeSearch ? `No matches for "${activeSearch}". Try another query.` : "Directory is currently empty."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((item) => (
            tab === "faculty" ? (
              <FacultyCard
                key={item._id || item.name}
                faculty={item as FacultyItem}
                onSelect={handleSelectFaculty}
                onRate={handleRateFaculty}
              />
            ) : (
              <StaffCard
                key={item._id || item.name}
                staff={item as StaffItem}
              />
            )
          ))}
        </div>
      )}

      {loadingMore && (
        <div className="flex justify-center items-center py-6 gap-2 text-xs text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span>Loading more records...</span>
        </div>
      )}

      <div ref={observerRef} className="h-6 w-full" />

      <FacultyDetailModal
        faculty={selectedFaculty}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        onRateClick={handleRateFaculty}
      />

      <FacultyRatingModal
        faculty={ratingFaculty}
        open={ratingModalOpen}
        onOpenChange={setRatingModalOpen}
        onRatingSuccess={handleRatingSuccess}
      />
    </div>
  );
}

export default function FacultyDirectoryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />Loading directory...</div>}>
      <FacultyDirectoryContent />
    </Suspense>
  );
}