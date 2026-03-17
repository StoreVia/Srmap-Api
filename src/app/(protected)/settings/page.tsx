"use client";
import axios from "axios";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import { Label } from "@/components/ui/label";
import { Toggle } from "@/components/ui/toggle";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import API from "@/components/client/api/AxiosClient";
import WarningPopup from "@/components/ui/warningBox";
import { useStudentData } from "@/context/StudentContext";
import ReportIssue from "@/components/page/settings/ReportIssue";
import { useLocalStorageContext } from "@/context/LocalStorageContext";
import { Sun, Moon, Mail, Database, Expand, Shrink, ChevronDown, ChevronUp, Lock, User, Calendar, Clock, Hash } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

const FIELD_META: Record<string, { label: string; icon: React.ReactNode; sensitive?: boolean }> = {
  _id:               { label: "Document ID",         icon: <Hash className="h-3.5 w-3.5" /> },
  username:          { label: "Username",             icon: <User className="h-3.5 w-3.5" /> },
  name:              { label: "Full Name",            icon: <User className="h-3.5 w-3.5" /> },
  createdAt:         { label: "Account Created",      icon: <Calendar className="h-3.5 w-3.5" /> },
  session_time:      { label: "Last Session Time",    icon: <Clock className="h-3.5 w-3.5" /> },
  limit:             { label: "Remaining Limit",      icon: <Hash className="h-3.5 w-3.5" /> },
  data:              { label: "Encrypted Data",       icon: <Lock className="h-3.5 w-3.5" />, sensitive: true },
  attendanceHistory: { label: "Attendance History",   icon: <Calendar className="h-3.5 w-3.5" /> },
};

const FIELD_ORDER = ["_id", "username", "name", "createdAt", "session_time", "limit", "data", "attendanceHistory"];

function formatDate(raw: unknown): string {
  if (!raw) return String(raw);
  const iso = typeof raw === "object" && raw !== null && "$date" in (raw as any)
    ? (raw as any).$date
    : raw;
  try {
    return new Date(iso as string).toLocaleString();
  } catch {
    return String(iso);
  }
}

function EncryptedField({ value }: { value: string }) {
  const [expanded, setExpanded] = useState(false);
  const preview = value.substring(0, 200);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="text-xs gap-1">
          <Lock className="h-3 w-3" /> Encrypted · {value.length} chars
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={() => setExpanded(v => !v)}
        >
          {expanded ? <><Shrink className="h-3 w-3 mr-1" />Collapse</> : <><Expand className="h-3 w-3 mr-1" />Expand</>}
        </Button>
      </div>
      <div className={`bg-muted p-3 rounded-md text-xs font-mono break-all overflow-y-auto transition-all ${expanded ? "max-h-96" : "max-h-20"}`}>
        {expanded ? value : `${preview}…`}
      </div>
      {!expanded && (
        <p className="text-xs text-muted-foreground">Showing first 200 of {value.length} characters.</p>
      )}
    </div>
  );
}

function AttendanceRow({ entry }: { entry: { date: string; data: string } }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/60 transition-colors text-sm font-medium"
        onClick={() => setOpen(v => !v)}
      >
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{entry.date}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Badge variant="secondary" className="text-xs">
            <Lock className="h-3 w-3 mr-1" />Encrypted
          </Badge>
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 border-t bg-muted/20">
          <EncryptedField value={entry.data} />
        </div>
      )}
    </div>
  );
}

function FieldValue({ fieldKey, value }: { fieldKey: string; value: unknown }) {
  if (fieldKey === "data" && typeof value === "string") {
    return <EncryptedField value={value} />;
  }
  if (fieldKey === "attendanceHistory" && Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-sm text-muted-foreground italic">No history recorded yet.</span>;
    }
    return (
      <div className="space-y-2 w-full">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="outline" className="text-xs">{value.length} days recorded</Badge>
        </div>
        {(value as Array<{ date: string; data: string }>).map((entry, i) => (
          <AttendanceRow key={entry.date ?? i} entry={entry} />
        ))}
      </div>
    );
  }
  if (typeof value === "object" && value !== null && "$date" in (value as any)) {
    return <span className="text-sm">{formatDate(value)}</span>;
  }
  if (typeof value === "object" && value !== null) {
    return (
      <pre className="text-xs bg-muted p-2 rounded-md overflow-x-auto max-h-40 overflow-y-auto whitespace-pre-wrap break-all">
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  }
  return <span className="text-sm break-all">{String(value)}</span>;
}

function DatabaseDataViewer({ data }: { data: Record<string, unknown> }) {
  const allKeys = [
    ...FIELD_ORDER.filter(k => k in data),
    ...Object.keys(data).filter(k => !FIELD_ORDER.includes(k)),
  ];

  return (
    <div className="space-y-3">
      {allKeys.map(key => {
        const meta = FIELD_META[key];
        return (
          <div key={key} className="border rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">{meta?.icon ?? <Hash className="h-3.5 w-3.5" />}</span>
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {meta?.label ?? key.replace(/_/g, " ")}
              </Label>
              {meta?.sensitive && (
                <Badge variant="outline" className="text-xs ml-auto">
                  <Lock className="h-3 w-3 mr-1" />Sensitive
                </Badge>
              )}
            </div>
            {/* Field value */}
            <div className="pl-5">
              <FieldValue fieldKey={key} value={data[key]} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

const Settings = () => {
  const router = useRouter();
  const { logout } = useAuth();
  const { profile, fetchFreshData } = useStudentData();
  const { toast } = useToast();
  const { updateProfile } = useLocalStorageContext();
  const { theme, setTheme } = useTheme();

  const [showReportModal, setShowReportModal] = useState(false);
  const [loadingFetch, setLoadingFetch] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [warningBox, setWarningBox] = useState<{
    open: boolean;
    title: string;
    description: string;
    warning: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: "",
    description: "",
    warning: "",
    onConfirm: () => {},
  });

  const [deleteReasonDialogOpen, setDeleteReasonDialogOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [deleteReasonError, setDeleteReasonError] = useState("");

  const [databaseDataDialogOpen, setDatabaseDataDialogOpen] = useState(false);
  const [databaseData, setDatabaseData] = useState<Record<string, unknown> | null>(null);
  const [loadingDatabaseData, setLoadingDatabaseData] = useState(false);

  const [dailyLimit, setDailyLimit] = useState<number>(20);
  const [limitLeft, setLimitLeft] = useState<number | null>(null);
  const [isLoadingLimit, setIsLoadingLimit] = useState(true);

  const fetchLimitUsage = async () => {
    try {
      setIsLoadingLimit(true);
      const res = await API.get(`/srmapi/limit`);
      if (res.data) {
        setDailyLimit(20);
        setLimitLeft(res.data.limit);
      }
    } catch {
      toast({ title: "Error", description: "Error Fetching Data!", variant: "destructive" });
    } finally {
      setIsLoadingLimit(false);
    }
  };

  const fetchDatabaseData = async () => {
    setLoadingDatabaseData(true);
    try {
      const response = await API.get("/tools/document");
      if (response.data.success) {
        setDatabaseData(response.data.document);
        setDatabaseDataDialogOpen(true);
      } else {
        toast({ title: "Error", description: "Failed to fetch database data", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to fetch database data", variant: "destructive" });
    } finally {
      setLoadingDatabaseData(false);
    }
  };

  const handleFetchData = async () => {
    setLoadingFetch(true);
    try {
      const limitRes = await API.get(`/srmapi/limit`);
      if (limitRes.data.limit > 0) {
        try {
          const newData = await API.get("/srmapi/initiate/session");
          const { sessionId, sessionTime } = newData.data;
          updateProfile({ sessionId, sessionTime });
          toast.success("Data Fetched Successfully!");
          setLimitLeft(limitRes.data.limit - 1);
          fetchFreshData({ sessionId, sessionTime });
          setTimeout(() => router.push("/attendance"), 1000);
        } catch (err) {
          if (axios.isAxiosError(err)) {
            const status = err.response?.status;
            const message = err.response?.data?.message || "Error Fetching Data!";
            toast({
              title: "Error",
              description: status === 429 ? "Daily Limit Exceeded, Try Again Tomorrow!" : message,
              variant: "destructive",
            });
          } else {
            toast({ title: "Error", description: "Unexpected Error!", variant: "destructive" });
          }
        }
      } else {
        toast({ title: "Error", description: "Daily Limit Exceeded, Try Again Tomorrow!", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Error Checking Limit!", variant: "destructive" });
    } finally {
      setLoadingFetch(false);
    }
  };

  const handleDelete = async (reason: string) => {
    setLoadingDelete(true);
    try {
      await API.delete(`/auth/delete`, { data: { reason } });
      toast({ title: "Success", description: "Account Deleted!" });
      setTimeout(() => logout(), 1000);
    } catch {
      toast({ title: "Error", description: "Failed To Delete Account!", variant: "destructive" });
    } finally {
      setLoadingDelete(false);
      setDeleteReasonDialogOpen(false);
      setDeleteReason("");
    }
  };

  const submitDeleteReason = () => {
    if (!deleteReason.trim()) {
      setDeleteReasonError("Please Provide A Reason To Delete Account.");
      return;
    }
    if (deleteReason.trim().length < 10) {
      setDeleteReasonError("Please provide a more detailed reason (at least 10 characters).");
      return;
    }
    setDeleteReasonError("");
    handleDelete(deleteReason.trim());
  };

  useEffect(() => { fetchLimitUsage(); }, []);

  return (
    <div className="w-full">
      {warningBox.open && (
        <WarningPopup
          title={warningBox.title}
          description={warningBox.description}
          warning={warningBox.warning}
          buttonName="Continue"
          buttonTheme="bg-university-700 hover:bg-university-800 text-white"
          onCancel={() => setWarningBox({ ...warningBox, open: false })}
          onConfirm={() => {
            setWarningBox({ ...warningBox, open: false });
            warningBox.onConfirm();
          }}
        />
      )}

      {showReportModal && (
        <ReportIssue
          onClose={() => setShowReportModal(false)}
          issueTypes={["Bug", "UI Issue", "Feature Request", "Contact"]}
        />
      )}

      <Dialog open={deleteReasonDialogOpen} onOpenChange={setDeleteReasonDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              Please help us improve by telling us why you're deleting your account.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-4">
            <div className="grid gap-2">
              <Label htmlFor="delete-reason">Reason for deletion</Label>
              <Textarea
                id="delete-reason"
                placeholder="Please share your reason (minimum 10 characters)..."
                value={deleteReason}
                onChange={e => {
                  setDeleteReason(e.target.value);
                  if (deleteReasonError) setDeleteReasonError("");
                }}
                className={deleteReasonError ? "border-destructive" : ""}
                disabled={loadingDelete}
                rows={4}
              />
              {deleteReasonError && <p className="text-sm text-destructive">{deleteReasonError}</p>}
              <p className="text-xs text-muted-foreground">{deleteReason.length}/10 characters minimum</p>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => { setDeleteReasonDialogOpen(false); setDeleteReason(""); setDeleteReasonError(""); }}
                disabled={loadingDelete}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={submitDeleteReason}
                disabled={loadingDelete || deleteReason.trim().length < 10}
              >
                {loadingDelete ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </span>
                ) : "Delete Account"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={databaseDataDialogOpen}
        onOpenChange={open => {
          setDatabaseDataDialogOpen(open);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Your Data in Database
            </DialogTitle>
            <DialogDescription>
              Exactly how your account is stored. Sensitive fields are encrypted end-to-end.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            {loadingDatabaseData ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="h-8 w-8 border-2 border-university-700 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-muted-foreground">Loading your data…</p>
              </div>
            ) : databaseData ? (
              <DatabaseDataViewer data={databaseData} />
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No data available.</p>
            )}
          </div>

          <div className="flex justify-end pt-2 border-t">
            <Button variant="outline" onClick={() => setDatabaseDataDialogOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="w-full space-y-5">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Switch Between Themes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Toggle pressed={theme === "light"} onClick={() => setTheme("light")} aria-label="Light theme">
                <Sun className="h-4 w-4 mr-1" /> Light
              </Toggle>
              <Toggle pressed={theme === "dark"} onClick={() => setTheme("dark")} aria-label="Dark theme">
                <Moon className="h-4 w-4 mr-1" /> Dark
              </Toggle>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Account Controls</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm sm:text-base break-words">
              Registration Number:{" "}
              <span className="font-medium break-all">{profile?.registerNo}</span>
            </p>

            {isLoadingLimit ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-2 w-full" />
              </div>
            ) : dailyLimit !== null && limitLeft !== null ? (
              <div className="space-y-1">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Daily Fetch Limit Left: {Math.min(limitLeft, dailyLimit)}/{dailyLimit}
                </p>
                <div className="w-full bg-muted h-2 rounded overflow-hidden">
                  <div
                    className="h-2 rounded bg-blue-600 transition-all duration-300"
                    style={{ width: `${(Math.min(limitLeft, dailyLimit) / dailyLimit) * 100}%` }}
                  />
                </div>
              </div>
            ) : (
              <Skeleton className="h-2 w-full" />
            )}

            <div className="flex flex-col gap-3">
              <Button
                onClick={() =>
                  setWarningBox({
                    open: true,
                    title: "Fetch New Data",
                    description:
                      "Srmapi automatically fetches your data when you login after 1 AM. This will count in your daily limit of 20 times.",
                    warning: "Do you want to still continue?",
                    onConfirm: handleFetchData,
                  })
                }
                disabled={loadingFetch}
                className="bg-university-700 hover:bg-university-800 dark:bg-university-500 dark:hover:bg-university-600 text-white w-full"
              >
                {loadingFetch ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Fetching...
                  </span>
                ) : "Fetch New Data"}
              </Button>

              <Button
                variant="secondary"
                onClick={fetchDatabaseData}
                disabled={loadingDatabaseData}
                className="w-full"
              >
                {loadingDatabaseData ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Loading...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Database className="h-4 w-4" />
                    View Your Data in Database
                  </span>
                )}
              </Button>

              <Button variant="secondary" onClick={() => setShowReportModal(true)} className="w-full">
                Report Issue
              </Button>

              <Button
                variant="destructive"
                onClick={() => setDeleteReasonDialogOpen(true)}
                disabled={loadingDelete}
                className="w-full"
              >
                {loadingDelete ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </span>
                ) : "Delete Account"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;