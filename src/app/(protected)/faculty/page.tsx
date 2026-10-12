"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import API from "@/lib/api/axiosClient";
import { useStudentData } from "@/context/StudentContext";
import { toast } from "@/hooks/utils/useToast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FacultyCard } from "@/components/page/faculty/FacultyCard";
import { StaffCard } from "@/components/page/faculty/StaffCard";
import { FacultyDetailModal } from "@/components/page/faculty/FacultyDetailModal";
import { FacultyRatingModal } from "@/components/page/faculty/FacultyRatingModal";
import { FacultyItem, StaffItem } from "@/types/faculty";
import { Search, Loader2, GraduationCap, Users, ArrowUpDown, ChevronDown } from "lucide-react";

function FacultyDirectoryContent() {
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") || "";
  const urlSlug = searchParams.get("slug") || "";
  const urlType = searchParams.get("type");

  const { subjects } = useStudentData();

  const [tab, setTab] = useState<"faculty" | "staff">(urlType === "staff" ? "staff" : "faculty");
  const [searchInput, setSearchInput] = useState(urlSearch || "");
  const [activeSearch, setActiveSearch] = useState(urlSearch || "");
  const [sortBy, setSortBy] = useState<"default" | "rating_high" | "rating_low">("default");

  const [items, setItems] = useState<Array<FacultyItem | StaffItem>>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [myFaculty, setMyFaculty] = useState<FacultyItem[]>([]);
  const [loadingMyFaculty, setLoadingMyFaculty] = useState(false);
  const [isMyFacultyOpen, setIsMyFacultyOpen] = useState(false);

  const [selectedFaculty, setSelectedFaculty] = useState<FacultyItem | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [ratingFaculty, setRatingFaculty] = useState<FacultyItem | null>(null);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);

  const observerRef = useRef<HTMLDivElement | null>(null);
  const initialModalCheckedRef = useRef(false);

  const rawFacultyNames = useMemo(() => {
    const names: string[] = [];
    const seen = new Set<string>();
    for (const sub of subjects || []) {
      if (!sub.faculty || sub.faculty === "null") continue;
      const parts = sub.faculty.split(",").map(p => p.trim()).filter(Boolean);
      for (const p of parts) {
        if (/skilling|trainer|tmp\d|ises\d/i.test(p)) continue;
        const clean = p.replace(/\s*\(\s*[^)]+\s*\)/g, "").trim();
        if (clean && !seen.has(clean.toLowerCase())) {
          seen.add(clean.toLowerCase());
          names.push(clean);
        }
      }
    }
    return names;
  }, [subjects]);

  useEffect(() => {
    if (rawFacultyNames.length === 0) return;
    let isMounted = true;
    setLoadingMyFaculty(true);

    API.post("/faculty", { facultyNames: rawFacultyNames })
      .then(res => {
        if (!isMounted) return;
        if (res.data?.success && Array.isArray(res.data.data)) {
          setMyFaculty(res.data.data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoadingMyFaculty(false);
      });

    return () => { isMounted = false; };
  }, [rawFacultyNames]);

  const displayedMyFaculty = useMemo(() => {
    let list = [...myFaculty];
    if (activeSearch) {
      const q = activeSearch.toLowerCase();
      list = list.filter(f =>
        f.name.toLowerCase().includes(q) ||
        f.departments?.some(d => d.toLowerCase().includes(q)) ||
        f.designation?.toLowerCase().includes(q)
      );
    }
    if (sortBy === "rating_high") {
      list.sort((a, b) => (b.ratingSummary?.overallAvg || 0) - (a.ratingSummary?.overallAvg || 0));
    } else if (sortBy === "rating_low") {
      list.sort((a, b) => {
        const aAvg = a.ratingSummary?.overallAvg ?? 999;
        const bAvg = b.ratingSummary?.overallAvg ?? 999;
        return aAvg - bAvg;
      });
    }
    return list;
  }, [myFaculty, activeSearch, sortBy]);

  const fetchItems = useCallback(async (targetPage = 1, isInitial = false, query = activeSearch, currentTab = tab, currentSort = sortBy) => {
    if (isInitial) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const params = new URLSearchParams();
      params.set("type", currentTab);
      params.set("page", String(targetPage));
      if (currentTab === "faculty") {
        params.set("sort", currentSort);
      }
      if (urlSlug && isInitial) {
        params.set("slug", urlSlug);
      } else if (query) {
        params.set("search", query);
      }

      const res = await API.get(`/faculty?${params.toString()}`);
      if (res.data?.success) {
        const fetched = res.data.data.items || [];
        const more = !!res.data.data.hasMore;

        if (isInitial || targetPage === 1) {
          setItems(fetched);
          setPage(1);
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
          setPage(targetPage);
        }
        setHasMore(more);
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
  }, [activeSearch, tab, sortBy, urlSlug, urlSearch]);

  useEffect(() => {
    fetchItems(1, true, activeSearch, tab, sortBy);
  }, [tab, activeSearch, sortBy, fetchItems]);

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
      if (entries[0].isIntersecting && hasMore && !loadingMore) {
        fetchItems(page + 1, false, activeSearch, tab, sortBy);
      }
    }, { threshold: 0.1, rootMargin: "200px" });

    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, page, activeSearch, tab, sortBy, fetchItems]);

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
    setMyFaculty(prev => prev.map(item => {
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

      <div className="flex flex-col sm:flex-row gap-2">
        <form onSubmit={handleManualSearch} className="flex flex-1 gap-2">
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

        {tab === "faculty" && (
          <div className="w-full sm:w-auto">
            <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
              <SelectTrigger className="w-full sm:w-[170px] text-xs h-10">
                <ArrowUpDown className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="rating_high">Highest Rated</SelectItem>
                <SelectItem value="rating_low">Lowest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {tab === "faculty" && displayedMyFaculty.length > 0 && (
        <div className="rounded-xl border border-border/70 bg-card/60 p-3.5 sm:p-4 shadow-sm transition-all">
          <button
            type="button"
            onClick={() => setIsMyFacultyOpen((prev) => !prev)}
            className="flex w-full items-center justify-between text-left group cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-base sm:text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                My Faculty
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              <span>{isMyFacultyOpen ? "Collapse" : "Expand"}</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isMyFacultyOpen ? "rotate-180" : ""}`} />
            </div>
          </button>

          {isMyFacultyOpen && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-4 border-t border-border/50 mt-3 animate-in fade-in-50 duration-200">
              {displayedMyFaculty.map((item) => (
                <FacultyCard
                  key={`my-${item._id || item.slug}`}
                  faculty={item}
                  onSelect={handleSelectFaculty}
                  onRate={handleRateFaculty}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "faculty" && displayedMyFaculty.length > 0 && isMyFacultyOpen && (
        <div className="flex items-center justify-between pt-1">
          <h2 className="text-base sm:text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span>All Faculty Directory</span>
          </h2>
        </div>
      )}

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