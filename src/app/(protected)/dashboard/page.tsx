"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useStudentData } from "@/context/StudentContext";
import { toTitleCase, whatsapp } from "@/shared/utils/functions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SubjectDialog } from "@/components/page/timetable/SubjectDialog";
import { useSubjectMaps } from "@/hooks/timetable/useSubjectMaps";
import { useCurrentClass } from "@/hooks/timetable/useCurrentClass";
import { useSubjectDialog } from "@/hooks/timetable/useSubjectDialog";
import { TIME_SLOTS, ALL_DAYS, parseSubject } from "@/shared/utils/timetable";
import { MapPin, ChevronDown, ChevronUp, AlertTriangle, CheckCircle2, Clock } from "lucide-react";

const Dashboard = () => {
  const { profile, attendance, timetable, subjects } = useStudentData();
  const router = useRouter();
  const [warningsOpen, setWarningsOpen] = useState(false);

  const { subjectCodeToName, subjectCodeToAttendance } = useSubjectMaps(subjects ?? [], attendance);

  const currentDay = ALL_DAYS[new Date().getDay()];
  const isWeekend = currentDay === "Saturday" || currentDay === "Sunday";

  const { ongoingClass, upcomingClass } = useCurrentClass(
    timetable,
    currentDay,
    subjectCodeToName,
    isWeekend
  );

  const { dialogOpen, setDialogOpen, selectedSubject, selectedSubjectAttendance, handleSubjectClick } =
    useSubjectDialog(subjectCodeToName, subjectCodeToAttendance);

  const lowAttendanceSubjects = attendance.filter(
    (s) => parseFloat(s.attendance_percentage) < 75
  );

  const todayClasses = useMemo(() => {
    if (isWeekend) return [];
    const dayData = timetable.find((t) => t.day === currentDay);
    if (!dayData) return [];
    return dayData.subjects
      .map((subj: string, idx: number) => {
        const { code, venue } = parseSubject(subj);
        return code ? { code, venue, timeSlot: TIME_SLOTS[idx], slotIdx: idx } : null;
      })
      .filter(Boolean);
  }, [timetable, currentDay, isWeekend]);

  return (
    <div className="flex flex-col gap-2.5 pb-4">
      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">Welcome back</p>
          <h2 className="text-xl font-bold tracking-tight truncate">
            {toTitleCase(profile?.studentName || "Student")}
          </h2>
        </div>
        <button
          onClick={() => whatsapp()}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-green-500 hover:bg-green-600 active:bg-green-700 text-white text-xs font-medium transition-colors shadow-sm shrink-0 touch-manipulation"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.52 3.48A11.91 11.91 0 0012 0C5.37 0 0 5.37 0 12c0 2.11.55 4.17 1.6 5.98L0 24l6.21-1.62A11.92 11.92 0 0012 24c6.63 0 12-5.37 12-12 0-3.19-1.24-6.21-3.48-8.52zm-8.52 18c-1.8 0-3.55-.48-5.08-1.39l-.36-.21-3.69.96.99-3.6-.24-.37A9.96 9.96 0 012 12c0-5.52 4.48-10 10-10 2.67 0 5.18 1.04 7.07 2.93A9.96 9.96 0 0122 12c0 5.52-4.48 10-10 10zm5.44-7.54c-.3-.15-1.77-.87-2.05-.97-.28-.1-.48-.15-.68.15-.2.3-.78.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.68-1.65-.93-2.27-.24-.58-.49-.5-.68-.51h-.58c-.2 0-.52.07-.8.37-.28.3-1.05 1.02-1.05 2.47s1.08 2.86 1.23 3.05c.15.2 2.12 3.24 5.15 4.54.72.31 1.28.5 1.72.64.72.23 1.38.2 1.9.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35z" />
          </svg>
          Join
        </button>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <button
          onClick={() => setWarningsOpen((o) => !o)}
          className="w-full flex items-center justify-between px-3 py-2.5 bg-card hover:bg-muted/50 active:bg-muted/70 transition-colors text-left touch-manipulation"
        >
          <div className="flex items-center gap-2">
            {lowAttendanceSubjects.length > 0 ? (
              <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
            )}
            <span className="text-sm font-medium">Attendance Warnings</span>
            {lowAttendanceSubjects.length > 0 && (
              <Badge variant="destructive" className="text-xs h-5 px-1.5">
                {lowAttendanceSubjects.length}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {lowAttendanceSubjects.length === 0 && (
              <span className="text-xs text-green-600 dark:text-green-400 font-medium">All good!</span>
            )}
            {warningsOpen ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </button>
        {warningsOpen && (
          <div className="border-t">
            {lowAttendanceSubjects.length > 0 ? (
              <div className="divide-y max-h-48 overflow-y-auto">
                {lowAttendanceSubjects.map((subject) => {
                  const pct = parseFloat(subject.attendance_percentage);
                  return (
                    <div key={subject.subject_code} className="flex items-center justify-between px-3 py-2.5 bg-card gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium truncate leading-tight">{subject.subject_name}</div>
                        <div className="text-xs text-muted-foreground font-mono mt-0.5">{subject.subject_code}</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="w-14 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full bg-destructive" style={{ width: `${Math.min(pct, 100)}%` }} />
                        </div>
                        <span className="text-sm font-semibold text-destructive tabular-nums w-12 text-right">
                          {pct.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div className="px-3 py-2.5 bg-muted/30">
                  <Button size="sm" variant="outline" onClick={() => router.push("/attendance")} className="text-xs h-8 w-full touch-manipulation">
                    View Full Attendance
                  </Button>
                </div>
              </div>
            ) : (
              <div className="px-4 py-5 text-center bg-card">
                <p className="text-sm text-muted-foreground">All subjects above 75% — keep it up!</p>
                <Button size="sm" variant="outline" onClick={() => router.push("/attendance")} className="mt-3 text-xs h-8 touch-manipulation">
                  View Attendance
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <SubjectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        subject={selectedSubject}
        attendance={selectedSubjectAttendance}
      />

      <Card>
        <CardHeader className="pb-2 px-3 pt-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4 shrink-0" />
              {isWeekend ? "Weekend" : `Today — ${currentDay}`}
              {!isWeekend && todayClasses.length > 0 && (
                <span className="text-xs text-muted-foreground font-normal">({todayClasses.length} classes)</span>
              )}
            </CardTitle>
            <Button size="sm" variant="ghost" onClick={() => router.push("/timetable")} className="text-xs h-7 text-muted-foreground hover:text-foreground px-2 touch-manipulation">
              Full →
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0 px-3 pb-3">
          {isWeekend ? (
            <div className="text-center py-4"><p className="text-muted-foreground text-sm">Enjoy your weekend!</p></div>
          ) : todayClasses.length === 0 ? (
            <div className="text-center py-4"><p className="text-muted-foreground text-sm">No classes today.</p></div>
          ) : (
            <div className="space-y-1">
              {(todayClasses as any[]).map(({ code, venue, timeSlot, slotIdx }) => {
                const isOngoing = ongoingClass?.code === code && ongoingClass?.timeSlot === timeSlot;
                const isNext = upcomingClass?.code === code && upcomingClass?.timeSlot === timeSlot;
                return (
                  <div
                    key={slotIdx}
                    onClick={() => handleSubjectClick(code, venue, currentDay, timeSlot)}
                    className={`flex items-center gap-2 px-2.5 py-2 rounded-md transition-colors cursor-pointer ${
                      isOngoing
                        ? "bg-green-50 dark:bg-green-900/25 border border-green-200/60 dark:border-green-800/40"
                        : isNext
                        ? "bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200/40 dark:border-blue-800/30"
                        : "bg-muted/40 hover:bg-muted/70"
                    }`}
                  >
                    <div className="text-[10px] text-muted-foreground font-mono w-10 shrink-0 leading-tight">
                      {timeSlot.split("-")[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate leading-snug">{subjectCodeToName[code] || code}</div>
                      {venue && (
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                          <MapPin className="h-2.5 w-2.5 shrink-0" />
                          <span className="truncate">{venue}</span>
                        </div>
                      )}
                    </div>
                    {isOngoing && (
                      <Badge className="text-[10px] h-5 px-1.5 bg-green-600 text-white shrink-0">Now</Badge>
                    )}
                    {isNext && !isOngoing && (
                      <Badge variant="secondary" className="text-[10px] h-5 px-1.5 shrink-0">Next</Badge>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;