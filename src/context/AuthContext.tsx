"use client";
import { useAuthActions } from "@/hooks/context/useAuthActions";
import { useLocalStorageContext } from "@/context/LocalStorageContext";
import React, { createContext, useContext, useEffect } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  isLoginLoading: boolean;
  accounts: Array<{ id: string; username: string }>;
  activeAccountId: string;
  login: (username: string, password: string, wantCachedData?: boolean) => Promise<{ success: boolean; error?: string | null; hasCachedData?: boolean; accessToken?: string; sessionId?: string; sessionTime?: string; } | void>;
  switchAccount: (accountId: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, ready } = useLocalStorageContext();
  const { login, logout, switchAccount, checkAuthStatus, isLoading, isLoginLoading, isAuthenticated, isAdmin } = useAuthActions();

  useEffect(() => {
    if(ready) checkAuthStatus();
  }, [profile.accessToken, ready]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isAdmin,
        isLoading,
        isLoginLoading,
        accounts: (profile.accounts || []).map((a: any) => ({ id: a.id, username: a.username })),
        activeAccountId: profile.activeAccountId || "",
        login,
        switchAccount,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};