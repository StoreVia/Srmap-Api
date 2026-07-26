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
  const [viewMode, setViewMode] = useState<"old" | "new">();

  const currentDay = ALL_DAYS[new Date().getDay()];
  const isWeekend = currentDay === "Saturday" || currentDay === "Sunday";

  const { ongoingClass, upcomingClass } = useCurrentClass(timetable, currentDay, subjectCodeToName, isWeekend);
  const { dialogOpen, setDialogOpen, selectedSubject, selectedSubjectAttendance, handleSubjectClick } = useSubjectDialog(subjectCodeToName, subjectCodeToAttendance);

  useEffect(() => {
    if (viewMode) updateSettings({ timeTableViewMode: viewMode });
  }, [viewMode]);

  useEffect(() => {
    setViewMode(settings.timeTableViewMode);
  }, [settings.timeTableViewMode]);

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
        <div className="flex items-center space-x-2 bg-muted p-1 rounded-lg">
          {(["old", "new"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                viewMode === mode ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {mode === "old" ? "Old View" : "Minimal View"}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 flex-shrink-0">
        {(ongoingClass || upcomingClass) ? (
          <>
            <Card className={`p-3 md:p-4 ${ongoingClass ? "border-green-200 bg-green-50/50 dark:bg-green-900/30" : "border-gray-200 dark:border-gray-700"}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 mb-2">
                  <Play className={`w-4 h-4 md:w-5 md:h-5 ${ongoingClass ? "text-green-600" : "text-gray-400"}`} />
                  <span className="text-sm md:text-base font-medium">Ongoing</span>
                </div>
                {ongoingClass && countdown !== null && (
                  <Badge variant="outline" className="text-xs bg-green-100 dark:bg-green-800">{formatCountdown(countdown)}</Badge>
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

            <Card className={`p-3 md:p-4 ${upcomingClass ? "border-blue-200 bg-blue-50/50 dark:bg-blue-900/30" : "border-gray-200 dark:border-gray-700"}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className={`w-4 h-4 md:w-5 md:h-5 ${upcomingClass ? "text-blue-600" : "text-gray-400"}`} />
                  <span className="text-sm md:text-base font-medium">Next</span>
                </div>
                {upcomingClass && upcomingCountdown !== null && (
                  <Badge variant="outline" className="text-xs bg-blue-100 dark:bg-blue-800">{formatCountdown(upcomingCountdown)}</Badge>
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
          <Card className="border-gray-200 dark:border-gray-700 col-span-1 md:col-span-2 p-4">
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

      <Card className="flex-1 flex flex-col min-h-0">
        <CardHeader className="flex-shrink-0 py-3">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Clock className="w-4 h-4 md:w-5 md:h-5" />
            Class Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 p-2 md:p-4">
          <div
            className="max-h-full overflow-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent"
            style={{ scrollbarWidth: "thin", scrollbarColor: "rgb(209 213 219) transparent" }}
          >
            <table className="w-full border-separate border-spacing-1 table-fixed">
              <thead className="sticky top-0 bg-background dark:bg-gray-900 z-[1]">
                <tr>
                  <th className="bg-muted dark:bg-gray-800 p-2 rounded-md text-left w-16 md:w-20 min-w-[64px] md:min-w-[80px] sticky left-0 z-[1]">
                    <div className="font-semibold text-xs">Day / Time</div>
                  </th>
                  {TIME_SLOTS.map((time) => (
                    <th key={time} className={`bg-muted dark:bg-gray-800 p-2 rounded-md text-left ${viewMode === "new" ? "w-20 md:w-24 min-w-[80px] md:min-w-[96px]" : "w-28 md:w-36 min-w-[112px] md:min-w-[140px]"}`}>
                      <div className="font-semibold text-xs">{time}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {WEEK_DAYS.map((day) => {
                  const dayData = timetable.find((t) => t.day === day);
                  return (
                    <tr key={day} className="hover:bg-muted/30 dark:hover:bg-muted/10 transition-colors align-top">
                      <td className="p-2 rounded-md font-semibold bg-muted text-xs sticky left-0 z-[1]">
                        {trimText(day, 3)}
                      </td>
                      {TIME_SLOTS.map((timeSlot, idx) => {
                        const subjStr = dayData?.subjects[idx] || "";
                        const { code, venue } = parseSubject(subjStr);
                        return (
                          <td key={`${day}-${idx}`} className="p-0">
                            <div
                              onClick={() => handleSubjectClick(code, venue, day, timeSlot)}
                              className={`${viewMode === "new" ? "min-h-[100px] md:min-h-[70px] flex flex-col justify-center items-center" : ""} h-full rounded-md cursor-pointer transition-colors p-1 md:p-2 ${
                                code
                                  ? "bg-blue-50/40 dark:bg-blue-900/30 hover:bg-blue-100/60 dark:hover:bg-blue-800/40"
                                  : "bg-gray-50/30 dark:bg-muted/10"
                              }`}
                            >
                              {code ? (
                                viewMode === "new" ? (
                                  <div className="space-y-1 text-center">
                                    <div className="font-bold text-xs md:text-sm text-muted-foreground dark:text-gray-300 leading-none">{code}</div>
                                    {venue && (
                                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground dark:text-gray-400 leading-none">
                                        <MapPin className="w-3 h-3 shrink-0" /><span>{venue}</span>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="space-y-0.5 text-xs">
                                    <div title={subjectCodeToName[code]} className="text-muted-foreground dark:text-gray-300 truncate leading-tight">{code}</div>
                                    <Badge variant="secondary" className="w-full justify-left text-[10px] font-semibold truncate">
                                      {subjectCodeToName[code]}
                                    </Badge>
                                    {venue && (
                                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground dark:text-gray-400 truncate">
                                        <MapPin className="w-3 h-3 shrink-0" /><span>{venue}</span>
                                      </div>
                                    )}
                                  </div>
                                )
                              ) : (
                                <div className="text-center">
                                  <Badge variant="outline" className="text-xs text-muted-foreground dark:text-gray-500">Free</Badge>
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