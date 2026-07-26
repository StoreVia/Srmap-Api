"use client";

import React, { useEffect, useMemo, useState } from "react";
import API from "@/lib/api/axiosClient";
import SessionCard from "@/components/utils/SessionCard";
import { useToast } from "@/hooks/utils/useToast";
import { Button } from "@/components/ui/button";
import { useSessionValidator } from "@/hooks/auth/useSessionValidator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Calendar, ChevronDown, RefreshCw } from "lucide-react";

interface SemesterItem {
  semester: number;
  label: string;
}

interface PastInternalRow {
  semester: string;
  code: string;
  description: string;
  subject_type: string;
  mark_obtained: string;
  max_mark: string;
}

interface PastInternalsPayload {
  last_fetched: string;
  semesters: SemesterItem[];
  rows: PastInternalRow[];
  selected_semester: number | null;
}

interface PastInternalsResponse {
  success: boolean;
  message: string;
  past_internals: PastInternalsPayload;
}

interface GroupedPastInternalRow {
  id: string;
  semester: string;
  code: string;
  description: string;
  total_mark_obtained: number;
  total_max_mark: number;
  components: PastInternalRow[];
}

const parseMarkValue = (value: string): number => {
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const PastInternalsPage: React.FC = () => {
  const { toast } = useToast();
  const { sessionValid, sessionId } = useSessionValidator();

  const [semesters, setSemesters] = useState<SemesterItem[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
  const [rows, setRows] = useState<PastInternalRow[]>([]);
  const [lastFetched, setLastFetched] = useState("");
  const [isLoadingSemesters, setIsLoadingSemesters] = useState(false);
  const [isLoadingRows, setIsLoadingRows] = useState(false);
  const [error, setError] = useState("");
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({});

  const groupedRows = useMemo<GroupedPastInternalRow[]>(() => {
    const groups = new Map<string, GroupedPastInternalRow>();

    rows.forEach((row) => {
      const key = `${row.semester}__${row.code}__${row.description}`;
      const existing = groups.get(key);

      if (!existing) {
        groups.set(key, {
          id: key,
          semester: row.semester,
          code: row.code,
          description: row.description,
          total_mark_obtained: parseMarkValue(row.mark_obtained),
          total_max_mark: parseMarkValue(row.max_mark),
          components: [row],
        });
        return;
      }

      existing.components.push(row);
      existing.total_mark_obtained += parseMarkValue(row.mark_obtained);
      existing.total_max_mark += parseMarkValue(row.max_mark);
    });

    return Array.from(groups.values());
  }, [rows]);

  const fetchSemesters = async () => {
    if (!sessionValid) return;
    setIsLoadingSemesters(true);
    setError("");

    try {
      const res = await API.post<PastInternalsResponse>("/srmapi/exams/past-internals", { sessionId });
      if (!res.data.success) {
        throw new Error(res.data.message || "Failed to fetch semesters");
      }

      const semesterList = res.data.past_internals.semesters || [];
      setSemesters(semesterList);
      setLastFetched(res.data.past_internals.last_fetched || "");

      if (semesterList.length === 0) {
        setSelectedSemester(null);
        setRows([]);
        return;
      }

      const nextSelected = selectedSemester && semesterList.some((item) => item.semester === selectedSemester)
        ? selectedSemester
        : semesterList[0].semester;

      setSelectedSemester(nextSelected);
      await fetchSemesterRows(nextSelected);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || "Failed to fetch past internals";
      setError(msg);
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setIsLoadingSemesters(false);
    }
  };

  const fetchSemesterRows = async (semester: number) => {
    if (!sessionValid) return;
    setIsLoadingRows(true);
    setError("");

    try {
      const res = await API.post<PastInternalsResponse>("/srmapi/exams/past-internals", { sessionId, semester });
      if (!res.data.success) {
        throw new Error(res.data.message || "Failed to fetch marks");
      }
      setRows(res.data.past_internals.rows || []);
      setLastFetched(res.data.past_internals.last_fetched || "");
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || "Failed to fetch semester marks";
      setError(msg);
      setRows([]);
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setIsLoadingRows(false);
    }
  };

  useEffect(() => {
    if (sessionValid) {
      fetchSemesters();
    }
  }, [sessionValid]);

  const handleSemesterSelect = async (semester: number) => {
    setSelectedSemester(semester);
    setExpandedSubjects({});
    await fetchSemesterRows(semester);
  };

  const toggleSubject = (subjectId: string) => {
    setExpandedSubjects((prev) => ({ ...prev, [subjectId]: !prev[subjectId] }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {lastFetched && <p className="text-sm text-muted-foreground">Last fetched: {lastFetched}</p>}
        {sessionValid && (
          <Button
            onClick={fetchSemesters}
            disabled={isLoadingSemesters || isLoadingRows}
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={isLoadingSemesters || isLoadingRows ? "h-4 w-4 animate-spin" : "h-4 w-4"}
            />
            Refetch
          </Button>
        )}
      </div>

      {!sessionValid && (
        <Card>
          <CardHeader>
            <CardTitle>Session Required</CardTitle>
            <CardDescription>Initiate a session to view past internals</CardDescription>
          </CardHeader>
          <CardContent>
            <SessionCard />
          </CardContent>
        </Card>
      )}

      {error && sessionValid && (
        <Card className="border-destructive">
          <CardContent className="pt-6 flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            {error}
          </CardContent>
        </Card>
      )}

      {sessionValid && !isLoadingSemesters && semesters.length === 0 && !error && (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No past internal semesters are available for this account.
          </CardContent>
        </Card>
      )}

      {sessionValid && semesters.length > 0 && (
        <Card>
          <CardContent className="flex flex-wrap gap-2 mt-4">
            {semesters.map((item) => (
              <Button
                key={item.semester}
                variant={selectedSemester === item.semester ? "default" : "outline"}
                onClick={() => handleSemesterSelect(item.semester)}
                disabled={isLoadingRows}
              >
                {item.label}
              </Button>
            ))}
          </CardContent>
        </Card>
      )}

      {sessionValid && selectedSemester && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5" />
              Semester {selectedSemester} Mark Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingRows ? (
              <div className="text-sm text-muted-foreground">Loading semester marks...</div>
            ) : groupedRows.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No mark rows found for the selected semester.
              </div>
            ) : (
              <div>
                <div className="space-y-2">
                  {groupedRows.map((row) => {
                    const isExpanded = !!expandedSubjects[row.id];
                    return (
                      <div key={row.id} className="rounded-md border bg-background px-3 py-2">
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span className="font-medium text-foreground">{row.code}</span>
                              <span>Sem {row.semester}</span>
                            </div>
                            <p className="mt-0.5 text-sm leading-snug">{row.description}</p>
                          </div>

                          <p className="text-sm font-semibold sm:text-right">
                            {row.total_mark_obtained.toFixed(2)}
                            <span className="ml-1 font-normal text-muted-foreground">
                              / {row.total_max_mark.toFixed(2)}
                            </span>
                          </p>
                        </div>

                        {row.components.length > 1 ? (
                          <div className="mt-2 border-t pt-2">
                            <button
                              type="button"
                              onClick={() => toggleSubject(row.id)}
                              className="flex w-full items-center justify-between text-left text-xs text-muted-foreground transition-colors hover:text-foreground"
                            >
                              <span>Breakdown ({row.components.length})</span>
                              <ChevronDown
                                className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                              />
                            </button>

                            {isExpanded && (
                              <div className="mt-2 space-y-1">
                                {row.components.map((component, componentIndex) => (
                                  <div
                                    key={`${row.id}-${component.subject_type}-${componentIndex}`}
                                    className="flex items-start justify-between text-xs"
                                  >
                                    <span className="text-muted-foreground">{component.subject_type}</span>
                                    <span className="font-medium">
                                      {component.mark_obtained} / {component.max_mark}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PastInternalsPage;
