"use client";
import { useAuthActions } from "@/hooks/useAuthActions";
import { useLocalStorageContext } from "@/context/LocalStorageContext";
import React, { createContext, useContext, useEffect } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  isLoginLoading: boolean;
  login: (username: string, password: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, ready } = useLocalStorageContext();
  const { login, logout, checkAuthStatus, isLoading, isLoginLoading, isAuthenticated, isAdmin } = useAuthActions();

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
        login,
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