"use client";
import React from "react";
import { TIME_SLOTS, WEEK_DAYS } from "@/shared/utils/timetable";
import { trimText } from "@/shared/utils/functions";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import { FacultyTimetableSlotEntry } from "@/types/faculty";

interface FacultyTimetableGridProps {
  schedule?: Record<string, Record<string, FacultyTimetableSlotEntry[]>>;
  onPeriodClick?: (entry: FacultyTimetableSlotEntry, day: string, timeSlot: string) => void;
}

export function FacultyTimetableGrid({ schedule = {}, onPeriodClick }: FacultyTimetableGridProps) {
  return (
    <div className="overflow-x-auto rounded-md bg-slate-100 p-1 scrollbar-thin scrollbar-thumb-slate-400 scrollbar-track-transparent dark:bg-transparent dark:p-0 dark:pr-1 dark:scrollbar-thumb-gray-600">
      <table className="w-full border-separate border-spacing-1 table-fixed min-w-[700px]">
        <thead className="sticky top-0 z-[2] bg-background dark:bg-gray-900">
          <tr>
            <th className="sticky left-0 z-[3] w-16 min-w-[64px] rounded-md bg-slate-800 p-2 text-left text-white md:w-20 md:min-w-[80px] dark:bg-gray-800 dark:text-foreground">
              <div className="font-semibold text-xs">Day / Time</div>
            </th>
            {TIME_SLOTS.map((time) => (
              <th key={time} className="rounded-md bg-slate-800 p-2 text-left text-white dark:bg-gray-800 dark:text-foreground w-28 md:w-36 min-w-[112px] md:min-w-[140px]">
                <div className="font-semibold text-xs">{time}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {WEEK_DAYS.map((day) => {
            const daySlots = schedule?.[day] || {};
            return (
              <tr key={day} className="align-middle transition-colors hover:bg-muted/30 dark:hover:bg-muted/10">
                <td className="sticky left-0 z-[1] rounded-md bg-slate-200 p-2 text-xs font-bold text-slate-800 dark:bg-muted dark:font-semibold dark:text-foreground">
                  {trimText(day, 3)}
                </td>
                {TIME_SLOTS.map((timeSlot, slotIdx) => {
                  const rawEntries = daySlots[slotIdx.toString()] || [];

                  const groupedMap = new Map<string, FacultyTimetableSlotEntry>();
                  for (const ent of rawEntries) {
                    const key = `${ent.code}-${ent.venue || ""}`;
                    if (groupedMap.has(key)) {
                      const existing = groupedMap.get(key)!;
                      if (ent.section && !existing.section.split(",").map(s => s.trim()).includes(ent.section)) {
                        existing.section = existing.section ? `${existing.section}, ${ent.section}` : ent.section;
                      }
                    } else {
                      groupedMap.set(key, { ...ent });
                    }
                  }
                  const entries = Array.from(groupedMap.values());
                  const hasClass = entries.length > 0;

                  return (
                    <td key={`${day}-${slotIdx}`} className="p-0 h-px">
                      {hasClass ? (
                        <div className="flex flex-row gap-1 h-full w-full">
                          {entries.map((ent, eIdx) => (
                            <div
                              key={eIdx}
                              onClick={() => onPeriodClick?.(ent, day, timeSlot)}
                              className="flex-1 min-w-0 h-full cursor-pointer rounded-md transition-colors p-1 md:p-1.5 border border-blue-200 bg-white shadow-xs hover:border-blue-400 hover:bg-blue-50 dark:border-0 dark:bg-blue-900/30 dark:shadow-none dark:hover:bg-blue-800/40 flex flex-col justify-between"
                            >
                              <div className="space-y-0.5 text-xs">
                                <div title={ent.code} className="truncate font-bold leading-tight text-slate-800 dark:text-gray-300">
                                  {ent.code}
                                </div>
                                {entries.length === 1 && (
                                  <Badge
                                    variant="secondary"
                                    title={ent.name}
                                    className="w-full justify-start truncate border border-blue-200 bg-blue-100 px-1 text-[10px] font-semibold text-blue-950 dark:border-0 dark:bg-secondary dark:px-1.5 dark:text-secondary-foreground"
                                  >
                                    {ent.name}
                                  </Badge>
                                )}
                                <div className="flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-400 pt-0.5">
                                  {ent.venue && (
                                    <div className="flex items-center gap-0.5 truncate text-[10px]">
                                      <MapPin className="w-3 h-3 shrink-0" />
                                      <span className="truncate">{ent.venue}</span>
                                    </div>
                                  )}
                                  {ent.section && (
                                    <span className="font-mono text-[9px] text-muted-foreground ml-auto truncate" title={`Section ${ent.section}`}>
                                      {ent.section.includes(",") ? `${ent.section.split(",")[0].trim()}+` : ent.section}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="h-full rounded-md transition-colors p-1 md:p-2 border border-slate-200 bg-slate-50/80 dark:border-0 dark:bg-muted/10 flex flex-col items-center justify-center min-h-[64px]">
                          <div className="text-center">
                            <Badge variant="outline" className="border-slate-300 bg-white text-xs font-medium text-slate-500 dark:border-input dark:bg-transparent dark:text-gray-500">Free</Badge>
                          </div>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}