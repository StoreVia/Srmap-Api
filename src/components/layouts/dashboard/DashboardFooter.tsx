"use client";
import React from "react";
import { useLocalStorageContext } from "@/context/LocalStorageContext";

interface DashboardFooterProps {
  isMobile: boolean;
}

export const DashboardFooter: React.FC<DashboardFooterProps> = ({ isMobile }) => {
  const { settings } = useLocalStorageContext();
  const usesMiniMobileNav = settings.mobileNavigationLayout === "mini";
  const usesSidebarMobileNav = settings.mobileNavigationLayout === "sidebar";

  return (
    <footer
      className={`flex-shrink-0 p-6 pt-4 border-t border-border bg-background/80 backdrop-blur-sm ${
        isMobile && !usesMiniMobileNav && !usesSidebarMobileNav ? "pb-28" : ""
      }`}
    >
      <div className={`pt-4 ${isMobile ? "text-center -mt-4" : "flex items-center justify-between"}`}>
        <p className={`text-sm text-muted-foreground ${isMobile ? "mb-2" : ""}`}>
          {new Date().getFullYear()} Srmapi Portal.
        </p>

        {isMobile && (
          <div className="flex space-x-1 justify-center text-xs text-muted-foreground">
            <a href="/privacy" className="hover:underline">
              Privacy Policy,
            </a>
            <a href="/terms" className="hover:underline">
              Terms and conditions
            </a>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Version 5.7.3 • Last updated: 30-Aug-2026
        </p>
      </div>
    </footer>
  );
};