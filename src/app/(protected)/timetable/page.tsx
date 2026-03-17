"use client";
import { Badge } from "@/components/ui/badge";
import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState, useMemo } from "react";
import { trimText } from "@/fullStackUtils/utils/functions";
import { useStudentData } from "@/context/StudentContext";
import { MapPin, Clock, Calendar, Play, BarChart3, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocalStorageContext } from "@/context/LocalStorageContext";
import AttendanceCard from "@/components/page/attendance/AttendanceCard";
import { Button } from "@/components/ui/button";

const Timetable = () => {
  const { timetable, subjects, attendance } = useStudentData();
  const { settings, updateSettings } = useLocalStorageContext();
  const [countdown, setCountdown] = useState<number | null>(null);
  const [upcomingCountdown, setUpcomingCountdown] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"old" | "new">();
  const [selectedSubject, setSelectedSubject] = useState<{ code: string, name: string, venue: string, day: string, timeSlot: string } | null>(null);
  const [selectedSubjectAttendance, setSelectedSubjectAttendance] = useState<any>(null);
  const [showAttendanceInDialog, setShowAttendanceInDialog] = useState(false);
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false);

  useEffect(() => {
    if(viewMode) updateSettings({ timeTableViewMode: viewMode });
  }, [viewMode]);

  useEffect(() => {
    setViewMode(settings.timeTableViewMode);
  }, [settings.timeTableViewMode]);

  const subjectCodeToName = useMemo(() => {
    const map: Record<string, string> = {};
    subjects.forEach((subj) => {
      map[subj.code] = subj.name;
    });
    return map;
  }, [subjects]);

  const subjectCodeToAttendance = useMemo(() => {
    const map: Record<string, any> = {};
    attendance.forEach((att) => {
      map[att.subject_code] = {
        subject_code: att.subject_code || "",
        subject_name: att.subject_name || "",
        attended: Number(att.present) || 0,
        conducted: Number(att.classes_conducted) || 0,
        od_ml_taken: Number(att.od_ml_taken) || 0,
        od_ml_percentage: Number(att.od_ml_percentage) || 0,
        present_percentage: Number(att.present_percentage) || 0,
        percentage: Number(att.attendance_percentage) || 0,
        absent: Number(att.absent) || 0
      };
    });
    return map;
  }, [attendance]);

  const timeSlots = [
    "9:00-9:50",
    "10:00-10:50",
    "11:00-11:50",
    "12:00-12:50",
    "1:00-1:50",
    "2:00-2:50",
    "3:00-3:50",
    "4:00-5:30",
  ];

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  const parseSubject = (subj: string) => {
    if (!subj) return { code: "", venue: "" };
    const match = subj.match(/^([A-Z]{2,4} \d{3}[A-Z]?)(?:\((.+)\))?$/);
    if (match) {
      return { code: match[1], venue: match[2] || "" };
    }
    return { code: subj, venue: "" };
  };

  const parseTime = (time: string) => {
    let [h, m] = time.split(":").map(Number);
    if (h < 8) h += 12;
    return h * 60 + m;
  };

  const getCurrentClassInfo = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const currentDay = days[dayOfWeek === 0 ? 6 : dayOfWeek - 1];
    const minutesNow = now.getHours() * 60 + now.getMinutes();
    const timeSlotMinutes = timeSlots.map((slot) => {
      const [start, end] = slot.split("-");
      return { start: parseTime(start), end: parseTime(end) };
    });

    const dayData = timetable.find((t) => t.day === currentDay);
    let ongoingClass = null;
    let upcomingClass = null;

    if (dayData) {
      for (let i = 0; i < timeSlots.length; i++) {
        const { start, end } = timeSlotMinutes[i];
        const subjStr = dayData.subjects[i];
        const { code, venue } = parseSubject(subjStr);
        if (code && minutesNow >= start && minutesNow < end) {
          ongoingClass = {
            code,
            name: subjectCodeToName[code],
            venue,
            timeSlot: timeSlots[i],
            day: currentDay,
            endsAt: end,
          };
          break;
        }
      }

      for (let i = 0; i < timeSlots.length; i++) {
        const { start } = timeSlotMinutes[i];
        const subjStr = dayData.subjects[i];
        const { code, venue } = parseSubject(subjStr);
        if (code && start > minutesNow) {
          upcomingClass = {
            code,
            name: subjectCodeToName[code],
            venue,
            timeSlot: timeSlots[i],
            day: currentDay,
            startsAt: start,
          };
          break;
        }
      }
    }
    return { ongoingClass, upcomingClass };
  };

  const { ongoingClass, upcomingClass } = getCurrentClassInfo();

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const minsNow = now.getHours() * 60 + now.getMinutes();
      if (ongoingClass) {
        setCountdown((ongoingClass.endsAt - minsNow) * 60 - now.getSeconds());
      } else {
        setCountdown(null);
      }
      if (upcomingClass) {
        setUpcomingCountdown((upcomingClass.startsAt - minsNow) * 60 - now.getSeconds());
      } else {
        setUpcomingCountdown(null);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [ongoingClass, upcomingClass]);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return [h > 0 ? `${h}h` : null, m > 0 ? `${m}m` : null, `${s}s`].filter(Boolean).join(" ");
  };

  const handleSubjectClick = (code: string, venue: string, day: string, timeSlot: string) => {
    if (code) {
      const subjectData = {
        code,
        name: subjectCodeToName[code],
        venue,
        day,
        timeSlot
      };
      setSelectedSubject(subjectData);
      
      if (subjectCodeToAttendance[code]) {
        setSelectedSubjectAttendance(subjectCodeToAttendance[code]);
      } else {
        setSelectedSubjectAttendance(null);
      }
      
      if (viewMode === "old" && subjectCodeToAttendance[code]) {
        setAttendanceDialogOpen(true);
      }
    } else {
      setSelectedSubject({
        code: "N/A",
        name: "Free Period",
        venue: "No Venue",
        day,
        timeSlot
      });
      setSelectedSubjectAttendance(null);
    }
    setShowAttendanceInDialog(false);
  };

  const handleShowAttendance = () => {
    setShowAttendanceInDialog(true);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex justify-end">
        <div className="flex items-center space-x-2 bg-muted p-1 rounded-lg">
          <button
            onClick={() => setViewMode("old")}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${viewMode === "old"
              ? "bg-background shadow-sm"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            Old View
          </button>
          <button
            onClick={() => setViewMode("new")}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${viewMode === "new"
              ? "bg-background shadow-sm"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            Minimal View
          </button>
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
                  <Badge variant="outline" className="text-xs bg-green-100 dark:bg-green-800">
                    {formatTime(countdown)}
                  </Badge>
                )}
              </div>
              <div className="space-y-1">
                {ongoingClass ? (
                  <>
                    <div className="font-semibold text-sm md:text-base line-clamp-1">{ongoingClass.name}</div>
                    <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm">
                      <Badge variant="secondary" className="font-mono text-xs">{ongoingClass.code}</Badge>
                      <span className="text-muted-foreground">{ongoingClass.timeSlot}</span>
                    </div>
                    {ongoingClass.venue && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span>{ongoingClass.venue}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-1">
                    <Badge variant="outline" className="text-xs">Free Period</Badge>
                  </div>
                )}
              </div>
            </Card>

            <Card className={`p-3 md:p-4 ${upcomingClass ? "border-blue-200 bg-blue-50/50 dark:bg-blue-900/30" : "border-gray-200 dark:border-gray-700"}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className={`w-4 h-4 md:w-5 md:h-5 ${upcomingClass ? "text-blue-600" : "text-gray-400"}`} />
                  <span className="text-sm md:text-base font-medium">Next</span>
                </div>
                {upcomingClass && upcomingCountdown !== null && (
                  <Badge variant="outline" className="text-xs bg-blue-100 dark:bg-blue-800">
                    {formatTime(upcomingCountdown)}
                  </Badge>
                )}
              </div>
              <div className="space-y-1">
                {upcomingClass ? (
                  <>
                    <div className="font-semibold text-sm md:text-base line-clamp-1">{upcomingClass.name}</div>
                    <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm">
                      <Badge variant="secondary" className="font-mono text-xs">{upcomingClass.code}</Badge>
                      <span className="text-muted-foreground">{upcomingClass.timeSlot}</span>
                    </div>
                    {upcomingClass.venue && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span>{upcomingClass.venue}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-1">
                    <Badge variant="outline" className="text-xs">Free Period</Badge>
                  </div>
                )}
              </div>
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

      {/* Minimal Attendance Dialog for old view */}
      <Dialog.Root open={attendanceDialogOpen} onOpenChange={setAttendanceDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-background rounded-lg shadow-lg w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col border">
              <div className="flex items-center justify-between p-3 border-b">
                <div className="flex-1 min-w-0">
                  <Dialog.Title className="text-base font-semibold truncate">
                    {selectedSubject?.name}
                  </Dialog.Title>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <Badge variant="secondary" className="font-mono text-xs">
                      {selectedSubject?.code}
                    </Badge>
                    <span>•</span>
                    <span>{selectedSubject?.day}</span>
                    <span>•</span>
                    <span>{selectedSubject?.timeSlot}</span>
                    {selectedSubject?.venue && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{selectedSubject.venue}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <Dialog.Close asChild>
                  <button className="p-1 hover:bg-muted rounded ml-2">
                    <X className="w-4 h-4" />
                  </button>
                </Dialog.Close>
              </div>
              
              <div className="flex-1 overflow-y-auto p-3">
                {selectedSubjectAttendance && (
                  <AttendanceCard subject={selectedSubjectAttendance} />
                )}
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Card className="flex-1 flex flex-col min-h-0">
        <CardHeader className="flex-shrink-0 py-3">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Clock className="w-4 h-4 md:w-5 md:h-5" />
            Class Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 p-2 md:p-4">
          <div
            className="max-h-full overflow-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500"
            style={{ scrollbarWidth: "thin", scrollbarColor: "rgb(209 213 219) transparent" }}
          >
            <table className="w-full border-separate border-spacing-1 table-fixed">
              <thead className="sticky top-0 bg-background dark:bg-gray-900 z-[1]">
                <tr>
                  <th className="bg-muted dark:bg-gray-800 p-2 rounded-md text-left w-16 md:w-20 min-w-[64px] md:min-w-[80px] sticky left-0 z-[1]">
                    <div className="font-semibold text-xs">Day / Time</div>
                  </th>
                  {timeSlots.map((time) => (
                    <th key={time} className={`bg-muted dark:bg-gray-800 p-2 rounded-md text-left ${viewMode === "new" ? "w-20 md:w-24 min-w-[80px] md:min-w-[96px]" : "w-28 md:w-36 min-w-[112px] md:min-w-[140px]"}`}>
                      <div className="font-semibold text-xs">{time}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {days.map((day) => {
                  const dayData = timetable.find((t) => t.day === day);
                  return (
                    <tr key={day} className="hover:bg-muted/30 dark:hover:bg-muted/10 transition-colors align-top">
                      <td className="p-2 rounded-md font-semibold bg-muted text-xs sticky left-0 z-[1] whitespace-normal break-words max-w-[160px] md:max-w-[180px]">
                        {trimText(day, 3)}
                      </td>
                      {timeSlots.map((timeSlot, idx) => {
                        const subjStr = dayData?.subjects[idx] || "";
                        const { code, venue } = parseSubject(subjStr);

                        if (viewMode === "old") {
                          return (
                            <td 
                              key={`${day}-${idx}`} 
                              className={`p-2 rounded-md ${code ? "bg-blue-50/40 dark:bg-blue-900/30 cursor-pointer hover:bg-blue-100/60 dark:hover:bg-blue-800/40" : "bg-gray-50/30 dark:bg-muted/10"}`}
                              onClick={() => handleSubjectClick(code, venue, day, timeSlot)}
                            >
                              {code ? (
                                <div className="space-y-0.5 text-xs">
                                  <div title={subjectCodeToName[code]} className="text-muted-foreground dark:text-gray-300 truncate leading-tight">
                                    {code}
                                  </div>
                                  <Badge variant="secondary" className="w-full justify-left text-[10px] font-semibold truncate">
                                    {subjectCodeToName[code]}
                                  </Badge>
                                  {venue && (
                                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground dark:text-gray-400 truncate">
                                      <MapPin className="w-3 h-3 shrink-0" />
                                      <span>{venue}</span>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="text-center">
                                  <Badge variant="outline" className="text-xs text-muted-foreground dark:text-gray-500">
                                    Free
                                  </Badge>
                                </div>
                              )}
                            </td>
                          );
                        } else {
                          return (
                            <td key={`${day}-${idx}`} className="p-0">
                              <Dialog.Root>
                                <Dialog.Trigger asChild>
                                  <div
                                    className={`h-full min-h-[60px] md:min-h-[70px] rounded-md cursor-pointer transition-colors flex flex-col justify-center items-center p-1 md:p-2 ${code
                                      ? "bg-blue-50/40 dark:bg-blue-900/30 hover:bg-blue-100/60 dark:hover:bg-blue-800/40"
                                      : "bg-gray-50/30 dark:bg-muted/10"
                                      }`}
                                    onClick={() => handleSubjectClick(code, venue, day, timeSlot)}
                                  >
                                    {code ? (
                                      <div className="space-y-1 text-center">
                                        <div className="font-bold text-xs md:text-sm text-muted-foreground dark:text-gray-300 leading-none">
                                          {code}
                                        </div>
                                        {venue && (
                                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground dark:text-gray-400 leading-none">
                                            <MapPin className="w-3 h-3 shrink-0" />
                                            <span>{venue}</span>
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="text-center">
                                        <Badge variant="outline" className="text-xs text-muted-foreground dark:text-gray-500">
                                          Free
                                        </Badge>
                                      </div>
                                    )}
                                  </div>
                                </Dialog.Trigger>

                                <Dialog.Portal>
                                  <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
                                  <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4">
                                    <div className="bg-background rounded-lg shadow-lg w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col border">
                                      <div className="flex items-center justify-between p-3 border-b">
                                        <div className="flex-1 min-w-0">
                                          <Dialog.Title className="text-base font-semibold truncate">
                                            {selectedSubject?.name}
                                          </Dialog.Title>
                                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                            <Badge variant="secondary" className="font-mono text-xs">
                                              {selectedSubject?.code}
                                            </Badge>
                                            <span>•</span>
                                            <span>{selectedSubject?.day}</span>
                                            <span>•</span>
                                            <span>{selectedSubject?.timeSlot}</span>
                                            {selectedSubject?.venue && (
                                              <>
                                                <span>•</span>
                                                <div className="flex items-center gap-1">
                                                  <MapPin className="w-3 h-3" />
                                                  <span>{selectedSubject.venue}</span>
                                                </div>
                                              </>
                                            )}
                                          </div>
                                        </div>
                                        <Dialog.Close asChild>
                                          <button className="p-1 hover:bg-muted rounded ml-2">
                                            <X className="w-4 h-4" />
                                          </button>
                                        </Dialog.Close>
                                      </div>
                                      
                                      <div className="flex-1 overflow-y-auto p-3">
                                        {/* Show attendance card if user clicked "Show Attendance" */}
                                        {showAttendanceInDialog && selectedSubjectAttendance && (
                                          <AttendanceCard subject={selectedSubjectAttendance} />
                                        )}
                                      </div>
                                      
                                      <div className="p-3 border-t">
                                        <div className="flex gap-2">
                                          {selectedSubjectAttendance && !showAttendanceInDialog && (
                                            <Button
                                              onClick={handleShowAttendance}
                                              className="flex-1 text-sm h-9"
                                              size="sm"
                                            >
                                              <BarChart3 className="w-4 h-4 mr-2" />
                                              Attendance
                                            </Button>
                                          )}
                                          <Dialog.Close asChild>
                                            <Button 
                                              variant="outline" 
                                              className="text-sm h-9"
                                              size="sm"
                                            >
                                              Close
                                            </Button>
                                          </Dialog.Close>
                                        </div>
                                      </div>
                                    </div>
                                  </Dialog.Content>
                                </Dialog.Portal>
                              </Dialog.Root>
                            </td>
                          );
                        }
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