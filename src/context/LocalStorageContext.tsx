"use client";
import API from "@/lib/api/axiosClient";
import { Themes } from "@/context/ThemeContext";
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import useLocalStorage, { DEFAULT_STORAGE, StorageType, StorageData } from '@/hooks/context/useLocalStorage';

export type StoredAccount = StorageData["profile"]["accounts"][number];

export const ALLOWED_SYNC_KEYS = [
  "theme",
  "showSidebar",
  "timeTableViewMode",
  "attendanceSortOption",
  "sidebarTutorialDone",
  "mobileNavigationLayout",
  "startupPage",
] as const;

export type SyncedSettingsKey = typeof ALLOWED_SYNC_KEYS[number];

type LocalStorageContextValue = {
  settings: StorageData['settings'];
  setSettings: (data: StorageData['settings']) => void;
  updateSettings: (patch: Partial<StorageData['settings']> | ((s: StorageData['settings']) => StorageData['settings'])) => void;
  removeSettings: (fields?: (keyof StorageData['settings'])[]) => void;
  resetSettings: () => void;
  
  notifications: any[];
  fetchSyncData: () => Promise<void>;

  profile: StorageData['profile'];
  setProfile: (data: StorageData['profile']) => void;
  updateProfile: (patch: Partial<StorageData['profile']> | ((p: StorageData['profile']) => StorageData['profile'])) => void;
  removeProfile: (fields?: (keyof StorageData['profile'])[]) => void;
  resetProfile: () => void;
  getActiveAccount: () => StoredAccount | null;
  updateActiveAccount: (patch: Partial<StoredAccount> | ((a: StoredAccount) => StoredAccount)) => void;
  setActiveAccount: (accountId: string) => void;
  upsertAccount: (account: StoredAccount, activate?: boolean) => { ok: boolean; message?: string; accountId?: string };
  removeAccount: (accountId: string) => void;

  useStorage: <T extends StorageType>(key: T) => ReturnType<typeof useLocalStorage<T>>;
  cycleTheme: () => void;
  ready: boolean;
};

const LocalStorageContext = createContext<LocalStorageContextValue | undefined>(undefined);

export const LocalStorageProvider: React.FC<React.PropsWithChildren<unknown>> = ({ children }) => {
  const settingsStorage = useLocalStorage('settings');
  const profileStorage = useLocalStorage('profile');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [ready, setReady] = useState(false);
  const initialSyncDoneRef = useRef(false);
  const prevActiveAccountIdRef = useRef<string | null>(null);

  const profile = { ...DEFAULT_STORAGE.profile, ...profileStorage.data };
  const normalizedAccounts = Array.isArray(profile.accounts) ? profile.accounts : [];
  const activeAccount = normalizedAccounts.find((a) => a.id === profile.activeAccountId) || null;

  const fetchSyncData = useCallback(async () => {
    try {
      const response = await API.get("/sync");
      if (response.data?.success) {
        if (Array.isArray(response.data.notifications)) {
          setNotifications(response.data.notifications);
        }
        const dbSettings = response.data.settings;
        if (dbSettings && typeof dbSettings === "object") {
          const updatesNeeded: Partial<StorageData['settings']> = {};
          let hasChanges = false;

          ALLOWED_SYNC_KEYS.forEach((k) => {
            if (k in dbSettings && dbSettings[k] !== undefined) {
              updatesNeeded[k] = dbSettings[k];
              hasChanges = true;
            }
          });

          if (hasChanges) {
            settingsStorage.update((prev) => {
              const next = { ...prev, ...updatesNeeded };
              try {
                if (typeof window !== "undefined") {
                  localStorage.setItem("settings", JSON.stringify(next));
                }
              } catch {}
              return next;
            });

            if (dbSettings.theme) {
              const classList = document.documentElement.classList;
              classList.remove("light", "dark");
              classList.add(dbSettings.theme);
            }
          }
        }
      }
    } catch {
    } finally {
      setReady(true);
    }
  }, [settingsStorage]);

  useEffect(() => {
    if (!initialSyncDoneRef.current) {
      initialSyncDoneRef.current = true;
      fetchSyncData();
    }
  }, [fetchSyncData]);

  useEffect(() => {
    if (profile.activeAccountId) {
      if (
        prevActiveAccountIdRef.current !== null &&
        prevActiveAccountIdRef.current !== profile.activeAccountId
      ) {
        fetchSyncData();
      }
      prevActiveAccountIdRef.current = profile.activeAccountId;
    }
  }, [profile.activeAccountId, fetchSyncData]);

  const updateSettings = useCallback(
    (patch: Partial<StorageData['settings']> | ((s: StorageData['settings']) => StorageData['settings'])) => {
      settingsStorage.update((prev) => {
        const next = typeof patch === "function" ? patch(prev) : { ...prev, ...patch };
        const patchObj = typeof patch === "function" ? next : patch;

        if (next.theme) {
          const classList = document.documentElement.classList;
          classList.remove("light", "dark");
          classList.add(next.theme);
        }

        const syncPayload: Record<string, any> = {};
        let hasSyncedKey = false;
        ALLOWED_SYNC_KEYS.forEach((k) => {
          if (k in patchObj && patchObj[k] !== undefined) {
            syncPayload[k] = patchObj[k];
            hasSyncedKey = true;
          }
        });

        if (hasSyncedKey) {
          API.post("/sync", { settings: syncPayload }).then((res) => {
            if (res.data?.success && Array.isArray(res.data.notifications)) {
              setNotifications(res.data.notifications);
            }
          }).catch(() => {});
        }

        return next;
      });
    },
    [settingsStorage]
  );

  const cycleTheme = () => {
    const themes = Themes;
    const current = settingsStorage.data.theme;
    const currentIndex = themes.indexOf(current as (typeof themes)[number]);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    updateSettings({ theme: nextTheme });
  };

  useEffect(() => {
    const { theme } = settingsStorage.data;
    if (theme) {
      const classList = document.documentElement.classList;
      classList.remove("light", "dark");
      classList.add(theme);
    }
  }, [settingsStorage.data.theme]);

  useEffect(() => {
    const hasAccounts = normalizedAccounts.length > 0;
    const hasLegacy = Boolean(profile.accessToken);
    const needsMigration = hasLegacy && !hasAccounts;
    const activeMissing = hasAccounts && !activeAccount;
    if (!needsMigration && !activeMissing) return;

    profileStorage.update((prev) => {
      const prevAccounts = Array.isArray(prev.accounts) ? prev.accounts : [];
      if (prevAccounts.length === 0 && prev.accessToken) {
        const inferredUsername = prev.username || "account";
        const migrated: StoredAccount = {
          id: inferredUsername.toUpperCase(),
          username: inferredUsername.toUpperCase(),
          accessToken: prev.accessToken || "",
          sessionId: prev.sessionId || "",
          sessionTime: prev.sessionTime || "",
          data: prev.data,
        };
        return {
          ...prev,
          accounts: [migrated],
          activeAccountId: migrated.id,
          username: migrated.username,
          accessToken: migrated.accessToken,
          sessionId: migrated.sessionId,
          sessionTime: migrated.sessionTime,
          hasCachedData: migrated.hasCachedData || false,
          data: migrated.data,
        };
      }

      if (prevAccounts.length > 0 && !prevAccounts.some((a) => a.id === prev.activeAccountId)) {
        const fallback = prevAccounts[0];
        return {
          ...prev,
          activeAccountId: fallback.id,
          username: fallback.username,
          accessToken: fallback.accessToken,
          sessionId: fallback.sessionId,
          sessionTime: fallback.sessionTime,
          hasCachedData: fallback.hasCachedData || false,
          data: fallback.data,
        };
      }

      return prev;
    });
  }, [normalizedAccounts.length, activeAccount?.id, profile.accessToken, profile.username]);

  const getActiveAccount = () => activeAccount;

  const updateActiveAccount: LocalStorageContextValue["updateActiveAccount"] = (patch) => {
    if (!activeAccount) return;
    profileStorage.update((prev) => {
      const accounts = Array.isArray(prev.accounts) ? prev.accounts : [];
      const idx = accounts.findIndex((a) => a.id === prev.activeAccountId);
      if (idx < 0) return prev;
      const current = accounts[idx];
      const next = typeof patch === "function" ? patch(current) : { ...current, ...patch };
      const nextAccounts = [...accounts];
      nextAccounts[idx] = next;
      return {
        ...prev,
        accounts: nextAccounts,
        username: next.username,
        accessToken: next.accessToken,
        sessionId: next.sessionId,
        sessionTime: next.sessionTime,
        hasCachedData: next.hasCachedData || false,
        data: next.data,
      };
    });
  };

  const setActiveAccount: LocalStorageContextValue["setActiveAccount"] = (accountId) => {
    profileStorage.update((prev) => {
      const accounts = Array.isArray(prev.accounts) ? prev.accounts : [];
      const next = accounts.find((a) => a.id === accountId);
      if (!next) return prev;
      return {
        ...prev,
        activeAccountId: next.id,
        username: next.username,
        accessToken: next.accessToken,
        sessionId: next.sessionId,
        sessionTime: next.sessionTime,
        hasCachedData: next.hasCachedData || false,
        data: next.data,
      };
    });
    setTimeout(() => {
      fetchSyncData();
    }, 50);
  };

  const upsertAccount: LocalStorageContextValue["upsertAccount"] = (account, activate = true) => {
    let result: { ok: boolean; message?: string; accountId?: string } = { ok: true, accountId: account.id };
    profileStorage.update((prev) => {
      const accounts = Array.isArray(prev.accounts) ? prev.accounts : [];
      const index = accounts.findIndex((a) => a.id === account.id);
      const alreadyExists = index >= 0;
      if (!alreadyExists && accounts.length >= 5) {
        result = { ok: false, message: "You can only add up to 5 accounts." };
        return prev;
      }

      const nextAccounts = [...accounts];
      if (alreadyExists) {
        nextAccounts[index] = { ...nextAccounts[index], ...account };
      } else {
        nextAccounts.push(account);
      }

      const shouldActivate = activate || !prev.activeAccountId;
      const nextActiveId = shouldActivate ? account.id : prev.activeAccountId;
      const nextActive = nextAccounts.find((a) => a.id === nextActiveId) || nextAccounts[0];
      return {
        ...prev,
        accounts: nextAccounts,
        activeAccountId: nextActive.id,
        username: nextActive.username,
        accessToken: nextActive.accessToken,
        sessionId: nextActive.sessionId,
        sessionTime: nextActive.sessionTime,
        hasCachedData: nextActive.hasCachedData || false,
        data: nextActive.data,
      };
    });
    setTimeout(() => {
      fetchSyncData();
    }, 50);
    return result;
  };

  const removeAccount: LocalStorageContextValue["removeAccount"] = (accountId) => {
    profileStorage.update((prev) => {
      const accounts = Array.isArray(prev.accounts) ? prev.accounts : [];
      const nextAccounts = accounts.filter((a) => a.id !== accountId);
      if (nextAccounts.length === 0) {
        return { ...DEFAULT_STORAGE.profile };
      }
      const nextActive = nextAccounts.find((a) => a.id === prev.activeAccountId) || nextAccounts[0];
      return {
        ...prev,
        accounts: nextAccounts,
        activeAccountId: nextActive.id,
        username: nextActive.username,
        accessToken: nextActive.accessToken,
        sessionId: nextActive.sessionId,
        sessionTime: nextActive.sessionTime,
        hasCachedData: nextActive.hasCachedData || false,
        data: nextActive.data,
      };
    });
    setTimeout(() => {
      fetchSyncData();
    }, 50);
  };

  const value: LocalStorageContextValue = {
    settings: { ...DEFAULT_STORAGE.settings, ...settingsStorage.data },
    setSettings: settingsStorage.set,
    updateSettings,
    removeSettings: settingsStorage.remove,
    resetSettings: settingsStorage.reset,

    notifications,
    fetchSyncData,

    profile,
    setProfile: profileStorage.set,
    updateProfile: profileStorage.update,
    removeProfile: profileStorage.remove,
    resetProfile: profileStorage.reset,
    getActiveAccount,
    updateActiveAccount,
    setActiveAccount,
    upsertAccount,
    removeAccount,

    useStorage: useLocalStorage,
    cycleTheme,
    ready
  };

  return (
    <LocalStorageContext.Provider value={value}>
      {children}
    </LocalStorageContext.Provider>
  );
};

export function useLocalStorageContext() {
  const context = useContext(LocalStorageContext);
  if (!context) throw new Error('LocalStorageContext must be used within LocalStorageProvider');
  return context;
}