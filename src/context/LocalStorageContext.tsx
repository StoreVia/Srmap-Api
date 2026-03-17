"use client";
import { Themes } from "@/context/ThemeContext";
import React, { createContext, useContext, useEffect, useState } from 'react';
import useLocalStorage, { DEFAULT_STORAGE, StorageType, StorageData } from '@/hooks/useLocalStorage';

type LocalStorageContextValue = {
  settings: StorageData['settings'];
  setSettings: (data: StorageData['settings']) => void;
  updateSettings: (patch: Partial<StorageData['settings']> | ((s: StorageData['settings']) => StorageData['settings'])) => void;
  removeSettings: (fields?: (keyof StorageData['settings'])[]) => void;
  resetSettings: () => void;

  profile: StorageData['profile'];
  setProfile: (data: StorageData['profile']) => void;
  updateProfile: (patch: Partial<StorageData['profile']> | ((p: StorageData['profile']) => StorageData['profile'])) => void;
  removeProfile: (fields?: (keyof StorageData['profile'])[]) => void;
  resetProfile: () => void;

  useStorage: <T extends StorageType>(key: T) => ReturnType<typeof useLocalStorage<T>>;
  cycleTheme: () => void;
  ready: boolean;
};

const LocalStorageContext = createContext<LocalStorageContextValue | undefined>(undefined);

export const LocalStorageProvider: React.FC<React.PropsWithChildren<unknown>> = ({ children }) => {
  const settingsStorage = useLocalStorage('settings');
  const profileStorage = useLocalStorage('profile');
  const [ready, setReady] = useState(false);

  const cycleTheme = () => {
    const themes = Themes;
    const current = settingsStorage.data.theme;
    const currentIndex = themes.indexOf(current as (typeof themes)[number]);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    settingsStorage.update({ theme: nextTheme });
  };

  useEffect(() => {
    const timeout = setTimeout(() => setReady(true), 0);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const { theme } = settingsStorage.data;
    const classList = document.documentElement.classList;
    const themeClasses = ["light", "dark"];
    themeClasses.forEach((c) => classList.remove(c));
    classList.add(theme);
  }, [settingsStorage.data.theme]);

  const value: LocalStorageContextValue = {
    settings: { ...DEFAULT_STORAGE.settings, ...settingsStorage.data },
    setSettings: settingsStorage.set,
    updateSettings: settingsStorage.update,
    removeSettings: settingsStorage.remove,
    resetSettings: settingsStorage.reset,

    profile: { ...DEFAULT_STORAGE.profile, ...profileStorage.data },
    setProfile: profileStorage.set,
    updateProfile: profileStorage.update,
    removeProfile: profileStorage.remove,
    resetProfile: profileStorage.reset,

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