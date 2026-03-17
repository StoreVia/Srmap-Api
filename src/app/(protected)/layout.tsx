"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useStudentData } from "@/context/StudentContext";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import FetchClient from "@/components/client/loading/FetchLoading";
import SplashScreen from "@/components/client/loading/SplashScreen";

export default function ProtectedDashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const { initialized } = useStudentData();
  const router = useRouter();
  const pathname = usePathname();

  const [checked, setChecked] = useState(false);
  const publicRoutes = ["/", "/privacy", "/terms", "/aboutus"];
  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    if (isLoading) return;

    if (isPublicRoute && !isAuthenticated) {
      setChecked(true);
      return;
    }

    if (!isAuthenticated && !isPublicRoute) {
      router.push("/login");
    } else if (isAuthenticated) {
      setChecked(true);
    }
  }, [isAuthenticated, initialized, isLoading, isPublicRoute]);

  if (!checked || isLoading) return <SplashScreen />;
  if (isAuthenticated && !initialized) return <FetchClient />;
  if (isPublicRoute && !isAuthenticated) return <>{children}</>;
  
  return <DashboardLayout>{children}</DashboardLayout>;
}