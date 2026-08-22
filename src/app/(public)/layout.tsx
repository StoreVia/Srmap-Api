"use client";
import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import SplashScreen from "@/components/client/loading/SplashScreen";
import { useLocalStorageContext } from "@/context/LocalStorageContext";

function PublicLayoutContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const { settings, ready } = useLocalStorageContext();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (isLoading || !ready) return;
    if (isAuthenticated) {
      const redirectParam = searchParams.get("redirect") || searchParams.get("callbackUrl");
      if (redirectParam && redirectParam.startsWith("/") && !redirectParam.startsWith("//")) {
        router.push(redirectParam);
      } else {
        router.push(`/${settings.startupPage}`);
      }
    }
  }, [isLoading, isAuthenticated, ready, settings.startupPage, searchParams, router]);

  if (isLoading || isAuthenticated) return <SplashScreen />;
  return <>{children}</>;
}

export default function App({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<SplashScreen />}>
      <PublicLayoutContent>{children}</PublicLayoutContent>
    </Suspense>
  );
}