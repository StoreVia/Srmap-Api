"use client";
import axios from "axios";
import { useState } from "react";
import API from "@/lib/api/axiosClient";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/utils/useToast";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";
import { Textarea } from "@/components/ui/textarea";
import WarningPopup from "@/components/ui/warningBox";
import { useStudentData } from "@/context/StudentContext";
import ReportIssue from "@/components/page/settings/ReportIssue";
import { useLocalStorageContext } from "@/context/LocalStorageContext";
import { useIsMobile } from "@/hooks/utils/useMobile";
import { handleRegNumberChange } from "@/shared/utils/functions";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sun, Moon, Database, Lock, User, Calendar, Clock, Hash, Expand, Shrink, ChevronDown, ChevronUp, RefreshCw, Trash2, Flag, LayoutDashboard, Fingerprint, CalendarDays, CheckSquare, Sunrise, Check } from "lucide-react";

const FIELD_META: Record<string, { label: string; icon: React.ReactNode; sensitive?: boolean }> = {
  username: { label: "Username", icon: <User className="h-3.5 w-3.5" /> },
  name: { label: "Full Name", icon: <User className="h-3.5 w-3.5" /> },
  createdAt: { label: "Account Created", icon: <Calendar className="h-3.5 w-3.5" /> },
  session_time: { label: "Last Session Time", icon: <Clock className="h-3.5 w-3.5" /> },
  data: { label: "Encrypted Data", icon: <Lock className="h-3.5 w-3.5" />, sensitive: true },
  attendanceHistory: { label: "Attendance History", icon: <Calendar className="h-3.5 w-3.5" /> },
  session_id: { label: "Session Id", icon: <Fingerprint className="h-3.5 w-3.5" /> },
};

const FIELD_ORDER = ["username", "name", "createdAt", "session_id", "session_time", "data", "attendanceHistory"];

function formatDate(raw: unknown): string {
  if (!raw) return String(raw);
  const iso = typeof raw === "object" && raw !== null && "$date" in (raw as any)
    ? (raw as any).$date : raw;
  try { return new Date(iso as string).toLocaleString(); }
  catch { return String(iso); }
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
        <button
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted"
          onClick={() => setExpanded(v => !v)}
        >
          {expanded ? <><Shrink className="h-3 w-3" />Collapse</> : <><Expand className="h-3 w-3" />Expand</>}
        </button>
      </div>
      <div className={`bg-muted p-3 rounded-md text-xs font-mono break-all overflow-y-auto transition-all ${expanded ? "max-h-96" : "max-h-20"}`}>
        {expanded ? value : `${preview}…`}
      </div>
      {!expanded && <p className="text-xs text-muted-foreground">Showing first 200 of {value.length} characters.</p>}
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
          <Badge variant="secondary" className="text-xs"><Lock className="h-3 w-3 mr-1" />Encrypted</Badge>
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
  if (fieldKey === "data" && typeof value === "string") return <EncryptedField value={value} />;
  if (fieldKey === "attendanceHistory" && Array.isArray(value)) {
    if (value.length === 0) return <span className="text-sm text-muted-foreground italic">No history recorded yet.</span>;
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
            <div className="pl-5">
              <FieldValue fieldKey={key} value={data[key]} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

const STARTUP_PAGES = [
  { value: "attendance", label: "Attendance", icon: <CheckSquare className="h-4 w-4" /> },
  { value: "timetable", label: "Timetable", icon: <CalendarDays className="h-4 w-4" /> },
  { value: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
] as const;

const MOBILE_NAVIGATION_OPTIONS = [
  { value: "single", label: "Single row", description: "Shows every navigation option in one horizontally scrollable bar at the bottom." },
  { value: "double", label: "Double rows", description: "Uses two compact rows in the bottom bar, so more navigation options are visible at once." },
  { value: "mini", label: "Mini options", description: "Places tiny icon-only navigation bars on the left and right edges of the screen." },
  { value: "sidebar", label: "Sidebar", description: "Uses a compact vertical icon sidebar on the left side of the screen." },
] as const;

function AccordionRow({
  icon,
  label,
  sub,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  sub?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
      >
        <span className="text-muted-foreground shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground leading-none">{label}</p>
          {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-4 pb-3 border-t bg-muted/20">
          {children}
        </div>
      )}
    </div>
  );
}

function ActionRow({
  icon,
  label,
  sub,
  onClick,
  disabled,
  loading,
  loadingLabel,
  destructive,
}: {
  icon: React.ReactNode;
  label: string;
  sub?: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  loadingLabel?: string;
  destructive?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed ${destructive ? "hover:bg-destructive/8" : "hover:bg-muted/50"
        }`}
    >
      <span className={`shrink-0 ${destructive ? "text-red-600" : "text-muted-foreground"}`}>{icon}</span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium leading-none ${destructive ? "text-red-600" : "text-foreground"}`}>
          {loading && loadingLabel ? loadingLabel : label}
        </p>
        {sub && <p className={`text-xs mt-0.5 ${destructive ? "text-red-600" : ""}`}>{sub}</p>}
      </div>
    </button>
  );
}

function SettingsCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-1">{label}</p>
      <div className="rounded-xl border bg-card overflow-hidden divide-y divide-border">
        {children}
      </div>
    </div>
  );
}

const Settings = () => {
  const isMobile = useIsMobile();
  const router = useRouter();
  const { logout, login, isLoginLoading, accounts, activeAccountId, switchAccount } = useAuth();
  const { initiateSession } = useStudentData();
  const { theme, setTheme } = useTheme();
  const { settings, updateSettings, removeAccount } = useLocalStorageContext();

  const [showReportModal, setShowReportModal] = useState(false);
  const [loadingFetch, setLoadingFetch] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [warningBox, setWarningBox] = useState<{
    open: boolean; title: string; description: string; warning: string; onConfirm: () => void;
  }>({ open: false, title: "", description: "", warning: "", onConfirm: () => { } });

  const [deleteReasonDialogOpen, setDeleteReasonDialogOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [deleteReasonError, setDeleteReasonError] = useState("");

  const [databaseDataDialogOpen, setDatabaseDataDialogOpen] = useState(false);
  const [databaseData, setDatabaseData] = useState<Record<string, unknown> | null>(null);
  const [loadingDatabaseData, setLoadingDatabaseData] = useState(false);
  const [addAccountDialogOpen, setAddAccountDialogOpen] = useState(false);
  const [newAccountUsername, setNewAccountUsername] = useState("");
  const [newAccountPassword, setNewAccountPassword] = useState("");

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
      await initiateSession();
      setTimeout(() => router.push("/attendance"), 1000);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || "Error Fetching Data!");
      } else {
        toast.error("Unexpected Error!");
      }
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
    if (!deleteReason.trim()) { setDeleteReasonError("Please provide a reason to delete your account."); return; }
    if (deleteReason.trim().length < 10) { setDeleteReasonError("Please provide a more detailed reason (at least 10 characters)."); return; }
    setDeleteReasonError("");
    handleDelete(deleteReason.trim());
  };

  const handleAddAccount = async () => {
    if (!newAccountUsername.trim() || !newAccountPassword.trim()) {
      toast({ title: "Missing fields", description: "Please enter registration number and password.", variant: "destructive" });
      return;
    }
    const result = await login(newAccountUsername, newAccountPassword);
    if (result && result.success) {
      toast({ title: "Account added", description: "Account saved and switched successfully." });
      setAddAccountDialogOpen(false);
      setNewAccountUsername("");
      setNewAccountPassword("");
      setTimeout(() => router.push("/dashboard"), 200);
    } else if (result?.hasCachedData) {
      setAddAccountDialogOpen(false);
      setWarningBox({
        open: true,
        title: "Portal Down",
        description: "The college portal is currently down, but we found cached data for this account in our database.",
        warning: "Would you like to add this account using the cached data?",
        onConfirm: async () => {
          const cachedResult = await login(newAccountUsername, newAccountPassword, true);
          if (cachedResult?.success) {
            toast({ title: "Account added", description: "Account saved and switched successfully using cached data." });
            setNewAccountUsername("");
            setNewAccountPassword("");
            setTimeout(() => router.push("/dashboard"), 200);
          } else {
            toast({ title: "Failed to add account", description: cachedResult?.error || "Unknown error occurred.", variant: "destructive" });
          }
        }
      });
    } else {
      toast({ title: "Failed to add account", description: result?.error || "Unknown error occurred.", variant: "destructive" });
    }
  };

  const activeStartupPage = STARTUP_PAGES.find(p => p.value === settings.startupPage);
  const hasAccounts = (accounts?.length || 0) > 0;
  const activeAccount = accounts.find((a) => a.id === activeAccountId);

  return (
    <div className="w-full space-y-5">
      {warningBox.open && (
        <WarningPopup
          title={warningBox.title}
          description={warningBox.description}
          warning={warningBox.warning}
          buttonName="Continue"
          buttonTheme="bg-university-700 hover:bg-university-800 text-white"
          onCancel={() => setWarningBox({ ...warningBox, open: false })}
          onConfirm={() => { setWarningBox({ ...warningBox, open: false }); warningBox.onConfirm(); }}
        />
      )}

      {showReportModal && (
        <ReportIssue onClose={() => setShowReportModal(false)} issueTypes={["Bug", "UI Issue", "Feature Request", "Contact"]} />
      )}

      <Dialog open={deleteReasonDialogOpen} onOpenChange={setDeleteReasonDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>Please help us improve by telling us why you're deleting your account.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-4">
            <div className="grid gap-2">
              <Label htmlFor="delete-reason">Reason for deletion</Label>
              <Textarea
                id="delete-reason"
                placeholder="Please share your reason (minimum 10 characters)..."
                value={deleteReason}
                onChange={e => { setDeleteReason(e.target.value); if (deleteReasonError) setDeleteReasonError(""); }}
                className={deleteReasonError ? "border-destructive" : ""}
                disabled={loadingDelete}
                rows={4}
              />
              {deleteReasonError && <p className="text-sm text-destructive">{deleteReasonError}</p>}
              <p className="text-xs text-muted-foreground">{deleteReason.length}/10 characters minimum</p>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => { setDeleteReasonDialogOpen(false); setDeleteReason(""); setDeleteReasonError(""); }} disabled={loadingDelete}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={submitDeleteReason} disabled={loadingDelete || deleteReason.trim().length < 10}>
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

      <Dialog open={databaseDataDialogOpen} onOpenChange={setDatabaseDataDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Your Data in Database
            </DialogTitle>
            <DialogDescription>Exactly how your account is stored. Sensitive fields are encrypted end-to-end.</DialogDescription>
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
            <Button variant="outline" onClick={() => setDatabaseDataDialogOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={addAccountDialogOpen} onOpenChange={setAddAccountDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Another Account</DialogTitle>
            <DialogDescription>Sign in with another account. You can store up to 5 accounts.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid gap-2">
              <Label htmlFor="account-username">Registration Number</Label>
              <Input
                id="account-username"
                placeholder="AP24110000000"
                value={newAccountUsername}
                onChange={(e) => setNewAccountUsername(handleRegNumberChange(e))}
                className="uppercase"
                disabled={isLoginLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="account-password">Password</Label>
              <Input
                id="account-password"
                type="password"
                placeholder="Student Portal Password"
                value={newAccountPassword}
                onChange={(e) => setNewAccountPassword(e.target.value)}
                disabled={isLoginLoading}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setAddAccountDialogOpen(false)}
                disabled={isLoginLoading}
              >
                Cancel
              </Button>
              <Button onClick={handleAddAccount} disabled={isLoginLoading}>
                {isLoginLoading ? "Adding..." : "Add Account"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <SettingsCard label="Appearance">
        <AccordionRow
          icon={<Sun className="h-4 w-4" />}
          label="Theme"
          sub={theme === "light" ? "Light" : "Dark"}
        >
          <div className="flex gap-2 pt-3">
            {(["light", "dark"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`flex items-center gap-2 flex-1 justify-center px-3 py-2 rounded-lg border text-sm font-medium transition-all ${theme === t
                    ? "border-university-600 bg-university-700/10 text-university-600 dark:border-university-500 dark:text-university-400"
                    : "border-border text-muted-foreground hover:bg-muted"
                  }`}
              >
                {t === "light" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                {t === "light" ? "Light" : "Dark"}
                {theme === t && <Check className="h-3 w-3 ml-auto" />}
              </button>
            ))}
          </div>
        </AccordionRow>

        <AccordionRow
          icon={<Sunrise className="h-4 w-4" />}
          label="Startup Page"
          sub={activeStartupPage?.label ?? "Not set"}
        >
          <div className="flex flex-col gap-0.5 pt-2">
            {STARTUP_PAGES.map(({ value, label, icon }) => {
              const active = settings.startupPage === value;
              return (
                <button
                  key={value}
                  onClick={() => updateSettings({ startupPage: value })}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${active
                      ? "bg-university-700/10 text-university-600 dark:bg-university-500/10 dark:text-university-400 font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                >
                  {icon}
                  {label}
                  {active && <Check className="h-3.5 w-3.5 ml-auto" />}
                </button>
              );
            })}
          </div>
        </AccordionRow>

        {isMobile && (
          <AccordionRow
            icon={<LayoutDashboard className="h-4 w-4" />}
            label="Mobile Navigation"
            sub={MOBILE_NAVIGATION_OPTIONS.find(({ value }) => value === settings.mobileNavigationLayout)?.label ?? "Single row"}
          >
            <p className="pt-3 text-xs text-muted-foreground">
              {MOBILE_NAVIGATION_OPTIONS.find(({ value }) => value === settings.mobileNavigationLayout)?.description}
            </p>
            <div className="grid grid-cols-2 gap-2 pt-3">
              {MOBILE_NAVIGATION_OPTIONS.map(({ value, label }) => {
                const active = settings.mobileNavigationLayout === value;
                return (
                  <button
                    key={value}
                    onClick={() => updateSettings({ mobileNavigationLayout: value })}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-2 py-2 text-sm font-medium transition-all ${active
                        ? "border-university-600 bg-university-700/10 text-university-600 dark:border-university-500 dark:text-university-400"
                        : "border-border text-muted-foreground hover:bg-muted"
                      }`}
                  >
                    {label}
                    {active && <Check className="h-3 w-3" />}
                  </button>
                );
              })}
            </div>
          </AccordionRow>
        )}
      </SettingsCard>

      <SettingsCard label="Data Control">
        <ActionRow
          icon={<RefreshCw className={`h-4 w-4 ${loadingFetch ? "animate-spin" : ""}`} />}
          label="Fetch New Data"
          sub="Manually sync your latest attendance"
          loading={loadingFetch}
          loadingLabel="Fetching..."
          disabled={loadingFetch}
          onClick={() =>
            setWarningBox({
              open: true,
              title: "Fetch New Data",
              description: "Srmapi automatically fetches your data when you login after 1 AM.",
              warning: "Do you want to still continue?",
              onConfirm: handleFetchData,
            })
          }
        />
        <ActionRow
          icon={<Database className="h-4 w-4" />}
          label="View Database Record"
          sub="See exactly how your data is stored"
          loading={loadingDatabaseData}
          loadingLabel="Loading..."
          disabled={loadingDatabaseData}
          onClick={fetchDatabaseData}
        />
      </SettingsCard>

      <SettingsCard label="Accounts">
        <AccordionRow
          icon={<User className="h-4 w-4" />}
          label="Switch Account"
          sub={activeAccount ? `Active: ${activeAccount.username}` : "No active account"}
        >
          <div className="flex flex-col gap-2 pt-3">
            {!hasAccounts && (
              <p className="text-sm text-muted-foreground">No accounts found. Login to add an account.</p>
            )}
            {accounts.map((account) => {
              const isActive = account.id === activeAccountId;
              return (
                <div
                  key={account.id}
                  className="flex flex-col gap-2 rounded-lg border px-3 py-2 sm:flex-row sm:items-center"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{account.username}</p>
                    <p className="text-xs text-muted-foreground">{isActive ? "Currently active" : "Stored account"}</p>
                  </div>
                  <div className="flex w-full gap-2 sm:w-auto sm:shrink-0">
                    {!isActive && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 sm:flex-none"
                        onClick={() => {
                          switchAccount(account.id);
                        }}
                      >
                        Switch
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 sm:flex-none text-red-600 hover:text-destructive"
                      onClick={() => removeAccount(account.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              );
            })}
            <Button
              variant="outline"
              className="mt-1"
              onClick={() => setAddAccountDialogOpen(true)}
              disabled={(accounts?.length || 0) >= 5}
            >
              Add Another Account
            </Button>
            <p className="text-xs text-muted-foreground">You can store up to 5 accounts.</p>
          </div>
        </AccordionRow>
      </SettingsCard>

      <SettingsCard label="Other">
        <ActionRow
          icon={<Flag className="h-4 w-4" />}
          label="Report an Issue"
          sub="Bugs, UI issues, or feature requests"
          onClick={() => setShowReportModal(true)}
        />
        <ActionRow
          icon={<Trash2 className="h-4 w-4" />}
          label="Delete Account"
          sub="Permanently remove your account and all data"
          loading={loadingDelete}
          loadingLabel="Deleting..."
          disabled={loadingDelete}
          destructive
          onClick={() => setDeleteReasonDialogOpen(true)}
        />
      </SettingsCard>

    </div>
  );
};

export default Settings;