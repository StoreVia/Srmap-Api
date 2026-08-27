"use client";
import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";
import { useToast } from "@/hooks/utils/useToast";
import { useIsMobile } from "@/hooks/utils/useMobile";
import { Button } from "@/components/ui/button";

export function Toaster() {
  const { toasts, dismiss } = useToast();
  const isMobile = useIsMobile();
  const pathname = usePathname();

  const isProtectedDashboardPage =
    pathname !== "/" &&
    pathname !== "/login" &&
    pathname !== "/forgot" &&
    !pathname.startsWith("/privacy") &&
    !pathname.startsWith("/terms") &&
    !pathname.startsWith("/aboutus");

  const activeMobileToast = isMobile
    ? toasts.find((t) => (t as any).open !== false)
    : null;

  useEffect(() => {
    if (isMobile && activeMobileToast && activeMobileToast.id) {
      const timer = setTimeout(() => {
        dismiss(activeMobileToast.id);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isMobile, activeMobileToast?.id, activeMobileToast?.open, dismiss]);

  if (isProtectedDashboardPage) return null;

  if (isMobile) {
    if (!activeMobileToast) return null;

    return (
      <AnimatePresence>
        <motion.div
          key={`mobile-toast-${activeMobileToast.id}`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className={`fixed top-0 left-0 right-0 z-[9999] p-3 px-4 flex items-center justify-between border-b shadow-lg ${activeMobileToast.variant === "destructive"
              ? "bg-red-950 text-red-100 border-red-800"
              : activeMobileToast.variant === "success"
                ? "bg-emerald-950 text-emerald-100 border-emerald-800"
                : activeMobileToast.variant === "info"
                  ? "bg-blue-950 text-blue-100 border-blue-800"
                  : "bg-slate-900 text-white border-slate-700"
            }`}
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
            <div className="rounded-full p-1.5 bg-white/10 shrink-0">
              {activeMobileToast.variant === "destructive" ? (
                <AlertCircle className="h-4 w-4 text-red-400" />
              ) : activeMobileToast.variant === "success" ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              ) : (
                <Info className="h-4 w-4 text-blue-400" />
              )}
            </div>

            <div className="min-w-0 flex-1 py-0.5">
              {activeMobileToast.title && (
                <h4 className="font-semibold text-xs leading-snug whitespace-normal break-words">
                  {activeMobileToast.title}
                </h4>
              )}
              {activeMobileToast.description && (
                <p className="text-[11px] opacity-90 leading-tight whitespace-normal break-words mt-0.5">
                  {activeMobileToast.description}
                </p>
              )}
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => dismiss(activeMobileToast.id)}
            className="h-7 w-7 p-0 text-current hover:bg-white/20 shrink-0 rounded-full"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, ...props }) => (
        <Toast key={id} {...props}>
          <div className="grid gap-1">
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && <ToastDescription>{description}</ToastDescription>}
          </div>
          {action}
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}