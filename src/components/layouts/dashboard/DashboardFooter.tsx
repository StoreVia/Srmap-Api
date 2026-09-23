"use client";
import React from "react";
import Link from "next/link";

interface DashboardFooterProps {
  isMobile?: boolean;
}

export const DashboardFooter: React.FC<DashboardFooterProps> = ({ isMobile }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="shrink-0 w-full border-t border-border/40 bg-background/60 backdrop-blur-xs py-3 px-3 sm:px-6 mt-auto select-none">
      <div className={`w-full flex ${isMobile ? "flex-col items-center text-center gap-1.5" : "flex-row items-center justify-between"} text-xs text-muted-foreground`}>
        <div className={`flex items-center gap-2 ${isMobile ? "flex-wrap justify-center" : ""}`}>
          <span className="font-medium">© {currentYear} Srmapi Portal</span>
          <span className="text-border">•</span>
          <div className="flex items-center gap-2">
            <Link
              href="/privacy"
              className="hover:text-foreground hover:underline transition-colors"
            >
              Privacy Policy
            </Link>
            <span className="text-border">•</span>
            <Link
              href="/terms"
              className="hover:text-foreground hover:underline transition-colors"
            >
              Terms & Conditions
            </Link>
          </div>
        </div>

        <p className="text-[11px] sm:text-xs text-muted-foreground/80">
          Version 5.8.5 • Last updated: 23-Sep-2026
        </p>
      </div>
    </footer>
  );
};