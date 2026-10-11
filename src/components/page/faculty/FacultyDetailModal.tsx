"use client";
import React, { useState, useEffect } from "react";
import API from "@/lib/api/axiosClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogWindowClose } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FacultyItem, FacultyTimetableRecord, FacultyTimetableSlotEntry } from "@/types/faculty";
import { FacultyTimetableGrid } from "@/components/page/timetable/FacultyTimetableGrid";
import { GraduationCap, Briefcase, BookOpen, Award, FileText, Lightbulb, FolderGit2, Users, Star, ExternalLink, MapPin, ChevronDown, Maximize2, Calendar, Loader2 } from "lucide-react";

interface FacultyDetailModalProps {
  faculty: FacultyItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRateClick: (faculty: FacultyItem) => void;
}

export function FacultyDetailModal({
  faculty,
  open,
  onOpenChange,
  onRateClick
}: FacultyDetailModalProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [timetableRecord, setTimetableRecord] = useState<FacultyTimetableRecord | null>(null);
  const [timetableLoading, setTimetableLoading] = useState(false);
  const [timetableLoaded, setTimetableLoaded] = useState(false);
  const [loadedDetails, setLoadedDetails] = useState<Record<string, any>>({});
  const [loadingSections, setLoadingSections] = useState<Record<string, boolean>>({});
  const [periodModalData, setPeriodModalData] = useState<{ entry: FacultyTimetableSlotEntry; day: string; timeSlot: string } | null>(null);
  const [periodModalOpen, setPeriodModalOpen] = useState(false);

  useEffect(() => {
    setTimetableRecord(null);
    setTimetableLoaded(false);
    setTimetableLoading(false);
    setLoadedDetails(faculty?.details || {});
    setLoadingSections({});
  }, [faculty?.slug]);

  if (!faculty) return null;

  const sectionFieldMap: Record<string, string> = {
    education: "education",
    experience: "experience",
    research: "researchInterests",
    patents: "patents",
    publications: "publications",
    projects: "projects",
    scholars: "doctoralScholars"
  };

  const toggleSection = async (key: string) => {
    const nextState = !openSections[key];
    setOpenSections(prev => ({ ...prev, [key]: nextState }));

    if (key === "timetable") {
      if (nextState && !timetableLoaded && !timetableLoading && faculty?.slug) {
        setTimetableLoading(true);
        try {
          const res = await API.get(`/faculty/timetables?slug=${encodeURIComponent(faculty.slug)}`);
          if (res.data?.success && res.data.data) {
            setTimetableRecord(res.data.data);
          }
        } catch {}
        finally {
          setTimetableLoading(false);
          setTimetableLoaded(true);
        }
      }
      return;
    }

    const field = sectionFieldMap[key];
    if (field && nextState && loadedDetails[field] === undefined && (faculty?.slug || faculty?._id)) {
      setLoadingSections(prev => ({ ...prev, [key]: true }));
      try {
        const id = faculty.slug || faculty._id;
        const res = await API.get(`/faculty/${encodeURIComponent(id!)}?field=${field}`);
        if (res.data?.success && res.data.data) {
          setLoadedDetails(prev => ({ ...prev, [field]: res.data.data.value || [] }));
        }
      } catch {
        setLoadedDetails(prev => ({ ...prev, [field]: [] }));
      } finally {
        setLoadingSections(prev => ({ ...prev, [key]: false }));
      }
    }
  };

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
  const details = { ...(faculty.details || {}), ...loadedDetails };

  const sections = [
    {
      key: "timetable",
      title: "Timetable",
      icon: Calendar,
      content: (
        <div className="pt-2 space-y-2">
          {timetableLoading ? (
            <div className="flex items-center justify-center p-6 text-xs text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Loading timetable...
            </div>
          ) : timetableRecord && timetableRecord.schedule && Object.keys(timetableRecord.schedule).length > 0 ? (
            <FacultyTimetableGrid
              schedule={timetableRecord.schedule}
              onPeriodClick={(entry, day, timeSlot) => {
                setPeriodModalData({ entry, day, timeSlot });
                setPeriodModalOpen(true);
              }}
            />
          ) : (
            <p className="text-xs text-muted-foreground py-3 text-center">
              No teaching timetable found for this semester.
            </p>
          )}
        </div>
      )
    },
    {
      key: "education",
      title: "Education",
      icon: GraduationCap,
      content: loadingSections.education ? (
        <div className="flex items-center justify-center p-4 text-xs text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          Loading education...
        </div>
      ) : details.education && details.education.length > 0 ? (
        <div className="space-y-2.5 pl-2 border-l-2 border-border mt-2">
          {details.education.map((edu: any, idx: number) => (
            <div key={idx} className="relative pl-4 space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{edu.degree}</span>
                {edu.year && <Badge variant="secondary" className="text-[11px] font-mono">{edu.year}</Badge>}
              </div>
              {edu.details && edu.details.length > 0 && (
                <p className="text-xs text-muted-foreground">{edu.details.join(" • ")}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground py-2.5 text-center">No education recorded.</p>
      )
    },
    {
      key: "experience",
      title: "Experience",
      icon: Briefcase,
      content: loadingSections.experience ? (
        <div className="flex items-center justify-center p-4 text-xs text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          Loading experience...
        </div>
      ) : details.experience && details.experience.length > 0 ? (
        <ul className="space-y-2 list-disc list-inside text-xs text-muted-foreground mt-2">
          {details.experience.map((item: string, idx: number) => (
            <li key={idx} className="leading-relaxed">{item}</li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground py-2.5 text-center">No experience recorded.</p>
      )
    },
    {
      key: "research",
      title: "Research Interests",
      icon: BookOpen,
      content: loadingSections.research ? (
        <div className="flex items-center justify-center p-4 text-xs text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          Loading research interests...
        </div>
      ) : details.researchInterests && details.researchInterests.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {details.researchInterests.map((item: string, idx: number) => (
            <Badge key={idx} variant="outline" className="text-xs py-1">
              {item}
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground py-2.5 text-center">No research interests recorded.</p>
      )
    },
    {
      key: "patents",
      title: "Patents",
      icon: Lightbulb,
      content: loadingSections.patents ? (
        <div className="flex items-center justify-center p-4 text-xs text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          Loading patents...
        </div>
      ) : details.patents && details.patents.length > 0 ? (
        <ul className="space-y-2 list-disc list-inside text-xs text-muted-foreground mt-2">
          {details.patents.map((item: string, idx: number) => (
            <li key={idx} className="leading-relaxed">{item}</li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground py-2.5 text-center">No patents recorded.</p>
      )
    },
    {
      key: "publications",
      title: "Publications",
      icon: FileText,
      content: loadingSections.publications ? (
        <div className="flex items-center justify-center p-4 text-xs text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          Loading publications...
        </div>
      ) : details.publications && details.publications.length > 0 ? (
        <ul className="space-y-2.5 list-disc list-inside text-xs text-muted-foreground mt-2">
          {details.publications.map((item: string, idx: number) => (
            <li key={idx} className="leading-relaxed">{item}</li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground py-2.5 text-center">No publications recorded.</p>
      )
    },
    {
      key: "projects",
      title: "Projects",
      icon: FolderGit2,
      content: loadingSections.projects ? (
        <div className="flex items-center justify-center p-4 text-xs text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          Loading projects...
        </div>
      ) : details.projects && details.projects.length > 0 ? (
        <ul className="space-y-2 list-disc list-inside text-xs text-muted-foreground mt-2">
          {details.projects.map((item: string, idx: number) => (
            <li key={idx} className="leading-relaxed">{item}</li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground py-2.5 text-center">No projects recorded.</p>
      )
    },
    {
      key: "scholars",
      title: "Doctoral Scholars",
      icon: Users,
      content: loadingSections.scholars ? (
        <div className="flex items-center justify-center p-4 text-xs text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          Loading doctoral scholars...
        </div>
      ) : details.doctoralScholars && details.doctoralScholars.length > 0 ? (
        <ul className="space-y-1.5 list-disc list-inside text-xs text-muted-foreground mt-2">
          {details.doctoralScholars.map((item: string, idx: number) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground py-2.5 text-center">No doctoral scholars recorded.</p>
      )
    }
  ];


  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="p-4 sm:p-6 border-b bg-muted/20">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 min-w-0">
                <div
                  onClick={() => setImageModalOpen(true)}
                  className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-muted border-2 border-primary/20 flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-primary/40 transition-all group/avatar"
                  title="Click to view full photo"
                >
                  <img
                    src={displayImage}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity">
                    <Maximize2 className="w-5 h-5 text-white" />
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <DialogTitle className="text-xl sm:text-2xl font-bold truncate">
                    {displayName}
                  </DialogTitle>
                  <p className="text-sm text-primary font-medium mt-0.5">{faculty.designation}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {faculty.departments.map((dept, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {dept}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <DialogWindowClose />
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-3 text-xs text-muted-foreground border-t mt-4">
              {faculty.email && (
                <a href={`mailto:${faculty.email}`} className="flex items-center gap-1.5 hover:text-foreground">
                  <img decoding="async" src="https://www.srmap.edu.in/wp-content/uploads/2025/05/mail_icon.svg" className="w-3.5 h-3.5" alt="mail" />
                  <span>{faculty.email}</span>
                </a>
              )}
              {faculty.officeLocation && (
                <div className="flex items-center gap-1.5 text-foreground">
                  <MapPin className="w-3.5 h-3.5 text-red-500" />
                  <span>Cabin: {faculty.officeLocation}</span>
                </div>
              )}
              {faculty.profileUrl && (
                <a
                  href={faculty.profileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-primary hover:underline ml-auto"
                >
                  <span>Official Profile</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {faculty.ratingSummary && (
              <div className="rounded-lg border p-2.5 bg-muted/20 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-foreground">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>Ratings ({faculty.ratingSummary.overallAvg}/5)</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    {faculty.ratingSummary.totalRatings} {faculty.ratingSummary.totalRatings === 1 ? "review" : "reviews"}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-1.5 text-center">
                  <div className="p-1.5 rounded border bg-background/80">
                    <div className="text-[10px] text-muted-foreground">Teaching</div>
                    <div className="font-bold text-xs text-primary">{faculty.ratingSummary.teachingAvg}</div>
                  </div>
                  <div className="p-1.5 rounded border bg-background/80">
                    <div className="text-[10px] text-muted-foreground">Exams</div>
                    <div className="font-bold text-xs text-primary">{faculty.ratingSummary.examsAvg}</div>
                  </div>
                  <div className="p-1.5 rounded border bg-background/80">
                    <div className="text-[10px] text-muted-foreground">Correction</div>
                    <div className="font-bold text-xs text-primary">{faculty.ratingSummary.correctionAvg}</div>
                  </div>
                  <div className="p-1.5 rounded border bg-background/80">
                    <div className="text-[10px] text-muted-foreground">Marks</div>
                    <div className="font-bold text-xs text-primary">{faculty.ratingSummary.marksAvg}</div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {sections.map(({ key, title, icon: Icon, content }) => {
                const isOpen = !!openSections[key];
                return (
                  <div key={key} className="rounded-lg border bg-card transition-colors">
                    <button
                      type="button"
                      onClick={() => toggleSection(key)}
                      className="w-full p-3.5 flex items-center justify-between gap-3 text-left hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 font-semibold text-sm">
                        <Icon className="w-4 h-4 text-primary" />
                        <span>{title}</span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {isOpen && (
                      <div className="p-3.5 pt-0 border-t border-border/40">
                        {content}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-4 border-t bg-muted/20 flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button size="sm" onClick={() => { onOpenChange(false); onRateClick(faculty); }}>
              <Star className="w-4 h-4 mr-1.5 fill-amber-500 text-amber-500" />
              Rate This Faculty
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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

      <Dialog open={periodModalOpen} onOpenChange={setPeriodModalOpen}>
        <DialogContent className="p-0 max-w-md overflow-hidden">
          <DialogHeader className="p-4 border-b bg-slate-50/80 dark:bg-muted/20">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <DialogTitle className="text-base font-semibold leading-snug">
                  {periodModalData?.entry.name || periodModalData?.entry.code}
                </DialogTitle>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground pt-1">
                  <Badge variant="secondary" className="font-mono text-xs">
                    {periodModalData?.entry.code}
                  </Badge>
                  <span>•</span>
                  <span>{periodModalData?.day}</span>
                  <span>•</span>
                  <span>{periodModalData?.timeSlot}</span>
                </div>
              </div>
              <DialogWindowClose />
            </div>
          </DialogHeader>

          <div className="p-4 space-y-3.5 text-xs">
            {periodModalData?.entry.venue && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <span className="text-muted-foreground">Classroom / Venue:</span>
                <span className="font-semibold text-foreground text-sm">{periodModalData.entry.venue}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-primary shrink-0" />
              <span className="text-muted-foreground">Instructor:</span>
              <span className="font-semibold text-foreground">{displayName}</span>
              {faculty?.officeLocation && (
                <span className="text-muted-foreground">({faculty.officeLocation})</span>
              )}
            </div>

            {periodModalData?.entry.section && (
              <div className="space-y-1.5 pt-1">
                <span className="text-muted-foreground font-medium block">Assigned Sections:</span>
                <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-2 bg-slate-50 rounded-md border dark:bg-muted/30">
                  {periodModalData.entry.section.split(",").map((sec, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs bg-white dark:bg-card">
                      Section {sec.trim()}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {(periodModalData?.entry.program || periodModalData?.entry.semester) && (
              <div className="space-y-1 pt-2 border-t text-muted-foreground">
                {periodModalData.entry.program && <div><span className="font-medium text-foreground">Program:</span> {periodModalData.entry.program}</div>}
                {periodModalData.entry.semester && <div><span className="font-medium text-foreground">Semester:</span> {periodModalData.entry.semester}</div>}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>

  );
}
