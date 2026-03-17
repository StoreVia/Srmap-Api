"use client";
import "nprogress/nprogress.css";
import NProgress from "nprogress";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

NProgress.configure({
  showSpinner: false,
  speed: 500,
  trickleSpeed: 200,
  minimum: 0.08
});

export default function ProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleStart = () => {
      NProgress.set(0);
      NProgress.start();
    };
    const handleComplete = () => {
      NProgress.done();
    };
    handleStart();
    const timer = setTimeout(() => {
      handleComplete();
    }, 300);
    return () => {
      clearTimeout(timer);
      handleComplete();
    };
  }, [pathname, searchParams]);

  return null;
}