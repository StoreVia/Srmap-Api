"use client";
import { useState, useEffect, useRef } from "react";
import { History, ArrowUpDown, ArrowUp, ArrowDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStudentData } from "@/context/StudentContext";
import { useLocalStorageContext } from "@/context/LocalStorageContext";
import { useScrollIndicator } from "@/hooks/useScrollIndicator";
import AttendanceCard from "@/components/page/attendance/AttendanceCard";
import { AttendanceHistoryDialog } from "@/components/page/attendance/AttendanceHistoryDialog";

interface SubjectData {
    subject_code: string;
    subject_name: string;
    attended: number;
    conducted: number;
    od_ml_taken: number;
    od_ml_percentage: number;
    present_percentage: number;
    percentage: number;
    absent: number;
}

type SortOption = "default" | "ascending" | "descending";

const SORT_OPTIONS: { value: SortOption; label: string; icon: React.ReactNode }[] = [
    { value: "default", label: "Default", icon: <ArrowUpDown size={13} /> },
    { value: "ascending", label: "Ascending", icon: <ArrowUp size={13} /> },
    { value: "descending", label: "Descending", icon: <ArrowDown size={13} /> },
];

const sortSubjects = (subjects: SubjectData[], sort: SortOption): SubjectData[] => {
    if (sort === "ascending") return [...subjects].sort((a, b) => a.percentage - b.percentage);
    if (sort === "descending") return [...subjects].sort((a, b) => b.percentage - a.percentage);
    return subjects;
};

const AttendanceDetails = () => {
    const { attendance } = useStudentData();
    const { settings, updateSettings } = useLocalStorageContext();
    const { ScrollIndicator } = useScrollIndicator();

    const [viewMode, setViewMode] = useState<"current" | "history">("current");
    const [rawSubjects, setRawSubjects] = useState<SubjectData[]>([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentSort = (settings.sort as SortOption) || "default";
    const displayedSubjects = sortSubjects(rawSubjects, currentSort);

    const mapSubjects = (data: any[]): SubjectData[] =>
        data.map(subject => ({
            subject_code: subject.subject_code || "",
            subject_name: subject.subject_name || "",
            attended: Number(subject.present) || 0,
            conducted: Number(subject.classes_conducted) || 0,
            od_ml_taken: Number(subject.od_ml_taken) || 0,
            od_ml_percentage: Number(subject.od_ml_percentage) || 0,
            present_percentage: Number(subject.present_percentage) || 0,
            percentage: Number(subject.attendance_percentage) || 0,
            absent: Number(subject.absent) || 0,
        }));

    const loadCurrentData = () => {
        setRawSubjects(mapSubjects(attendance));
        setViewMode("current");
    };

    useEffect(() => { loadCurrentData(); }, [attendance]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLoadHistoryData = (historyData: any[]) => {
        setRawSubjects(mapSubjects(historyData));
        setViewMode("current");
    };

    const handleSortSelect = (value: SortOption) => {
        updateSettings({ sort: value });
        setDropdownOpen(false);
    };

    const activeSortOption = SORT_OPTIONS.find(o => o.value === currentSort)!;

    return (
        <div className="relative">
            <style>{`
                .sort-dropdown-wrapper {
                    position: relative;
                }
                .sort-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 0 12px;
                    height: 32px;
                    border-radius: 6px;
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    border: 1px solid;
                    transition: background 0.15s, border-color 0.15s, color 0.15s;
                    white-space: nowrap;
                    background: transparent;
                    border-color: hsl(var(--border));
                    color: hsl(var(--foreground));
                }
                .sort-btn:hover {
                    background: hsl(var(--accent));
                    border-color: hsl(var(--accent-foreground) / 0.2);
                }
                .sort-btn.active {
                    background: hsl(var(--primary));
                    border-color: hsl(var(--primary));
                    color: hsl(var(--primary-foreground));
                }
                .sort-menu {
                    position: absolute;
                    right: 0;
                    top: calc(100% + 6px);
                    min-width: 140px;
                    border-radius: 8px;
                    overflow: hidden;
                    border: 1px solid hsl(var(--border));
                    background: hsl(var(--popover));
                    box-shadow: 0 8px 24px hsl(0 0% 0% / 0.12);
                    z-index: 50;
                    animation: sort-menu-in 0.12s ease;
                }
                @media (prefers-color-scheme: dark) {
                    .sort-menu {
                        box-shadow: 0 8px 24px hsl(0 0% 0% / 0.4);
                    }
                }
                @keyframes sort-menu-in {
                    from { opacity: 0; transform: translateY(-4px) scale(0.97); }
                    to   { opacity: 1; transform: translateY(0)   scale(1); }
                }
                .sort-menu-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 8px;
                    padding: 8px 12px;
                    font-size: 13px;
                    font-weight: 450;
                    cursor: pointer;
                    color: hsl(var(--popover-foreground));
                    transition: background 0.1s;
                    border: none;
                    background: transparent;
                    width: 100%;
                    text-align: left;
                }
                .sort-menu-item:hover {
                    background: hsl(var(--accent));
                }
                .sort-menu-item.selected {
                    color: hsl(var(--primary));
                    font-weight: 600;
                }
                .sort-menu-item-left {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .sort-menu-divider {
                    height: 1px;
                    background: hsl(var(--border));
                    margin: 2px 0;
                }
            `}</style>

            <div className="flex mb-6">
                <div className="flex w-full sm:w-auto sm:ml-auto gap-2 items-center">
                    <Button
                        variant={viewMode === "current" ? "default" : "outline"}
                        size="sm"
                        onClick={loadCurrentData}
                        className="w-1/2 sm:w-auto"
                    >
                        Current
                    </Button>

                    <AttendanceHistoryDialog
                        trigger={
                            <Button
                                variant={viewMode === "history" ? "default" : "outline"}
                                size="sm"
                                className="w-1/2 sm:w-auto gap-2"
                            >
                                <History className="h-4 w-4" />
                                History
                            </Button>
                        }
                        onLoadToPage={handleLoadHistoryData}
                    />

                    {/* Sort Dropdown */}
                    <div className="sort-dropdown-wrapper" ref={dropdownRef}>
                        <button
                            className={`sort-btn${currentSort !== "default" ? " active" : ""}`}
                            onClick={() => setDropdownOpen(o => !o)}
                            aria-label="Sort attendance"
                        >
                            {activeSortOption.icon}
                            {activeSortOption.label}
                        </button>

                        {dropdownOpen && (
                            <div className="sort-menu" role="menu">
                                {SORT_OPTIONS.map((opt, i) => (
                                    <>
                                        {i > 0 && <div className="sort-menu-divider" key={`div-${i}`} />}
                                        <button
                                            key={opt.value}
                                            role="menuitem"
                                            className={`sort-menu-item${currentSort === opt.value ? " selected" : ""}`}
                                            onClick={() => handleSortSelect(opt.value)}
                                        >
                                            <span className="sort-menu-item-left">
                                                {opt.icon}
                                                {opt.label}
                                            </span>
                                            {currentSort === opt.value && <Check size={12} />}
                                        </button>
                                    </>
                                ))}
                            </div>
                        )}
                    </div>
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