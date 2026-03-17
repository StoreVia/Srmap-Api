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
    sidebarTutorialDone: false
  },
  profile: {
    accessToken: "",
    sessionId: "",
    sessionTime: ""
  },
} as {
    [K in "settings" | "profile"]: Record<string, any>;
  };

export type StorageType = keyof typeof DEFAULT_STORAGE;
export type StorageData = typeof DEFAULT_STORAGE;

export default function useLocalStorage<T extends StorageType>(key: T) {
  const [data, setData] = useState<StorageData[T]>(DEFAULT_STORAGE[key]);
  const mountedRef = useRef(false);
  const writeTimeout = useRef<number | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        setData(prev => ({ ...DEFAULT_STORAGE[key], ...prev, ...parsed }));
      } else {
        persistData(DEFAULT_STORAGE[key]);
      }
    } catch (e) {
      persistData(DEFAULT_STORAGE[key]);
    }
    mountedRef.current = true;
    return () => {
      if (writeTimeout.current) window.clearTimeout(writeTimeout.current);
    };
  }, [key]);

  const persistData = useCallback((newData: StorageData[T]) => {
    try {
      localStorage.setItem(key, JSON.stringify(newData));
    } catch (e) { }
  }, [key]);

  const set = useCallback((newData: StorageData[T]) => {
    setData(newData);
    if (mountedRef.current) persistData(newData);
  }, [persistData]);

  const update = useCallback((patch: Partial<StorageData[T]> | ((current: StorageData[T]) => StorageData[T])) => {
    setData((prev) => {
      const next = typeof patch === "function" ? patch(prev) : { ...prev, ...patch };
      if (mountedRef.current) persistData(next);
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
        if (mountedRef.current) persistData(next);
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