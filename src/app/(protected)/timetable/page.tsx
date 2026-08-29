"use client";
import { useEffect, useState } from "react";
import { useStudentData } from "@/context/StudentContext";
import { useLocalStorageContext } from "@/context/LocalStorageContext";
import { useSubjectMaps } from "@/hooks/timetable/useSubjectMaps";
import { useCurrentClass } from "@/hooks/timetable/useCurrentClass";
import { useSubjectDialog } from "@/hooks/timetable/useSubjectDialog";
import { SubjectDialog } from "@/components/page/timetable/SubjectDialog";
import { TIME_SLOTS, WEEK_DAYS, ALL_DAYS, parseSubject, formatCountdown } from "@/shared/utils/timetable";
import { trimText } from "@/shared/utils/functions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Clock, Calendar, Play } from "lucide-react";

const Timetable = () => {
  const { timetable, subjects, attendance } = useStudentData();
  const { settings, updateSettings } = useLocalStorageContext();
  const { subjectCodeToName, subjectCodeToAttendance } = useSubjectMaps(subjects, attendance);

  const [countdown, setCountdown] = useState<number | null>(null);
  const [upcomingCountdown, setUpcomingCountdown] = useState<number | null>(null);

  const viewMode = (settings.timeTableViewMode as "old" | "new") || "old";

  const currentDay = ALL_DAYS[new Date().getDay()];
  const isWeekend = currentDay === "Saturday" || currentDay === "Sunday";

  const { ongoingClass, upcomingClass } = useCurrentClass(timetable, currentDay, subjectCodeToName, isWeekend);
  const { dialogOpen, setDialogOpen, selectedSubject, selectedSubjectAttendance, handleSubjectClick } = useSubjectDialog(subjectCodeToName, subjectCodeToAttendance);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const minsNow = now.getHours() * 60 + now.getMinutes();
      setCountdown(ongoingClass ? (ongoingClass.endsAt - minsNow) * 60 - now.getSeconds() : null);
      setUpcomingCountdown(upcomingClass ? (upcomingClass.startsAt - minsNow) * 60 - now.getSeconds() : null);
    }, 1000);
    return () => clearInterval(interval);
  }, [ongoingClass, upcomingClass]);

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex justify-end">
        <div className="flex items-center space-x-1 rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-0 dark:bg-muted">
          {(["old", "new"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => updateSettings({ timeTableViewMode: mode })}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                viewMode === mode ? "bg-primary text-primary-foreground shadow-sm dark:bg-background dark:text-foreground" : "text-slate-600 hover:bg-white hover:text-slate-950 dark:text-muted-foreground dark:hover:bg-transparent dark:hover:text-foreground"
              }`}
            >
              {mode === "old" ? "Detailed View" : "Minimal View"}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 flex-shrink-0">
        {(ongoingClass || upcomingClass) ? (
          <>
            <Card className={`p-3 md:p-4 shadow-sm dark:shadow-none ${ongoingClass ? "border-emerald-300 bg-emerald-50 dark:border-border dark:bg-green-900/30" : "border-slate-200 bg-white dark:border-gray-700 dark:bg-card"}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 mb-2">
                  <Play className={`w-4 h-4 md:w-5 md:h-5 ${ongoingClass ? "text-emerald-600 dark:text-green-600" : "text-slate-400 dark:text-gray-400"}`} />
                  <span className="text-sm md:text-base font-medium">Ongoing</span>
                </div>
                {ongoingClass && countdown !== null && (
                  <Badge variant="outline" className="border border-emerald-300 bg-emerald-100 text-xs text-emerald-950 dark:border-input dark:bg-green-800 dark:text-foreground">{formatCountdown(countdown)}</Badge>
                )}
              </div>
              {ongoingClass ? (
                <div className="space-y-1">
                  <div className="font-semibold text-sm md:text-base line-clamp-1">{ongoingClass.name}</div>
                  <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm">
                    <Badge variant="secondary" className="font-mono text-xs">{ongoingClass.code}</Badge>
                    <span className="text-muted-foreground">{ongoingClass.timeSlot}</span>
                  </div>
                  {ongoingClass.venue && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" /><span>{ongoingClass.venue}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-1"><Badge variant="outline" className="text-xs">Free Period</Badge></div>
              )}
            </Card>

            <Card className={`p-3 md:p-4 shadow-sm dark:shadow-none ${upcomingClass ? "border-blue-300 bg-blue-50 dark:border-border dark:bg-blue-900/30" : "border-slate-200 bg-white dark:border-gray-700 dark:bg-card"}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className={`w-4 h-4 md:w-5 md:h-5 ${upcomingClass ? "text-blue-600" : "text-slate-400 dark:text-gray-400"}`} />
                  <span className="text-sm md:text-base font-medium">Next</span>
                </div>
                {upcomingClass && upcomingCountdown !== null && (
                  <Badge variant="outline" className="border border-blue-300 bg-blue-100 text-xs text-blue-950 dark:border-input dark:bg-blue-800 dark:text-foreground">{formatCountdown(upcomingCountdown)}</Badge>
                )}
              </div>
              {upcomingClass ? (
                <div className="space-y-1">
                  <div className="font-semibold text-sm md:text-base line-clamp-1">{upcomingClass.name}</div>
                  <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm">
                    <Badge variant="secondary" className="font-mono text-xs">{upcomingClass.code}</Badge>
                    <span className="text-muted-foreground">{upcomingClass.timeSlot}</span>
                  </div>
                  {upcomingClass.venue && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" /><span>{upcomingClass.venue}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-1"><Badge variant="outline" className="text-xs">Free Period</Badge></div>
              )}
            </Card>
          </>
        ) : (
          <Card className="col-span-1 border-slate-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-card dark:shadow-none md:col-span-2">
            <div className="text-center">
              <Calendar className="w-5 h-5 text-gray-400 mx-auto mb-2" />
              <div className="text-sm md:text-base text-muted-foreground">No Classes Further Today</div>
              <Badge variant="outline" className="mt-2 text-xs">You're Done For The Day!</Badge>
            </div>
          </Card>
        )}
      </div>

      <SubjectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        subject={selectedSubject}
        attendance={selectedSubjectAttendance}
      />

      <Card className="flex min-h-0 flex-1 flex-col overflow-hidden border-slate-200 bg-white shadow-sm dark:border-border dark:bg-card dark:shadow-none">
        <CardHeader className="flex-shrink-0 border-b border-slate-200 bg-slate-50 py-3 dark:border-0 dark:bg-transparent">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Clock className="w-4 h-4 md:w-5 md:h-5" />
            Class Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 p-2 md:p-4">
          <div className="max-h-full overflow-auto rounded-md bg-slate-100 p-1 scrollbar-thin scrollbar-thumb-slate-400 scrollbar-track-transparent dark:bg-transparent dark:p-0 dark:pr-1 dark:scrollbar-thumb-gray-600">
            <table className="w-full border-separate border-spacing-1 table-fixed">
              <thead className="sticky top-0 z-[2] bg-background dark:bg-gray-900">
                <tr>
                  <th className="sticky left-0 z-[3] w-16 min-w-[64px] rounded-md bg-slate-800 p-2 text-left text-white md:w-20 md:min-w-[80px] dark:bg-gray-800 dark:text-foreground">
                    <div className="font-semibold text-xs">Day / Time</div>
                  </th>
                  {TIME_SLOTS.map((time) => (
                    <th key={time} className={`rounded-md bg-slate-800 p-2 text-left text-white dark:bg-gray-800 dark:text-foreground ${viewMode === "new" ? "w-20 md:w-24 min-w-[80px] md:min-w-[96px]" : "w-28 md:w-36 min-w-[112px] md:min-w-[140px]"}`}>
                      <div className="font-semibold text-xs">{time}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {WEEK_DAYS.map((day) => {
                  const dayData = timetable.find((t) => t.day === day);
                  return (
                    <tr key={day} className="align-middle transition-colors hover:bg-muted/30 dark:hover:bg-muted/10">
                      <td className="sticky left-0 z-[1] rounded-md bg-slate-200 p-2 text-xs font-bold text-slate-800 dark:bg-muted dark:font-semibold dark:text-foreground">
                        {trimText(day, 3)}
                      </td>
                      {TIME_SLOTS.map((timeSlot, idx) => {
                        const subjStr = dayData?.subjects[idx] || "";
                        const { code, venue } = parseSubject(subjStr);
                        return (
                          <td key={`${day}-${idx}`} className="p-0 h-px">
                            <div
                              onClick={() => code && handleSubjectClick(code, venue, day, timeSlot)}
                              className={`h-full rounded-md transition-colors p-1 md:p-2 ${code ? "cursor-pointer" : "cursor-default"} ${
                                !code
                                  ? "flex flex-col items-center justify-center"
                                  : viewMode === "new"
                                  ? "min-h-[100px] md:min-h-[70px] flex flex-col justify-center items-center"
                                  : ""
                              } ${
                                code
                                  ? "border border-blue-200 bg-white shadow-sm hover:border-blue-400 hover:bg-blue-50 dark:border-0 dark:bg-blue-900/30 dark:shadow-none dark:hover:bg-blue-800/40"
                                  : "border border-slate-200 bg-slate-50/80 dark:border-0 dark:bg-muted/10"
                              }`}
                            >
                              {code ? (
                                viewMode === "new" ? (
                                  <div className="space-y-1 text-center">
                                    <div className="font-bold text-xs leading-none text-slate-900 dark:text-gray-300 md:text-sm">{code}</div>
                                    {venue && (
                                      <div className="flex items-center gap-1 text-[10px] leading-none text-slate-600 dark:text-slate-400">
                                        <MapPin className="w-3 h-3 shrink-0" /><span>{venue}</span>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="space-y-0.5 text-xs">
                                    <div title={subjectCodeToName[code]} className="truncate font-bold leading-tight text-slate-800 dark:text-gray-300">{code}</div>
                                    <Badge variant="secondary" className="w-full justify-start truncate border border-blue-200 bg-blue-100 px-1.5 text-[10px] font-semibold text-blue-950 dark:border-0 dark:bg-secondary dark:px-2 dark:text-secondary-foreground">
                                      {subjectCodeToName[code]}
                                    </Badge>
                                    {venue && (
                                      <div className="flex items-center gap-1 truncate text-[10px] text-slate-600 dark:text-slate-400">
                                        <MapPin className="w-3 h-3 shrink-0" /><span>{venue}</span>
                                      </div>
                                    )}
                                  </div>
                                )
                              ) : (
                                <div className="text-center">
                                  <Badge variant="outline" className="border-slate-300 bg-white text-xs font-medium text-slate-500 dark:border-input dark:bg-transparent dark:text-gray-500">Free</Badge>
                                </div>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Timetable;