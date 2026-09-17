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
import { MobileNavigation, MobileSidebarNav } from "./dashboard/MobileNavigation";
import { MobileSubMenuDrawer } from "./dashboard/MobileSubMenuDrawer";
import { DashboardFooter } from "./dashboard/DashboardFooter";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardContent: React.FC<DashboardLayoutProps> = ({ children }) => {
  const router = useRouter();
  const isMobile = useIsMobile();
  const { settings } = useLocalStorageContext();
  const navLayout = settings.mobileNavigationLayout || "single";
  const usesMobileSideNav = navLayout === "sidebar";
  const usesMiniMobileNav = navLayout === "mini";

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
    <div className="fixed inset-0 h-[100dvh] w-full flex bg-background overflow-hidden select-none sm:select-text">
      <DesktopSidebar
        menuItems={menuItems}
        isMobile={isMobile}
        isActive={isActive}
        isSubPathActive={isSubPathActive}
        onOpenMobileSubMenu={openMobileSubMenu}
      />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        {/* Pinned Sticky Top Header Stack - NEVER scrolls off-screen */}
        <div className="sticky top-0 z-30 w-full shrink-0 bg-background/95 backdrop-blur-md border-b border-border/60 shadow-xs">
          <CachedDataBanner />

          <motion.div
            animate={{ opacity: activeToast ? 0 : 1 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className={activeToast ? "pointer-events-none" : ""}
          >
            <DashboardHeader isMobile={isMobile} currentTitle={currentTitle} />
            <NotificationPanel />
          </motion.div>

          <MobileToastBanner />
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 flex min-w-0 h-full overflow-hidden relative">
          {isMobile && usesMobileSideNav && (
            <aside className="w-12 shrink-0 border-r border-border/60 bg-background/95 h-full z-20 overflow-y-auto no-scrollbar">
              <MobileSidebarNav
                items={menuItems}
                selectedPath={selectedMobileNav}
                isSubPathActive={isSubPathActive}
                onClick={handleMobileNavClick}
              />
            </aside>
          )}

          <main
            id="main-scroll-container"
            className="flex-1 flex flex-col min-w-0 overflow-x-hidden overflow-y-auto overscroll-y-contain"
          >
            <div className="flex-1 min-w-0 p-3 sm:p-6">
              {children}
            </div>
            <DashboardFooter isMobile={isMobile} />

            {/* Spacer strictly below footer when mobile bottom bar is active */}
            {isMobile && !usesMobileSideNav && !usesMiniMobileNav && (
              <div
                className={`shrink-0 w-full ${
                  navLayout === "double"
                    ? "h-[calc(5rem+max(0.5rem,env(safe-area-inset-bottom,8px)))]"
                    : "h-[calc(3.75rem+max(0.5rem,env(safe-area-inset-bottom,8px)))]"
                }`}
                aria-hidden="true"
              />
            )}
          </main>
        </div>

        {/* Mobile Navigation (Bottom Nav or Mini Side Nav) */}
        {isMobile && !usesMobileSideNav && (
          <MobileNavigation
            items={menuItems}
            selectedPath={selectedMobileNav}
            isSubPathActive={isSubPathActive}
            onNavClick={handleMobileNavClick}
          />
        )}

        {/* Submenu Drawer for items with nested pages */}
        {isMobile && (
          <MobileSubMenuDrawer
            isOpen={mobileSubMenuDrawer.isOpen}
            onClose={closeMobileSubMenu}
            menuItem={mobileSubMenuDrawer.menuItem}
          />
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