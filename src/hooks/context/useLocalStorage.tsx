"use client";
import type { Theme } from "@/context/ThemeContext";
import { useCallback, useEffect, useRef, useState } from "react";

export const DEFAULT_STORAGE = {
  settings: {
    theme: "dark" as Theme,
    showSidebar: true,
    timeTableViewMode: "old",
    attendanceSortOption: "default",
    feedbackExplanationSeen: false,
    sidebarTutorialDone: false,
    mobileNavigationLayout: "single" as "single" | "double" | "mini" | "sidebar",
    startupPage: "dashboard" as "dashboard" | "timetable" | "dashboard",
  },
  profile: {
    activeAccountId: "",
    accounts: [] as Array<{
      id: string;
      username: string;
      accessToken: string;
      sessionId: string;
      sessionTime: string;
      hasCachedData?: boolean;
      data?: any;
    }>,
    accessToken: "",
    sessionId: "",
    sessionTime: "",
    hasCachedData: false,
    username: "",
    data: undefined as any,
  },
} as {
    [K in "settings" | "profile"]: Record<string, any>;
  };

export type StorageType = keyof typeof DEFAULT_STORAGE;
export type StorageData = typeof DEFAULT_STORAGE;

export default function useLocalStorage<T extends StorageType>(key: T) {
  const [data, setData] = useState<StorageData[T]>(DEFAULT_STORAGE[key]);

  const persistData = useCallback((newData: StorageData[T]) => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(key, JSON.stringify(newData));
      }
    } catch (e) { }
  }, [key]);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(key) : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        setData(prev => ({ ...DEFAULT_STORAGE[key], ...prev, ...parsed }));
      } else {
        persistData(DEFAULT_STORAGE[key]);
      }
    } catch (e) {
      persistData(DEFAULT_STORAGE[key]);
    }
  }, [key, persistData]);

  const set = useCallback((newData: StorageData[T]) => {
    setData(newData);
    persistData(newData);
  }, [persistData]);

  const update = useCallback((patch: Partial<StorageData[T]> | ((current: StorageData[T]) => StorageData[T])) => {
    setData((prev) => {
      const next = typeof patch === "function" ? patch(prev) : { ...prev, ...patch };
      persistData(next);
      return next;
    });
  }, [persistData]);

  const remove = useCallback((fields?: (keyof StorageData[T])[]) => {
    if (!fields || fields.length === 0) {
      setData(DEFAULT_STORAGE[key]);
      if (typeof window !== "undefined") {
        localStorage.removeItem(key);
      }
    } else {
      setData((prev) => {
        const next = { ...prev };
        fields.forEach(field => {
          delete next[field];
        });
        persistData(next);
        return next;
      });
    }
  }, [key, persistData]);

  const reset = useCallback(() => {
    setData(DEFAULT_STORAGE[key]);
    if (typeof window !== "undefined") {
      localStorage.removeItem(key);
    }
  }, [key]);

  return { data, set, update, remove, reset };
}