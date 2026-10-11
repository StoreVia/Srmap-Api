"use client";
import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import API from "@/lib/api/axiosClient";
import { ALL_DAYS } from "@/shared/utils/timetable";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogWindowClose } from "@/components/ui/dialog";
import { MapPin, Mail, GraduationCap, Clock, Search, ExternalLink, AlertCircle, Maximize2 } from "lucide-react";
import { FacultyTimetableRecord, FacultyTimetableSlotEntry, FacultyItem } from "@/types/faculty";
import { FacultyTimetableGrid } from "@/components/page/timetable/FacultyTimetableGrid";
import { FacultyDetailModal } from "@/components/page/faculty/FacultyDetailModal";
import { FacultyRatingModal } from "@/components/page/faculty/FacultyRatingModal";

interface FacultyOption {
  rawName: string;
  displayName: string;
  courseCode: string;
  courseName: string;
  slug?: string;
  record?: FacultyTimetableRecord;
}

interface PeriodDetailModalData {
  entry: FacultyTimetableSlotEntry;
  day: string;
  timeSlot: string;
}

interface FacultyTimetableSectionProps {
  subjects: Array<{
    code: string;
    name: string;
    faculty?: string;
    classrooms?: string;
    facultyCabins?: Array<{ name: string; location: string }>;
  }>;
}

export function FacultyTimetableSection({ subjects }: FacultyTimetableSectionProps) {
  const [assignedTimetables, setAssignedTimetables] = useState<FacultyTimetableRecord[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>("");
  const [selectedRecord, setSelectedRecord] = useState<FacultyTimetableRecord | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<FacultyTimetableRecord[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const [activeModalPeriod, setActiveModalPeriod] = useState<PeriodDetailModalData | null>(null);
  const [periodModalOpen, setPeriodModalOpen] = useState<boolean>(false);

  const [imageModalOpen, setImageModalOpen] = useState<boolean>(false);
  const [detailModalOpen, setDetailModalOpen] = useState<boolean>(false);
  const [facultyDetailItem, setFacultyDetailItem] = useState<FacultyItem | null>(null);
  const [ratingModalOpen, setRatingModalOpen] = useState<boolean>(false);

  const rawAssignedList = useMemo(() => {
    const list: FacultyOption[] = [];
    const seen = new Set<string>();

    for (const sub of subjects || []) {
      if (!sub.faculty || sub.faculty === "null") continue;
      const parts = sub.faculty.split(",").map(p => p.trim()).filter(Boolean);
      for (const p of parts) {
        if (/skilling|trainer|tmp\d|ises\d/i.test(p)) continue;
        const clean = p.replace(/\s*\(\s*[^)]+\s*\)/g, "").trim();
        const key = `${clean.toLowerCase()}-${sub.code}`;
        if (!seen.has(key)) {
          seen.add(key);
          list.push({
            rawName: p,
            displayName: clean,
            courseCode: sub.code,
            courseName: sub.name
          });
        }
      }
    }
    return list;
  }, [subjects]);

  useEffect(() => {
    if (rawAssignedList.length === 0) return;
    let isMounted = true;
    setIsLoading(true);

    const facultyNames = rawAssignedList.map(item => item.rawName);

    API.post("/faculty/timetables", { facultyNames })
      .then(res => {
        if (!isMounted) return;
        if (res.data?.success && Array.isArray(res.data.data)) {
          setAssignedTimetables(res.data.data);
          if (res.data.data.length > 0 && !selectedSlug) {
            setSelectedSlug(res.data.data[0].facultySlug);
            setSelectedRecord(res.data.data[0]);
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [rawAssignedList]);

  useEffect(() => {
    if (!selectedSlug) return;
    const foundInAssigned = assignedTimetables.find(t => t.facultySlug === selectedSlug);
    if (foundInAssigned) {
      setSelectedRecord(foundInAssigned);
      return;
    }
    const foundInSearch = searchResults.find(t => t.facultySlug === selectedSlug);
    if (foundInSearch) {
      setSelectedRecord(foundInSearch);
      return;
    }
    API.get(`/faculty/timetables?slug=${encodeURIComponent(selectedSlug)}`)
      .then(res => {
        if (res.data?.success && res.data.data) {
          setSelectedRecord(res.data.data);
        }
      })
      .catch(() => {});
  }, [selectedSlug, assignedTimetables, searchResults]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await API.get(`/faculty/timetables?query=${encodeURIComponent(searchQuery.trim())}`);
      if (res.data?.success && Array.isArray(res.data.data)) {
        setSearchResults(res.data.data);
        if (res.data.data.length > 0) {
          setSelectedSlug(res.data.data[0].facultySlug);
          setSelectedRecord(res.data.data[0]);
        }
      }
    } catch {}
    finally {
      setIsSearching(false);
    }
  };

  const handleCardClick = (entry: FacultyTimetableSlotEntry, day: string, timeSlot: string) => {
    setActiveModalPeriod({ entry, day, timeSlot });
    setPeriodModalOpen(true);
  };

  const openFacultyDetails = async () => {
    if (!selectedRecord) return;
    if (facultyDetailItem && facultyDetailItem.slug === selectedRecord.facultySlug) {
      setDetailModalOpen(true);
      return;
    }

    try {
      const res = await API.get(`/faculty?slug=${encodeURIComponent(selectedRecord.facultySlug)}`);
      if (res.data?.success && res.data.data?.items?.[0]) {
        setFacultyDetailItem(res.data.data.items[0]);
        setDetailModalOpen(true);
        return;
      }
    } catch {}

    const fallback: FacultyItem = {
      name: selectedRecord.facultyName,
      slug: selectedRecord.facultySlug,
      designation: selectedRecord.designation || "Faculty",
      departments: selectedRecord.departments || [],
      degree: "",
      email: selectedRecord.email || "",
      imageUrl: selectedRecord.imageUrl || "https://www.srmap.edu.in/wp-content/uploads/2025/03/Faculty-Fallback_1.png",
      profileUrl: "",
      officeLocation: selectedRecord.cabin
    };
    setFacultyDetailItem(fallback);
    setDetailModalOpen(true);
  };

  const currentStatus = useMemo(() => {
    if (!selectedRecord) return null;
    const now = new Date();
    const day = ALL_DAYS[now.getDay()];
    const mins = now.getHours() * 60 + now.getMinutes();

    if (day === "Saturday" || day === "Sunday" || mins < 9 * 60 || mins > 17 * 60 + 30) {
      return null;
    }

    const slotWindows = [
      { idx: 0, start: 9 * 60, end: 9 * 60 + 50, label: "9:00 - 9:50" },
      { idx: 1, start: 10 * 60, end: 10 * 60 + 50, label: "10:00 - 10:50" },
      { idx: 2, start: 11 * 60, end: 11 * 60 + 50, label: "11:00 - 11:50" },
      { idx: 3, start: 12 * 60, end: 12 * 60 + 50, label: "12:00 - 12:50" },
      { idx: 4, start: 13 * 60, end: 13 * 60 + 50, label: "1:00 - 1:50" },
      { idx: 5, start: 14 * 60, end: 14 * 60 + 50, label: "2:00 - 2:50" },
      { idx: 6, start: 15 * 60, end: 15 * 60 + 50, label: "3:00 - 3:50" },
      { idx: 7, start: 16 * 60, end: 17 * 60 + 30, label: "4:00 - 5:30" }
    ];

    const currentSlot = slotWindows.find(w => mins >= w.start && mins <= w.end);
    if (!currentSlot) {
      return { status: "break", text: "Passing Period / Break" };
    }

    const daySchedule = selectedRecord.schedule?.[day];
    const slotEntries = daySchedule?.[currentSlot.idx.toString()];

    if (slotEntries && slotEntries.length > 0) {
      const first = slotEntries[0];
      return {
        status: "teaching",
        text: `Teaching ${first.code} in ${first.venue || "Classroom"}`
      };
    }

    return {
      status: "free",
      text: selectedRecord.cabin ? `Available in ${selectedRecord.cabin}` : "Free Period (Available)"
    };
  }, [selectedRecord]);

  const displayImage = selectedRecord?.imageUrl || "https://www.srmap.edu.in/wp-content/uploads/2025/03/Faculty-Fallback_1.png";

  return (
    <div className="w-full space-y-4 pt-2">
      <Card className="flex flex-col border-slate-200 bg-white shadow-sm dark:border-border dark:bg-card dark:shadow-none">
        <CardHeader className="flex-shrink-0 border-b border-slate-200 bg-slate-50 px-3 py-3 md:px-6 dark:border-0 dark:bg-transparent">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
            <div className="space-y-0.5">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <GraduationCap className="w-4 h-4 md:w-5 md:h-5 text-primary shrink-0" />
                <span>Faculty Timetable</span>
              </CardTitle>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <div className="w-full sm:w-[260px]">
                <Select
                  value={selectedSlug}
                  onValueChange={(val) => setSelectedSlug(val)}
                  disabled={isLoading}
                >
                  <SelectTrigger className="h-9 w-full text-xs">
                    <SelectValue placeholder={isLoading ? "Loading faculty..." : "Select Faculty Timetable"} />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    <SelectGroup>
                      <SelectLabel className="text-xs font-semibold text-muted-foreground">My Course Faculty</SelectLabel>
                      {assignedTimetables.map((item) => (
                        <SelectItem key={item.facultySlug} value={item.facultySlug} className="text-xs">
                          {item.facultyName} ({item.designation || "Faculty"})
                        </SelectItem>
                      ))}
                    </SelectGroup>
                    {searchResults.length > 0 && (
                      <SelectGroup>
                        <SelectLabel className="text-xs font-semibold text-muted-foreground">Search Results</SelectLabel>
                        {searchResults.map((item) => (
                          <SelectItem key={item.facultySlug} value={item.facultySlug} className="text-xs">
                            {item.facultyName} ({item.designation || "Faculty"})
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <form onSubmit={handleSearch} className="flex items-center gap-1 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-44">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search any faculty..."
                    className="h-9 w-full rounded-md border border-input bg-background px-2.5 py-1 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <Button type="submit" size="sm" variant="outline" className="h-9 px-2.5 shrink-0" disabled={isSearching}>
                  <Search className="w-3.5 h-3.5" />
                </Button>
              </form>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-3 md:p-4 space-y-3">
          {isLoading && !selectedRecord ? (
            <div className="space-y-3 py-4">
              <Skeleton className="h-14 w-full rounded-lg" />
              <Skeleton className="h-44 w-full rounded-lg" />
            </div>
          ) : selectedRecord ? (
            <>
              <div
                onClick={openFacultyDetails}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-slate-200 bg-white dark:border-border dark:bg-card cursor-pointer hover:border-primary/50 transition-colors group"
                title="Click to view complete faculty profile, ratings and details"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setImageModalOpen(true);
                    }}
                    className="relative h-12 w-12 sm:h-14 sm:w-14 rounded-full overflow-hidden bg-muted border border-border shrink-0 hover:ring-2 hover:ring-primary/50 transition-all group/avatar"
                    title="Click to view full photo"
                  >
                    <img
                      src={displayImage}
                      alt={selectedRecord.facultyName}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity">
                      <Maximize2 className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-sm leading-none text-foreground group-hover:text-primary transition-colors truncate">
                        {selectedRecord.facultyName}
                      </h3>
                      {currentStatus && (
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-2 py-0.5 border ${
                            currentStatus.status === "teaching"
                              ? "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300"
                              : "border-slate-200 bg-slate-100 text-slate-600 dark:border-border dark:bg-muted dark:text-muted-foreground"
                          }`}
                        >
                          <Clock className="w-3 h-3 mr-1 inline" />
                          {currentStatus.text}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-1">
                      {selectedRecord.designation}
                      {selectedRecord.departments && selectedRecord.departments.length > 0 && ` • ${selectedRecord.departments.join(", ")}`}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground pt-0.5">
                      {selectedRecord.cabin && (
                        <span className="flex items-center gap-1 text-foreground font-medium shrink-0">
                          <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                          {selectedRecord.cabin}
                        </span>
                      )}
                      {selectedRecord.email && (
                        <span className="flex items-center gap-1 min-w-0" onClick={(e) => e.stopPropagation()}>
                          <Mail className="w-3.5 h-3.5 shrink-0" />
                          <a href={`mailto:${selectedRecord.email}`} className="hover:underline break-all">
                            {selectedRecord.email}
                          </a>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center shrink-0" onClick={(e) => e.stopPropagation()}>
                  <Button variant="outline" size="sm" asChild className="h-8 text-xs gap-1">
                    <Link
                      href={`/faculty?search=${encodeURIComponent(selectedRecord.facultyName)}&slug=${encodeURIComponent(selectedRecord.facultySlug)}`}
                      target="_blank"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Directory
                    </Link>
                  </Button>
                </div>
              </div>

              <FacultyTimetableGrid
                schedule={selectedRecord.schedule}
                onPeriodClick={handleCardClick}
              />
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground space-y-2">
              <AlertCircle className="w-8 h-8 text-muted-foreground/60 mx-auto" />
              <p className="text-sm">No faculty timetable selected or found.</p>
              <p className="text-xs">Select one of your assigned course faculty above to preview their weekly teaching timetable.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={periodModalOpen} onOpenChange={setPeriodModalOpen}>
        <DialogContent className="p-0 max-w-md overflow-hidden">
          <DialogHeader className="p-4 border-b bg-slate-50/80 dark:bg-muted/20">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <DialogTitle className="text-base font-semibold leading-snug">
                  {activeModalPeriod?.entry.name || activeModalPeriod?.entry.code}
                </DialogTitle>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground pt-1">
                  <Badge variant="secondary" className="font-mono text-xs">
                    {activeModalPeriod?.entry.code}
                  </Badge>
                  <span>•</span>
                  <span>{activeModalPeriod?.day}</span>
                  <span>•</span>
                  <span>{activeModalPeriod?.timeSlot}</span>
                </div>
              </div>
              <DialogWindowClose />
            </div>
          </DialogHeader>

          <div className="p-4 space-y-3.5 text-xs">
            {activeModalPeriod?.entry.venue && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <span className="text-muted-foreground">Classroom / Venue:</span>
                <span className="font-semibold text-foreground text-sm">{activeModalPeriod.entry.venue}</span>
              </div>
            )}

            {selectedRecord && (
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-primary shrink-0" />
                <span className="text-muted-foreground">Instructor:</span>
                <span className="font-semibold text-foreground">{selectedRecord.facultyName}</span>
                {selectedRecord.cabin && (
                  <span className="text-muted-foreground">({selectedRecord.cabin})</span>
                )}
              </div>
            )}

            {activeModalPeriod?.entry.section && (
              <div className="space-y-1.5 pt-1">
                <span className="text-muted-foreground font-medium block">Assigned Sections:</span>
                <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-2 bg-slate-50 rounded-md border dark:bg-muted/30">
                  {activeModalPeriod.entry.section.split(",").map((sec, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs bg-white dark:bg-card">
                      Section {sec.trim()}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {(activeModalPeriod?.entry.program || activeModalPeriod?.entry.semester) && (
              <div className="space-y-1 pt-2 border-t text-muted-foreground">
                {activeModalPeriod.entry.program && <div><span className="font-medium text-foreground">Program:</span> {activeModalPeriod.entry.program}</div>}
                {activeModalPeriod.entry.semester && <div><span className="font-medium text-foreground">Semester:</span> {activeModalPeriod.entry.semester}</div>}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
        <DialogContent className="p-2 sm:p-4 max-w-sm sm:max-w-md bg-background/95 backdrop-blur-sm border-border flex flex-col items-center">
          <DialogTitle className="text-center font-semibold text-sm mb-2">
            {selectedRecord?.facultyName}
          </DialogTitle>
          <div className="relative w-full aspect-square max-h-[70vh] rounded-md overflow-hidden bg-muted flex items-center justify-center">
            <img
              src={displayImage}
              alt={selectedRecord?.facultyName}
              className="w-full h-full object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>

      <FacultyDetailModal
        faculty={facultyDetailItem}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        onRateClick={(fac) => {
          setDetailModalOpen(false);
          setRatingModalOpen(true);
        }}
      />

      <FacultyRatingModal
        faculty={facultyDetailItem}
        open={ratingModalOpen}
        onOpenChange={setRatingModalOpen}
        onRatingSuccess={() => {
          if (facultyDetailItem?.slug) {
            API.get(`/faculty?slug=${encodeURIComponent(facultyDetailItem.slug)}`)
              .then(res => {
                if (res.data?.success && res.data.data?.items?.[0]) {
                  setFacultyDetailItem(res.data.data.items[0]);
                }
              })
              .catch(() => {});
          }
        }}
      />
    </div>
  );
}