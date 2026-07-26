"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useStudentData } from "@/context/StudentContext";
import { useScrollIndicator } from "@/hooks/utils/useScrollIndicator";
import { useLocalStorageContext } from "@/context/LocalStorageContext";
import type { AttendanceShape } from "@/hooks/timetable/useSubjectMaps";
import AttendanceCard from "@/components/page/attendance/AttendanceCard";
import { mapManyToAttendanceShape } from "@/shared/utils/attendance";
import { History, ArrowUpDown, ArrowUp, ArrowDown, Check } from "lucide-react";
import { AttendanceHistoryDialog } from "@/components/page/attendance/AttendanceHistoryDialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type SortOption = "default" | "ascending" | "descending";

const SORT_OPTIONS: { value: SortOption; label: string; icon: React.ReactNode }[] = [
  { value: "default",    label: "Default",    icon: <ArrowUpDown size={13} /> },
  { value: "ascending",  label: "Ascending",  icon: <ArrowUp size={13} /> },
  { value: "descending", label: "Descending", icon: <ArrowDown size={13} /> },
];

const sortSubjects = (subjects: AttendanceShape[], sort: SortOption): AttendanceShape[] => {
  if (sort === "ascending")  return [...subjects].sort((a, b) => a.percentage - b.percentage);
  if (sort === "descending") return [...subjects].sort((a, b) => b.percentage - a.percentage);
  return subjects;
};

const AttendanceDetails = () => {
  const { attendance } = useStudentData();
  const { settings, updateSettings } = useLocalStorageContext();
  const { ScrollIndicator } = useScrollIndicator();

  const [rawSubjects, setRawSubjects] = useState<AttendanceShape[]>([]);

  const currentSort = (settings.sort as SortOption) || "default";
  const displayedSubjects = sortSubjects(rawSubjects, currentSort);

  const loadCurrentData = () => setRawSubjects(mapManyToAttendanceShape(attendance));

  useEffect(() => { 
    loadCurrentData(); 
  }, [attendance]);

  const activeSortOption = SORT_OPTIONS.find(o => o.value === currentSort)!;

  return (
    <div className="relative">
      <div className="flex mb-6">
        <div className="flex w-full sm:w-auto sm:ml-auto gap-2 items-center">
          <Button
            variant={rawSubjects === mapManyToAttendanceShape(attendance) ? "default" : "outline"}
            size="sm"
            onClick={loadCurrentData}
            className="w-1/2 sm:w-auto dark:bg-white dark:text-black"
          >
            Current
          </Button>

          <AttendanceHistoryDialog
            trigger={
              <Button variant="outline" size="sm" className="w-1/2 sm:w-auto gap-2">
                <History className="h-4 w-4" />
                History
              </Button>
            }
            onLoadToPage={(data) => setRawSubjects(mapManyToAttendanceShape(data))}
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={currentSort !== "default" ? "default" : "outline"}
                size="sm"
                className="gap-1.5"
              >
                {activeSortOption.icon}
                {activeSortOption.label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {SORT_OPTIONS.map((opt, i) => (
                <>
                  {i > 0 && <DropdownMenuSeparator key={`sep-${i}`} />}
                  <DropdownMenuItem
                    key={opt.value}
                    onClick={() => updateSettings({ sort: opt.value })}
                    className="flex items-center justify-between gap-8 cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      {opt.icon}
                      {opt.label}
                    </span>
                    {currentSort === opt.value && <Check size={12} />}
                  </DropdownMenuItem>
                </>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {displayedSubjects.length > 0 ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {displayedSubjects.map(subject => (
            <AttendanceCard key={subject.subject_code} subject={subject} />
          ))}
        </div>
      ) : (
        <div className="text-center p-8 border rounded-lg">
          <p className="text-muted-foreground">No Subjects Found.</p>
        </div>
      )}

      <ScrollIndicator />
    </div>
  );
};

export default AttendanceDetails;