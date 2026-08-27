"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/utils/useMobile";
import { useLocalStorageContext } from "@/context/LocalStorageContext";
import { useToast } from "@/hooks/utils/useToast";
import { SidebarProvider } from "@/components/ui/sidebar";
import { MenuItem } from "./dashboard/types";
import { useDashboardNavigation } from "./dashboard/useDashboardNavigation";
import { CachedDataBanner } from "./dashboard/CachedDataBanner";
import { DashboardHeader } from "./dashboard/DashboardHeader";
import { NotificationPanel } from "./dashboard/NotificationPanel";
import { MobileToastBanner } from "./dashboard/MobileToastBanner";
import { DesktopSidebar } from "./dashboard/DesktopSidebar";
import { MobileNavigation } from "./dashboard/MobileNavigation";
import { MobileSubMenuDrawer } from "./dashboard/MobileSubMenuDrawer";
import { DashboardFooter } from "./dashboard/DashboardFooter";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardContent: React.FC<DashboardLayoutProps> = ({ children }) => {
  const router = useRouter();
  const isMobile = useIsMobile();
  const { settings } = useLocalStorageContext();
  const usesMobileSideNav = settings.mobileNavigationLayout === "sidebar";

  const { menuItems, pathname, isActive, isSubPathActive, currentTitle } =
    useDashboardNavigation();

  const { toasts } = useToast();
  const activeToast = toasts.find((t) => (t as any).open !== false);

  const [selectedMobileNav, setSelectedMobileNav] = useState<string | null>(null);
  const [mobileSubMenuDrawer, setMobileSubMenuDrawer] = useState<{
    isOpen: boolean;
    menuItem: MenuItem | null;
  }>({
    isOpen: false,
    menuItem: null,
  });

  useEffect(() => {
    setSelectedMobileNav(pathname);
  }, [pathname]);

  const openMobileSubMenu = (menuItem: MenuItem) => {
    setMobileSubMenuDrawer({ isOpen: true, menuItem });
  };

  const closeMobileSubMenu = () => {
    setMobileSubMenuDrawer({ isOpen: false, menuItem: null });
  };

  const handleMobileNavClick = (item: MenuItem) => {
    setSelectedMobileNav(item.path);
    if (item.subItems) {
      openMobileSubMenu(item);
    } else {
      router.push(item.path);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-background">
      <DesktopSidebar
        menuItems={menuItems}
        isMobile={isMobile}
        isActive={isActive}
        isSubPathActive={isSubPathActive}
        onOpenMobileSubMenu={openMobileSubMenu}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <CachedDataBanner />

        <div className="relative top-0 z-40 w-full bg-background border-b border-border shadow-sm">
          <motion.div
            animate={{ opacity: activeToast ? 0 : 1 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className={activeToast ? "pointer-events-none" : ""}
          >
            <DashboardHeader isMobile={isMobile} currentTitle={currentTitle} />
            <NotificationPanel
              isMobile={isMobile}
              usesMobileSideNav={usesMobileSideNav}
            />
          </motion.div>

          <MobileToastBanner />
        </div>

        <main className="flex-1 flex flex-col overflow-hidden">
          <div
            className={`flex-1 min-w-0 overflow-x-hidden overflow-y-auto p-4 sm:p-6 ${
              isMobile && usesMobileSideNav ? "pl-14" : ""
            }`}
          >
            {children}
          </div>
          <DashboardFooter isMobile={isMobile} />
        </main>

        {isMobile && (
          <>
            <MobileNavigation
              items={menuItems}
              selectedPath={selectedMobileNav}
              isSubPathActive={isSubPathActive}
              onNavClick={handleMobileNavClick}
            />
            <MobileSubMenuDrawer
              isOpen={mobileSubMenuDrawer.isOpen}
              onClose={closeMobileSubMenu}
              menuItem={mobileSubMenuDrawer.menuItem}
            />
          </>
        )}
      </div>
    </div>
  );
};

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <DashboardContent>{children}</DashboardContent>
    </SidebarProvider>
  );
};

export default DashboardLayout;