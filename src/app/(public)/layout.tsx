"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import SplashScreen from "@/components/client/loading/SplashScreen";
import { useLocalStorageContext } from "@/context/LocalStorageContext";

export default function App({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const { settings, ready } = useLocalStorageContext();
  const router = useRouter();

  useEffect(() => {
    if (isLoading || !ready) return;
    if (isAuthenticated) {
      router.push(`/${settings.startupPage}`);
    }
  }, [isLoading, isAuthenticated, ready, settings.startupPage]);

  if (isLoading || isAuthenticated) return <SplashScreen />;
  return <>{children}</>;
}