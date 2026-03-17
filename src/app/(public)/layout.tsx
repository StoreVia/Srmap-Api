"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import SplashScreen from "@/components/client/loading/SplashScreen";

export default function App({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated) {
      router.push("/attendance");
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading || isAuthenticated) return <SplashScreen />;

  return <>{children}</>;
}