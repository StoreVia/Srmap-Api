"use client";
import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/utils/useToast";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

interface MobileToastBannerProps {
  isMobile: boolean;
}

export const MobileToastBanner: React.FC<MobileToastBannerProps> = ({ isMobile }) => {
  const { toasts, dismiss } = useToast();
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

  if (!isMobile || !activeMobileToast) return null;

  return (
    <AnimatePresence>
      <motion.div
        key={`mobile-toast-${activeMobileToast.id}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className={`absolute inset-0 z-40 p-3 px-4 flex items-center justify-between border-b shadow-md ${
          activeMobileToast.variant === "destructive"
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
};