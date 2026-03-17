"use client";
import { toast } from "@/hooks/useToast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAdmin } from "@/context/AdminContext";
import { Skeleton } from "@/components/ui/skeleton";
import API from "@/components/client/api/AxiosClient";
import { useEffect, useState, useCallback } from "react";
import { Users, Calendar, SquarePen, Unlock, Plus } from "lucide-react";
import { handleRegNumberChange } from "@/fullStackUtils/utils/functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface AdminStats {
  success: boolean;
  settings: {
    feedbackEnabled: boolean;
  }
  counts: {
    today: number;
    total: number;
    todayRegistered: number;
    feedback: number;
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
  const [settingsLoading, setSettingsLoading] = useState(false);

  const fetchAdminStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const response = await API.get(`/admin/details`);
      const data = response.data;

      if (data.success) {
        setStats(prev => {
          if (!prev) return data;
          setFeedbackEnabled(data.settings.feedbackEnabled);
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
      setSettingsLoading(true);
      const res = await API.post("/admin/settings/feedback/toggle");
      if (res.data.success) setFeedbackEnabled(res.data.feedback);
    } catch {
      toast({ title: "Error", description: "Failed to update feedback setting", variant: "destructive" });
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleResetFeedback = async () => {
    try {
      setSettingsLoading(true);
      const res = await API.post("/admin/settings/feedback/reset");
      if (res.data.success) fetchAdminStats();
    } catch {
      toast({ title: "Error", description: "Failed to reset feedback count", variant: "destructive" });
    } finally {
      setSettingsLoading(false);
    }
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">App Settings</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Enable Feedback</p>
              <p className="text-xs text-muted-foreground">
                Allow users to submit feedback
              </p>
            </div>
            <Switch
              checked={feedbackEnabled}
              onCheckedChange={handleToggleFeedback}
              disabled={settingsLoading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Reset Feedback Count</p>
              <p className="text-xs text-muted-foreground">
                Clears total feedback submissions
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleResetFeedback}
              disabled={settingsLoading}
            >
              Reset
            </Button>
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