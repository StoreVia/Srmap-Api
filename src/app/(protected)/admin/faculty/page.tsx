"use client";
import { useState, useEffect, useCallback } from "react";
import API from "@/lib/api/axiosClient";
import { toast } from "@/hooks/utils/useToast";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RefreshCw, Database, CheckCircle2, AlertCircle, ShieldAlert, Calendar } from "lucide-react";
import { FacultyTimetableMeta } from "@/types/faculty";

interface StatusResponse {
  progress: {
    inProgress: boolean;
    stage: "idle" | "faculty_list" | "faculty_details" | "staff_list" | "saving" | "completed" | "error";
    total: number;
    completed: number;
    left: number;
    currentTarget: string;
    error?: string | null;
    lastScrapedAt?: string | null;
    startedAt?: string | null;
    totalFaculty?: number;
    totalStaff?: number;
  };
  dbStats: {
    totalFaculty: number;
    totalStaff: number;
    lastScrapedAt?: string | null;
  };
}

export default function ScrapeAdminPage() {
  const [data, setData] = useState<StatusResponse | null>(null);
  const [timetableMeta, setTimetableMeta] = useState<FacultyTimetableMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);
  const [isGeneratingTimetables, setIsGeneratingTimetables] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await API.get("/admin/scrape/status");
      if (res.data?.success) {
        setData(res.data.data);
      }
    } catch (err: any) {
      toast({
        title: "Error fetching status",
        description: err.response?.data?.message || "Failed to load scrape status",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchTimetableMeta = useCallback(async () => {
    try {
      const res = await API.get("/admin/faculty/timetables");
      if (res.data?.success) {
        setTimetableMeta(res.data.data);
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchStatus();
    fetchTimetableMeta();
    const interval = setInterval(() => {
      fetchStatus();
    }, data?.progress?.inProgress ? 1500 : 8000);
    return () => clearInterval(interval);
  }, [fetchStatus, fetchTimetableMeta, data?.progress?.inProgress]);

  const handleStartScrape = async () => {
    if (data?.progress?.inProgress || isTriggering) {
      toast({
        title: "Scrape in progress",
        description: "A scrape task is currently active. Please wait until it completes.",
        variant: "destructive"
      });
      return;
    }

    setIsTriggering(true);
    try {
      const res = await API.post("/admin/scrape");
      if (res.data?.success) {
        toast({
          title: "Scraping Started",
          description: "Faculty and staff scraper is now running in the background."
        });
        await fetchStatus();
      }
    } catch (err: any) {
      toast({
        title: "Failed to start scrape",
        description: err.response?.data?.message || "Could not start scraper",
        variant: "destructive"
      });
    } finally {
      setIsTriggering(false);
    }
  };

  const handleGenerateTimetables = async () => {
    if (isGeneratingTimetables) return;
    setIsGeneratingTimetables(true);
    toast({
      title: "Generating Faculty Timetables",
      description: "Processing collected student timetables across all semesters..."
    });

    try {
      const res = await API.post("/admin/faculty/timetables");
      if (res.data?.success) {
        toast({
          title: "Timetables Generated Successfully",
          description: res.data.message || "Faculty schedules updated"
        });
        await fetchTimetableMeta();
      }
    } catch (err: any) {
      toast({
        title: "Failed to generate timetables",
        description: err.response?.data?.message || "Error processing timetables",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingTimetables(false);
    }
  };

  const inProgress = !!data?.progress?.inProgress;
  const progressPercent = data?.progress?.total && data.progress.total > 0
    ? Math.min(100, Math.round((data.progress.completed / data.progress.total) * 100))
    : (inProgress ? 15 : 0);

  return (
    <div className="w-full space-y-6 pb-20">
      <Card className="shadow-sm border-slate-200 bg-white dark:border-border dark:bg-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              Scrape Faculty & Staff
            </CardTitle>
            <Button
              onClick={handleStartScrape}
              disabled={inProgress || isTriggering}
              className="min-w-[180px]"
              size="lg"
            >
              {inProgress || isTriggering ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Scraping In Progress...
                </>
              ) : (
                <>
                  Scrape Faculty & Staff
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-muted/40 p-3 rounded-lg border">
            <div>
              <span className="text-muted-foreground block">Scraper Status</span>
              <span className="font-semibold text-sm capitalize flex items-center gap-1.5 pt-0.5">
                {inProgress ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 text-blue-500 animate-spin" />
                    Active
                  </>
                ) : data?.progress?.stage === "error" ? (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                    Error
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                    Idle
                  </>
                )}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block">Total Faculty</span>
              <span className="font-semibold text-sm pt-0.5 block">{data?.dbStats?.totalFaculty ?? 0}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Total Staff</span>
              <span className="font-semibold text-sm pt-0.5 block">{data?.dbStats?.totalStaff ?? 0}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Last Sync</span>
              <span className="font-semibold text-xs pt-0.5 block truncate">
                {data?.dbStats?.lastScrapedAt
                  ? new Date(data.dbStats.lastScrapedAt).toLocaleString()
                  : "Never"}
              </span>
            </div>
          </div>

          {inProgress && (
            <div className="rounded-lg border bg-blue-50/50 dark:bg-blue-950/20 p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Live Scraping Progress
                </span>
                <span className="font-mono font-medium">{progressPercent}%</span>
              </div>
              <Progress value={progressPercent} className="h-2.5" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 text-xs text-muted-foreground">
                <div>
                  <span className="font-medium text-foreground">Completed:</span> {data?.progress?.completed ?? 0}
                </div>
                <div>
                  <span className="font-medium text-foreground">Remaining:</span> {data?.progress?.left ?? 0}
                </div>
                <div>
                  <span className="font-medium text-foreground">Total:</span> {data?.progress?.total ?? 0}
                </div>
              </div>
              <div className="text-xs font-mono bg-background/80 p-2.5 rounded border truncate text-blue-900 dark:text-blue-200">
                <span className="font-semibold">Current Activity:</span> {data?.progress?.currentTarget || "Working..."}
              </div>
            </div>
          )}

          {!inProgress && data?.progress?.currentTarget && (
            <div className="rounded-lg border p-3 text-xs bg-muted/40 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span className="text-muted-foreground">{data.progress.currentTarget}</span>
            </div>
          )}

          {data?.progress?.error && (
            <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 p-3 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{data.progress.error}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm border-slate-200 bg-white dark:border-border dark:bg-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Faculty Timetables Generator
            </CardTitle>
            <Button
              onClick={handleGenerateTimetables}
              disabled={isGeneratingTimetables}
              className="min-w-[190px] bg-white text-slate-900 border border-slate-200 hover:bg-slate-100 shadow-sm dark:bg-muted dark:text-foreground dark:border-border dark:hover:bg-muted/80 font-medium"
              size="lg"
            >
              {isGeneratingTimetables ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin text-slate-900 dark:text-foreground" />
                  Generating...
                </>
              ) : (
                <>
                  Generate Timetables
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-muted/40 p-3 rounded-lg border">
            <div>
              <span className="text-muted-foreground block">Processed Timetables</span>
              <span className="font-semibold text-sm pt-0.5 block">{timetableMeta?.totalTimetablesProcessed ?? 0}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Mapped Faculty</span>
              <span className="font-semibold text-sm pt-0.5 block">{timetableMeta?.totalFacultyWithSchedules ?? 0}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Total Teaching Slots</span>
              <span className="font-semibold text-sm pt-0.5 block">{timetableMeta?.totalClasses ?? 0}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Timetable Sync</span>
              <span className="font-semibold text-xs pt-0.5 block truncate">
                {timetableMeta?.lastGeneratedAt
                  ? new Date(timetableMeta.lastGeneratedAt).toLocaleString()
                  : "Never"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


