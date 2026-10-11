"use client";
import { useState, useEffect, useCallback } from "react";
import API from "@/lib/api/axiosClient";
import { toast } from "@/hooks/utils/useToast";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { RefreshCw, Database, CheckCircle2, AlertCircle, ShieldAlert, Calendar, Trash2, Star } from "lucide-react";
import { FacultyTimetableMeta } from "@/types/faculty";

interface AdminFacultyData {
  scraper: {
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
  };
  timetables: {
    meta: FacultyTimetableMeta | null;
    progress: {
      inProgress: boolean;
      stage: string;
      total: number;
      completed: number;
      left: number;
      currentTarget: string;
      error?: string | null;
      startedAt?: string | null;
    };
  };
  ratings: {
    totalRatings: number;
    ratedFacultyCount: number;
  };
}

export default function FacultyAdminPage() {
  const [data, setData] = useState<AdminFacultyData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);
  const [isGeneratingTimetables, setIsGeneratingTimetables] = useState(false);
  const [isResettingRatings, setIsResettingRatings] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  const fetchFacultyAdminData = useCallback(async () => {
    try {
      const res = await API.get("/admin/faculty");
      if (res.data?.success) {
        setData(res.data.data);
      }
    } catch (err: any) {
      toast({
        title: "Error fetching faculty data",
        description: err.response?.data?.message || "Failed to load faculty admin data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFacultyAdminData();
    const isWorking = data?.scraper?.progress?.inProgress || data?.timetables?.progress?.inProgress;
    const interval = setInterval(() => {
      fetchFacultyAdminData();
    }, isWorking ? 1500 : 8000);
    return () => clearInterval(interval);
  }, [fetchFacultyAdminData, data?.scraper?.progress?.inProgress, data?.timetables?.progress?.inProgress]);

  const handleStartScrape = async () => {
    if (data?.scraper?.progress?.inProgress || isTriggering) {
      toast({
        title: "Scrape in progress",
        description: "A scrape task is currently active. Please wait until it completes.",
        variant: "destructive"
      });
      return;
    }

    setIsTriggering(true);
    try {
      const res = await API.post("/admin/faculty", { action: "scrape" });
      if (res.data?.success) {
        toast({
          title: "Scraping Started",
          description: "Faculty and staff scraper is now running in the background."
        });
        await fetchFacultyAdminData();
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
    if (data?.timetables?.progress?.inProgress || isGeneratingTimetables) {
      toast({
        title: "Generation in progress",
        description: "Faculty timetables are already being generated. Please wait.",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingTimetables(true);
    try {
      const res = await API.post("/admin/faculty", { action: "timetables" });
      if (res.data?.success) {
        toast({
          title: "Timetable Generation Started",
          description: "Generating faculty teaching timetables in the background."
        });
        await fetchFacultyAdminData();
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

  const handleResetRatings = async () => {
    setIsResettingRatings(true);
    try {
      const res = await API.post("/admin/faculty", { action: "reset-ratings" });
      if (res.data?.success) {
        toast({
          title: "Ratings Reset Complete",
          description: res.data?.message || "Successfully reset faculty ratings."
        });
        setResetDialogOpen(false);
        await fetchFacultyAdminData();
      }
    } catch (err: any) {
      toast({
        title: "Reset Failed",
        description: err.response?.data?.message || "Failed to reset ratings",
        variant: "destructive"
      });
    } finally {
      setIsResettingRatings(false);
    }
  };

  const scraperProgress = data?.scraper?.progress;
  const dbStats = data?.scraper?.dbStats;
  const timetableMeta = data?.timetables?.meta;
  const timetableProgress = data?.timetables?.progress;
  const ratings = data?.ratings;

  const inProgress = !!scraperProgress?.inProgress;
  const progressPercent = scraperProgress?.total && scraperProgress.total > 0
    ? Math.min(100, Math.round((scraperProgress.completed / scraperProgress.total) * 100))
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
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setResetDialogOpen(true)}
                disabled={isResettingRatings}
                className="h-9 px-3 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 dark:border-red-900/40 dark:text-red-400 dark:hover:bg-red-950/30 gap-1.5 font-medium transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Reset Ratings
              </Button>
              <Button
                onClick={handleStartScrape}
                disabled={inProgress || isTriggering}
                className="min-w-[170px]"
                size="sm"
              >
                {inProgress || isTriggering ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Scraping In Progress...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                    Scrape Faculty & Staff
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs bg-muted/40 p-3 rounded-lg border">
            <div>
              <span className="text-muted-foreground block">Scraper Status</span>
              <span className="font-semibold text-sm capitalize flex items-center gap-1.5 pt-0.5">
                {inProgress ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 text-blue-500 animate-spin" />
                    Active
                  </>
                ) : scraperProgress?.stage === "error" ? (
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
              <span className="font-semibold text-sm pt-0.5 block">{dbStats?.totalFaculty ?? 0}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Total Staff</span>
              <span className="font-semibold text-sm pt-0.5 block">{dbStats?.totalStaff ?? 0}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Faculty Ratings</span>
              <span className="font-semibold text-sm pt-0.5 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                {ratings?.totalRatings ?? 0} ({ratings?.ratedFacultyCount ?? 0} faculty)
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block">Last Sync</span>
              <span className="font-semibold text-xs pt-0.5 block truncate">
                {dbStats?.lastScrapedAt
                  ? new Date(dbStats.lastScrapedAt).toLocaleString()
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
                  <span className="font-medium text-foreground">Completed:</span> {scraperProgress?.completed ?? 0}
                </div>
                <div>
                  <span className="font-medium text-foreground">Remaining:</span> {scraperProgress?.left ?? 0}
                </div>
                <div>
                  <span className="font-medium text-foreground">Total:</span> {scraperProgress?.total ?? 0}
                </div>
              </div>
              <div className="text-xs font-mono bg-background/80 p-2.5 rounded border truncate text-blue-900 dark:text-blue-200">
                <span className="font-semibold">Current Activity:</span> {scraperProgress?.currentTarget || "Working..."}
              </div>
            </div>
          )}

          {!inProgress && scraperProgress?.currentTarget && (
            <div className="rounded-lg border p-3 text-xs bg-muted/40 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span className="text-muted-foreground">{scraperProgress.currentTarget}</span>
            </div>
          )}

          {scraperProgress?.error && (
            <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 p-3 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{scraperProgress.error}</span>
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
              disabled={isGeneratingTimetables || !!timetableProgress?.inProgress}
              className="min-w-[190px] bg-white text-slate-900 border border-slate-200 hover:bg-slate-100 shadow-sm dark:bg-muted dark:text-foreground dark:border-border dark:hover:bg-muted/80 font-medium"
              size="sm"
            >
              {(isGeneratingTimetables || timetableProgress?.inProgress) ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin text-slate-900 dark:text-foreground" />
                  Generating...
                </>
              ) : (
                <>
                  <Calendar className="w-3.5 h-3.5 mr-1.5" />
                  Generate Timetables
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {timetableProgress?.inProgress && (
            <div className="space-y-2 p-3 bg-muted/40 rounded-lg border">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="flex items-center gap-1.5 text-primary">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Phase: {timetableProgress.stage}
                </span>
                <span className="text-muted-foreground">
                  {timetableProgress.total > 0
                    ? `${timetableProgress.completed} / ${timetableProgress.total} (${Math.round((timetableProgress.completed / timetableProgress.total) * 100)}%)`
                    : "Processing..."}
                </span>
              </div>
              <Progress
                value={
                  timetableProgress.total > 0
                    ? (timetableProgress.completed / timetableProgress.total) * 100
                    : 20
                }
                className="h-2"
              />
              <p className="text-[11px] text-muted-foreground truncate">
                {timetableProgress.currentTarget}
              </p>
            </div>
          )}

          {timetableProgress?.error && (
            <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 p-3 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{timetableProgress.error}</span>
            </div>
          )}
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

      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              Reset All Faculty Ratings?
            </DialogTitle>
            <DialogDescription className="space-y-2 pt-2 text-xs leading-relaxed">
              <span className="block">
                This action will permanently delete all student rating submissions and clear rating statistics across all faculty members in the database.
              </span>
              <span className="block font-medium text-foreground bg-muted p-2 rounded">
                Current Records: {ratings?.totalRatings ?? 0} ratings across {ratings?.ratedFacultyCount ?? 0} faculty profiles.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" size="sm" disabled={isResettingRatings}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleResetRatings}
              disabled={isResettingRatings}
            >
              {isResettingRatings ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Resetting...
                </>
              ) : (
                "Confirm Reset"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
