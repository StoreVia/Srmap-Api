import { useMemo } from "react";
import { TIME_SLOTS, parseSubject, parseTime } from "@/shared/utils/timetable";

type TimetableEntry = { day: string; subjects: string[] };

type ClassInfo = {
  code: string;
  name: string;
  venue: string;
  timeSlot: string;
  day: string;
  endsAt: number;
  startsAt: number;
} | null;

export const useCurrentClass = (
  timetable: TimetableEntry[],
  currentDay: string,
  subjectCodeToName: Record<string, string>,
  isWeekend: boolean
): { ongoingClass: ClassInfo; upcomingClass: ClassInfo } => {
  return useMemo(() => {
    if (isWeekend) return { ongoingClass: null, upcomingClass: null };

    const now = new Date();
    const minsNow = now.getHours() * 60 + now.getMinutes();
    const dayData = timetable.find((t) => t.day === currentDay);

    let ongoingClass: ClassInfo = null;
    let upcomingClass: ClassInfo = null;

    if (dayData) {
      for (let i = 0; i < TIME_SLOTS.length; i++) {
        const [startStr, endStr] = TIME_SLOTS[i].split("-");
        const start = parseTime(startStr);
        const end = parseTime(endStr);
        const { code, venue } = parseSubject(dayData.subjects[i]);

        if (!code) continue;

        if (minsNow >= start && minsNow < end && !ongoingClass) {
          ongoingClass = {
            code,
            name: subjectCodeToName[code],
            venue,
            timeSlot: TIME_SLOTS[i],
            day: currentDay,
            endsAt: end,
            startsAt: start,
          };
        }

        if (start > minsNow && !upcomingClass) {
          upcomingClass = {
            code,
            name: subjectCodeToName[code],
            venue,
            timeSlot: TIME_SLOTS[i],
            day: currentDay,
            endsAt: end,
            startsAt: start,
          };
        }
      }
    }

    return { ongoingClass, upcomingClass };
  }, [timetable, currentDay, subjectCodeToName, isWeekend]);
};