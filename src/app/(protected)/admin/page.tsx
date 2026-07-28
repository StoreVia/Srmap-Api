"use client";
import { toast } from "@/hooks/utils/useToast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import WarningPopup from "@/components/ui/warningBox";
import { useAdmin } from "@/context/AdminContext";
import { Skeleton } from "@/components/ui/skeleton";
import API from "@/lib/api/axiosClient";
import { useEffect, useState, useCallback } from "react";
import { Users, Calendar, SquarePen, Unlock, Plus, Database, CheckCircle2, Power } from "lucide-react";
import { handleRegNumberChange } from "@/shared/utils/functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface AdminStats {
  success: boolean;
  settings: {
    feedbackEnabled: boolean;
    timetableCollectionEnabled: boolean;
  }
  counts: {
    today: number;
    total: number;
    todayRegistered: number;
    feedback: number;
    timetables: number;
  };
  blockedUsers: BlockedUser[];
  notifications: Notification[];
}

interface BlockedUser {
  username: string;
  blockedAt: string;
  blockedBy: string;
}

interface Notification {
  _id: string;
  notification: string;
  createdAt: string;
  notificationBy: string;
}

export default function AdminPage() {
  const { isAdmin } = useAdmin();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [usernameToBlock, setUsernameToBlock] = useState("");
  const [notification, setNotification] = useState("");
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);
  const [notificationsDialogOpen, setNotificationsDialogOpen] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [feedbackEnabled, setFeedbackEnabled] = useState(false);
  const [timetableCollectionEnabled, setTimetableCollectionEnabled] = useState(true);
  const [settingsAction, setSettingsAction] = useState<string | null>(null);
  const [warningBox, setWarningBox] = useState<{
    open: boolean;
    title: string;
    description: string;
    warning: string;
    onConfirm: () => void;
  }>({ open: false, title: "", description: "", warning: "", onConfirm: () => {} });

  const fetchAdminStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const response = await API.get(`/admin/details`);
      const data = response.data;

      if (data.success) {
        setFeedbackEnabled(data.settings.feedbackEnabled);
        setTimetableCollectionEnabled(data.settings.timetableCollectionEnabled);
        setStats(prev => {
          if (!prev) return data;
          const existingUsernames = new Set(prev.blockedUsers.map(user => user.username));
          const exisitingNotifications = new Set(prev.notifications.map(notification => notification._id));
          const newBlockedUsers = data.blockedUsers.filter((user: BlockedUser) => !existingUsernames.has(user.username));
          const newNotifications = data.notifications.filter((notification: Notification) => !exisitingNotifications.has(notification._id));

          if (newBlockedUsers.length > 0 || newNotifications.length > 0) {
            return {
              ...prev,
              counts: data.counts,
              blockedUsers: [...newBlockedUsers, ...prev.blockedUsers],
              notifications: [...newNotifications, ...prev.notifications]
            };
          }
          return {
            ...prev,
            counts: data.counts
          };
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed To Fetch Admin Statistics!",
        variant: "destructive"
      });
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const handleBlockUser = async () => {
    if (!usernameToBlock.trim()) {
      toast({
        title: "Error",
        description: "Username Is Required!",
        variant: "destructive"
      });
      return;
    }
    try {
      setBlockLoading(true);
      const response = await API.post("/admin/block/add", {
        username: usernameToBlock.trim()
      });
      if (response.data.success) {
        setUsernameToBlock("");
        setBlockDialogOpen(false);
        fetchAdminStats();
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to block user",
        variant: "destructive"
      });
    } finally {
      setBlockLoading(false);
    }
  };

  const handleUnblock = async (username: string) => {
    try {
      const response = await API.post("/admin/block/remove", { username });
      if (response.data.success) {
        setStats(prev => {
          if (!prev) return null;
          return {
            ...prev,
            blockedUsers: prev.blockedUsers.filter(user => user.username !== username),
            counts: {
              ...prev.counts,
              today: prev.counts.today,
              total: prev.counts.total,
              todayRegistered: prev.counts.todayRegistered
            }
          };
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed To Unblock User!",
        variant: "destructive"
      });
    }
  };

  const handleAddNotification = async () => {
    if (!notification.trim()) {
      toast({
        title: "Error",
        description: "Notification Is Required!",
        variant: "destructive"
      });
      return;
    }
    try {
      setNotificationsLoading(true);
      const response = await API.post("/admin/notification/add", { notification });
      if (response.data.success) {
        setNotification("");
        setNotificationsDialogOpen(false);
        fetchAdminStats();
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to add notification",
        variant: "destructive"
      });
    } finally {
      setNotificationsLoading(false);
    }
  };

  const handleRemoveNotification = async (notificationId: string) => {
    try {
      const response = await API.post("/admin/notification/remove", { notificationId });
      if (response.data.success) {
        setStats(prev => {
          if (!prev) return null;
          return {
            ...prev,
            notifications: prev.notifications.filter(notification => notification._id !== notificationId),
            counts: {
              ...prev.counts,
              today: prev.counts.today,
              total: prev.counts.total,
              todayRegistered: prev.counts.todayRegistered
            }
          };
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed To Unblock User!",
        variant: "destructive"
      });
    }
  };

  const handleToggleFeedback = async () => {
    try {
      setSettingsAction("feedback-toggle");
      const res = await API.post("/admin/settings/feedback/toggle");
      if (res.data.success) setFeedbackEnabled(res.data.feedback);
    } catch {
      toast({ title: "Error", description: "Failed to update feedback setting", variant: "destructive" });
    } finally {
      setSettingsAction(null);
    }
  };

  const handleResetFeedback = async () => {
    try {
      setSettingsAction("feedback-reset");
      const res = await API.post("/admin/settings/feedback/reset");
      if (res.data.success) fetchAdminStats();
    } catch {
      toast({ title: "Error", description: "Failed to reset feedback count", variant: "destructive" });
    } finally {
      setSettingsAction(null);
    }
  };

  const handleToggleTimetableCollection = async () => {
    try {
      setSettingsAction("timetable-toggle");
      const res = await API.post("/admin/settings/timetable/toggle");
      if (res.data.success) setTimetableCollectionEnabled(res.data.timetableCollection);
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to update timetable collection", variant: "destructive" });
    } finally {
      setSettingsAction(null);
    }
  };

  const handleResetTimetables = async () => {
    try {
      setSettingsAction("timetable-reset");
      const res = await API.post("/admin/settings/timetable/reset");
      if (res.data.success) {
        toast({ title: "Timetables reset", description: `${res.data.deletedCount} collected timetable records removed.` });
        fetchAdminStats();
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to reset collected timetables", variant: "destructive" });
    } finally {
      setSettingsAction(null);
    }
  };

  const confirmResetFeedback = () => {
    setWarningBox({
      open: true,
      title: "Reset Feedback Count",
      description: "This sets the total collected feedback count to zero.",
      warning: "This action cannot be undone.",
      onConfirm: handleResetFeedback,
    });
  };

  const confirmResetTimetables = () => {
    setWarningBox({
      open: true,
      title: "Reset Collected Timetables",
      description: `This deletes all ${stats?.counts.timetables ?? 0} timetable records used by the vacant-room feature.`,
      warning: "This action cannot be undone.",
      onConfirm: handleResetTimetables,
    });
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAdminStats();
      const interval = setInterval(() => {
        if (document.visibilityState === "visible") {
          fetchAdminStats();
        }
      }, 10000);;
      return () => clearInterval(interval);
    }
  }, [isAdmin, fetchAdminStats]);

  return (
    <div className="space-y-6">
      {warningBox.open && (
        <WarningPopup
          title={warningBox.title}
          description={warningBox.description}
          warning={warningBox.warning}
          buttonName="Confirm reset"
          buttonTheme="bg-red-600 hover:bg-red-700 text-white"
          onCancel={() => setWarningBox((current) => ({ ...current, open: false }))}
          onConfirm={() => {
            const action = warningBox.onConfirm;
            setWarningBox((current) => ({ ...current, open: false }));
            action();
          }}
        />
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 lg:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? (
                <Skeleton className="h-8 w-16"></Skeleton>
              ) : (
                stats?.counts.total.toLocaleString() || "0"
              )}
            </div>
            <p className="text-xs text-muted-foreground">All registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Active Users</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? (
                <Skeleton className="h-8 w-16"></Skeleton>
              ) : (
                stats?.counts.today.toLocaleString() || "0"
              )}
            </div>
            <p className="text-xs text-muted-foreground">Active today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Registered</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? (
                <Skeleton className="h-8 w-16"></Skeleton>
              ) : (
                stats?.counts.todayRegistered.toLocaleString() || "0"
              )}
            </div>
            <p className="text-xs text-muted-foreground">Registered today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Feedback Submitted</CardTitle>
            <SquarePen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? (
                <Skeleton className="h-8 w-16"></Skeleton>
              ) : (
                stats?.counts.feedback.toLocaleString() || "0"
              )}
            </div>
            <p className="text-xs text-muted-foreground">Registered today</p>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="flex items-center gap-2 text-base"><Power className="h-4 w-4" />Application controls</CardTitle>
          <p className="text-sm text-muted-foreground">Manage feedback and the timetable data used by the vacant-room feature.</p>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 p-3 sm:p-4">
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-start justify-between gap-3"><div><p className="font-medium">Enable Feedback</p><p className="text-xs text-muted-foreground">Allow students to submit SRM feedback.</p></div><CheckCircle2 className={`h-5 w-5 ${feedbackEnabled ? "text-green-600" : "text-muted-foreground"}`} /></div>
            <Button className="h-auto min-h-10 w-full whitespace-normal break-words px-2 text-xs leading-tight" variant={feedbackEnabled ? "outline" : "default"} onClick={handleToggleFeedback} disabled={settingsAction !== null}>{settingsAction === "feedback-toggle" ? "Updating..." : feedbackEnabled ? "Disable Feedback" : "Enable Feedback"}</Button>
          </div>
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-start justify-between gap-3"><div><p className="font-medium">Enable Timetable Collection</p><p className="text-xs text-muted-foreground">Collect anonymous timetable data for vacant rooms.</p></div><Database className={`h-5 w-5 ${timetableCollectionEnabled ? "text-green-600" : "text-muted-foreground"}`} /></div>
            <Button className="h-auto min-h-10 w-full whitespace-normal break-words px-2 text-xs leading-tight" variant={timetableCollectionEnabled ? "outline" : "default"} onClick={handleToggleTimetableCollection} disabled={settingsAction !== null}>{settingsAction === "timetable-toggle" ? "Updating..." : timetableCollectionEnabled ? "Disable Collection" : "Enable Collection"}</Button>
          </div>
          <div className="rounded-lg border p-4 space-y-3">
            <div><p className="font-medium">Reset Collected Timetables</p><p className="text-xs text-muted-foreground">Delete {stats?.counts.timetables ?? 0} cached timetable records.</p></div>
            <Button className="h-auto min-h-10 w-full whitespace-normal break-words px-2 text-xs leading-tight" variant="destructive" onClick={confirmResetTimetables} disabled={settingsAction !== null}>{settingsAction === "timetable-reset" ? "Resetting..." : "Reset"}</Button>
          </div>
          <div className="rounded-lg border p-4 space-y-3">
            <div><p className="font-medium">Reset Feedback Count</p><p className="text-xs text-muted-foreground">Set the total submitted-feedback count to zero.</p></div>
            <Button className="h-auto min-h-10 w-full whitespace-normal break-words px-2 text-xs leading-tight" variant="destructive" onClick={confirmResetFeedback} disabled={settingsAction !== null}>{settingsAction === "feedback-reset" ? "Resetting..." : "Reset"}</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden flex flex-col">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2">
          <CardTitle className="text-sm font-medium">Notifications</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Dialog open={notificationsDialogOpen} onOpenChange={setNotificationsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="whitespace-nowrap">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Notification
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Notification</DialogTitle>
                  <DialogDescription>
                    Enter New Notification.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Input
                      placeholder="Add Notification"
                      value={notification}
                      onChange={(e) => setNotification(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddNotification();
                      }}
                    />
                  </div>
                  <Button onClick={handleAddNotification} disabled={notificationsLoading}>
                    {notificationsLoading ? "Adding..." : "Add"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent className="overflow-y-auto max-h-96">
          {statsLoading && (
            <p className="text-sm text-muted-foreground">Loading...</p>
          )}
          {!statsLoading && (!stats || stats.notifications.length === 0) && (
            <p className="text-sm text-muted-foreground">No Notifications</p>
          )}
          <ul className="space-y-2">
            {stats?.notifications.map((notification, idx) => (
              <li
                key={idx}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm p-2 rounded-md border gap-2"
              >
                <div>
                  <span className="font-medium break-words">{notification.notification}</span>
                  <p className="text-xs text-muted-foreground">
                    Added at {new Date(notification.createdAt).toLocaleString()} by{" "}
                    {notification.notificationBy}
                  </p>
                </div>
                <Button
                  onClick={() => handleRemoveNotification(notification._id)}
                  size="sm"
                  variant="ghost"
                  className="text-green-600 hover:text-green-800 self-start sm:self-auto"
                >
                  <Unlock className="h-4 w-4 mr-1" /> Remove
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="overflow-hidden flex flex-col">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2">
          <CardTitle className="text-sm font-medium">Blocked Users</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Dialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="whitespace-nowrap">
                  <Plus className="h-4 w-4 mr-2" />
                  Block User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Block User</DialogTitle>
                  <DialogDescription>
                    Enter the username of the user you want to block.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Input
                      placeholder="Username"
                      value={usernameToBlock}
                      onChange={(e) => setUsernameToBlock(handleRegNumberChange(e))}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleBlockUser();
                      }}
                    />
                  </div>
                  <Button onClick={handleBlockUser} disabled={blockLoading}>
                    {blockLoading ? "Blocking..." : "Block User"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent className="overflow-y-auto max-h-96">
          {statsLoading && (
            <p className="text-sm text-muted-foreground">Loading...</p>
          )}
          {!statsLoading && (!stats || stats.blockedUsers.length === 0) && (
            <p className="text-sm text-muted-foreground">No Blocked Users</p>
          )}
          <ul className="space-y-2">
            {stats?.blockedUsers.map((user, idx) => (
              <li
                key={idx}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm p-2 rounded-md border gap-2"
              >
                <div>
                  <span className="font-medium">{user.username}</span>
                  <p className="text-xs text-muted-foreground">
                    Blocked at {new Date(user.blockedAt).toLocaleString()} by{" "}
                    {user.blockedBy}
                  </p>
                </div>
                <Button
                  onClick={() => handleUnblock(user.username)}
                  size="sm"
                  variant="ghost"
                  className="text-green-600 hover:text-green-800 self-start sm:self-auto"
                >
                  <Unlock className="h-4 w-4 mr-1" /> Unblock
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}