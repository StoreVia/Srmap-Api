"use client";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useIsMobile } from "@/hooks/utils/useMobile";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";
import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useStudentData } from "@/context/StudentContext";
import { toast, useToast } from "@/hooks/utils/useToast";
import { useNotifications } from "@/hooks/utils/useNotification";
import { whatsapp } from "@/shared/utils/functions";
import Logo_White from "../../../public/icons/round_corner_logo.png";
import { useLocalStorageContext } from "@/context/LocalStorageContext";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpenText, Lock, ChevronDown, Library, Folder, MessageSquare, ChevronRight, MessageCircle, ChevronUp, Sun, Moon, LogOut, RotateCcw, Home, List, AppWindow, Calendar, Calculator, User, Users, Settings, ListChecks, CalendarDays, Shield, Edit, X, FileSpreadsheet, Building, MoreVertical, Check, Loader2, Clapperboard, CheckCircle2, AlertCircle, Info } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface MenuItem {
  title: string;
  shortTitle?: string;
  path: string;
  group?: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
  opensResourceChooser?: boolean;
  subItems?: Array<{
    title: string;
    path: string;
  }>;
}

const GitHubMark: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.486 2 12.02c0 4.428 2.865 8.184 6.839 9.51.5.093.682-.217.682-.483 0-.237-.009-.868-.014-1.704-2.782.605-3.369-1.342-3.369-1.342-.455-1.158-1.11-1.467-1.11-1.467-.908-.62.069-.608.069-.608 1.004.071 1.532 1.032 1.532 1.032.892 1.531 2.341 1.089 2.91.833.091-.647.349-1.089.635-1.34-2.22-.253-4.555-1.112-4.555-4.946 0-1.092.39-1.985 1.029-2.685-.103-.253-.446-1.27.098-2.647 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844a9.59 9.59 0 012.504.337c1.909-1.296 2.748-1.026 2.748-1.026.546 1.377.203 2.394.1 2.647.64.7 1.028 1.593 1.028 2.685 0 3.843-2.339 4.69-4.566 4.938.359.31.678.921.678 1.855 0 1.34-.012 2.421-.012 2.75 0 .269.18.581.688.482A10.02 10.02 0 0022 12.02C22 6.486 17.523 2 12 2Z" clipRule="evenodd" />
  </svg>
);

interface HoverMenuProps {
  item: MenuItem;
  isVisible: boolean;
  mouseY: number;
}

interface MobileSubMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  menuItem: MenuItem | null;
}

const MobileSubMenuDrawer: React.FC<MobileSubMenuDrawerProps> = ({ isOpen, onClose, menuItem }) => {
  const router = useRouter();
  const pathname = usePathname();

  const handleSubItemClick = (path: string) => {
    router.push(path);
    onClose();
  };

  const isActive = (path: string) => pathname === path;

  if (!menuItem) return null;

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[80vh]">
        <DrawerHeader className="border-b">
          <div className="flex items-center justify-between">
            <DrawerTitle className="flex items-center gap-2">
              <menuItem.icon className="h-5 w-5" />
              {menuItem.title}
            </DrawerTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DrawerHeader>

        <div className="p-4">
          {menuItem.subItems ? (
            <div className="space-y-2">
              {menuItem.subItems.map((subItem) => (
                <button
                  key={subItem.path}
                  onClick={() => handleSubItemClick(subItem.path)}
                  className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${isActive(subItem.path)
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-accent hover:bg-accent/80"
                    }`}
                >
                  <div className="font-medium">{subItem.title}</div>
                  {isActive(subItem.path) && (
                    <div className="text-xs opacity-90 mt-1">Current page</div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <button
              onClick={() => handleSubItemClick(menuItem.path)}
              className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${isActive(menuItem.path)
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-accent hover:bg-accent/80"
                }`}
            >
              <div className="font-medium">Open {menuItem.title}</div>
              {isActive(menuItem.path) && (
                <div className="text-xs opacity-90 mt-1">Current page</div>
              )}
            </button>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

function ResourceChooserDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();

  const navigate = (path: string) => {
    onClose();
    router.push(path);
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[80vh]">
        <DrawerHeader className="border-b">
          <DrawerTitle>Explore Srmapi</DrawerTitle>
        </DrawerHeader>
        <div className="grid gap-3 p-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => navigate("/aboutus")}
            className="flex items-center gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-accent"
          >
            <Users className="h-5 w-5 text-primary" />
            <span className="font-medium">About Us</span>
          </button>
          <button
            type="button"
            onClick={() => navigate("/github")}
            className="flex items-center gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-accent"
          >
            <GitHubMark className="h-5 w-5 text-primary" />
            <span className="font-medium">GitHub</span>
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

const DashboardContent: React.FC<DashboardLayoutProps> = ({ children }) => {
  const routeRegex = /\/[a-zA-Z0-9\/-]+/g;
  const mdLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const REFRESH_INTERVAL = 30 * 1000;
  const MOBILE_NAV_SCROLL_KEY = "mobileNavScrollLeft";
  const { logout, isAdmin, accounts, activeAccountId, switchAccount } = useAuth();
  const { profile, fetchFreshData, initiateSession } = useStudentData();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const { state } = useSidebar();
  const { settings, updateSettings, profile: lProfile } = useLocalStorageContext();
  const usesDoubleRowMobileNav = settings.mobileNavigationLayout === "double";
  const usesMiniMobileNav = settings.mobileNavigationLayout === "mini";
  const usesSidebarMobileNav = settings.mobileNavigationLayout === "sidebar";
  const usesMobileSideNav = usesSidebarMobileNav;

  const notifications = useNotifications();
  const { toasts, dismiss } = useToast();
  const activeMobileToast = isMobile ? toasts.find((t) => (t as any).open !== false) : null;

  useEffect(() => {
    if (isMobile && activeMobileToast && activeMobileToast.id) {
      const timer = setTimeout(() => {
        dismiss(activeMobileToast.id);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isMobile, activeMobileToast?.id, activeMobileToast?.open, dismiss]);

  const isCollapsed = state === "collapsed";
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isFetchingNewData, setIsFetchingNewData] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [showTutorial, setShowTutorial] = useState(false);
  const lastRefreshRef = React.useRef<number>(0);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem("expandedMenus");
      return stored ? JSON.parse(stored) : {};
    }
    return {};
  });
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [selectedMobileNav, setSelectedMobileNav] = useState<string | null>(null);
  const [mobileSubMenuDrawer, setMobileSubMenuDrawer] = useState<{
    isOpen: boolean;
    menuItem: MenuItem | null;
  }>({
    isOpen: false,
    menuItem: null
  });
  const [resourceChooserOpen, setResourceChooserOpen] = useState(false);
  const mobileNavScrollRef = React.useRef<HTMLDivElement | null>(null);
  const notificationPanelRef = React.useRef<HTMLDivElement | null>(null);

  const isActive = (path: string) => pathname === path;
  const isSubPathActive = (basePath: string) => {
    if (pathname === basePath) return true;
    if (basePath === "/admin" || basePath === "/dashboard") {
      return pathname === basePath;
    }
    return pathname.startsWith(basePath + "/");
  };

  const handleRefresh = () => fetchFreshData();
  const handleHomeNavigation = () => router.push("/dashboard");
  const handleAccountSwitch = (accountId: string) => {
    switchAccount(accountId);
  };

  const openMobileSubMenu = (menuItem: MenuItem) => {
    setMobileSubMenuDrawer({ isOpen: true, menuItem });
  };

  const closeMobileSubMenu = () => {
    setMobileSubMenuDrawer({ isOpen: false, menuItem: null });
  };

  const renderNotification = (text: string) => {
    let elements: React.ReactNode[] = [];
    let lastIndex = 0;
    const matches = [...text.matchAll(mdLinkRegex)];

    matches.forEach((match, i) => {
      const [fullMatch, linkText, url] = match;
      const matchStart = match.index!;
      const matchEnd = matchStart + fullMatch.length;
      const beforeText = text.slice(lastIndex, matchStart);
      elements.push(...processRoutes(beforeText));
      elements.push(
        <a
          key={`md-${i}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline"
          data-notif-ignore="true"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {linkText}
        </a>
      );
      lastIndex = matchEnd;
    });
    elements.push(...processRoutes(text.slice(lastIndex)));
    return elements;
  };

  const processRoutes = (text: string) => {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    const matches = [...text.matchAll(routeRegex)];

    matches.forEach((match, i) => {
      const matchStart = match.index!;
      const matchEnd = matchStart + match[0].length;

      if (matchStart > lastIndex) {
        parts.push(text.slice(lastIndex, matchStart));
      }

      const fullRoute = match[0];
      const displayText = fullRoute.split("/").filter(Boolean).pop();

      parts.push(
        <span
          key={`route-${i}-${fullRoute}`}
          data-notif-ignore="true"
          onClick={(e) => {
            e.stopPropagation();
            router.push(fullRoute);
          }}
          className="text-blue-500 underline cursor-pointer"
        >
          {displayText}
        </span>
      );

      lastIndex = matchEnd;
    });

    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts;
  };

  const handleNotificationBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement | null;
    if (
      target &&
      target.closest &&
      (target.closest('a') ||
        target.closest('button') ||
        target.closest('[data-notif-ignore]'))
    ) {
      return;
    }
    setIsNotificationsOpen((prev) => !prev);
    const now = Date.now();
    if (now - lastRefreshRef.current >= REFRESH_INTERVAL) {
      notifications.refresh();
      lastRefreshRef.current = now;
    }
  };

  useEffect(() => {
    if (!isNotificationsOpen) return;

    const closeNotificationsOnOutsidePress = (event: PointerEvent) => {
      if (!notificationPanelRef.current?.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener("pointerdown", closeNotificationsOnOutsidePress);
    return () => document.removeEventListener("pointerdown", closeNotificationsOnOutsidePress);
  }, [isNotificationsOpen]);

  const toggleSubMenu = (key: string) => {
    if (!isCollapsed) {
      setExpandedMenus((prev) => ({
        ...prev,
        [key]: !prev[key],
      }));
    }
  };

  const clearHoverTimeout = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
  };

  const setDelayedHoverTimeout = (callback: () => void, delay: number = 150) => {
    const timeout = setTimeout(callback, delay);
    setHoverTimeout(timeout);
  };

  const HoverMenu: React.FC<HoverMenuProps> = ({ item, isVisible, mouseY }) => {
    if (!isVisible) return null;
    return (
      <div
        className="fixed bg-popover border border-border rounded-md shadow-xl z-[9999] min-w-40 py-2"
        style={{
          left: "50px",
          top: `${mouseY - 20}px`,
        }}
        onMouseEnter={() => {
          clearHoverTimeout();
          setHoveredItem(item.path);
        }}
        onMouseLeave={() => {
          setDelayedHoverTimeout(() => {
            setHoveredItem(null);
          });
        }}
      >
        <div className="px-3 py-2 text-sm font-medium text-foreground border-b border-border">
          {item.title}
        </div>

        {item.subItems ? (
          item.subItems.map((subItem) => (
            <button
              key={subItem.path}
              onClick={() => {
                router.push(subItem.path);
                setHoveredItem(null);
                clearHoverTimeout();
              }}
              className={`w-full text-left px-3 py-2 text-sm transition-colors duration-150 ${isActive(subItem.path)
                ? "bg-accent text-accent-foreground dark:text-accent-foreground text-black"
                : "hover:bg-accent/50 text-foreground"
                }`}
            >
              {subItem.title}
            </button>
          ))
        ) : (
          <button
            onClick={() => {
              router.push(item.path);
              setHoveredItem(null);
              clearHoverTimeout();
            }}
            className={`w-full text-left px-3 py-2 text-sm transition-colors duration-150 ${isActive(item.path)
              ? "bg-accent text-accent-foreground dark:text-accent-foreground text-black"
              : "hover:bg-accent/50 text-foreground"
              }`}
          >
            Open {item.title}
          </button>
        )}
      </div>
    );
  };

  const handleMouseLeave = () => {
    if (isCollapsed) {
      setDelayedHoverTimeout(() => {
        setHoveredItem(null);
      });
    }
  };

  const handleMouseEnter = (item: MenuItem, e: React.MouseEvent) => {
    if (isCollapsed) {
      clearHoverTimeout();
      setHoveredItem(item.path);
      setMousePosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseEnterNotifications = () => {
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollBarWidth}px`;
  };

  const handleMouseLeaveNotifications = () => {
    document.body.style.overflow = "auto";
    document.body.style.paddingRight = "0";
  };

  const handleMenuClick = (item: MenuItem) => {
    if (item.opensResourceChooser && isMobile) {
      setResourceChooserOpen(true);
      return;
    }
    if (item.subItems) {
      if (isCollapsed || isMobile) {
        openMobileSubMenu(item);
      } else {
        toggleSubMenu(item.path);
      }
    } else {
      router.push(item.path);
      setHoveredItem(null);
      clearHoverTimeout();
    }
  };

  useEffect(() => {
    setShowTutorial(!settings.sidebarTutorialDone);
  }, [settings.sidebarTutorialDone]);

  const handleSidebarClick = () => {
    updateSettings({ sidebarTutorialDone: true })
    setShowTutorial(false);
  }

  const handleMobileNavClick = (item: MenuItem) => {
    setSelectedMobileNav(item.path);
    if (item.opensResourceChooser) {
      setResourceChooserOpen(true);
      return;
    }
    if (item.subItems) {
      openMobileSubMenu(item);
    } else {
      router.push(item.path);
    }
  };

  const handleMobileNavScroll = (e: React.UIEvent<HTMLDivElement>) => {
    try {
      localStorage.setItem(MOBILE_NAV_SCROLL_KEY, String(e.currentTarget.scrollLeft));
    } catch (error) { }
  };

  useEffect(() => {
    const baseMenu: MenuItem[] = [
      { title: "Dashboard", shortTitle: "Home", path: "/dashboard", icon: Home },
      { title: "Attendance Details", shortTitle: "Attendance", path: "/attendance", icon: List },
      { title: "Time Table", shortTitle: "Timetable", path: "/timetable", icon: Calendar },
      { title: "Mark Attendance", shortTitle: "Mark", path: "/markattendance", icon: ListChecks },
      { title: "Vacant", shortTitle: "Empty", path: "/vacant", icon: Building },
      {
        title: "Exams",
        shortTitle: "Exam",
        path: "/exams",
        icon: FileSpreadsheet,
        subItems: [
          { title: "Internals", path: "/exams/internals" },
          { title: "Past Internals", path: "/exams/past-internals" },
          { title: "Semester Results", path: "/exams/semester-results" },
        ],
      },
      { title: "Resources", shortTitle: "Files", path: "/resources", icon: Folder },
      { title: "Cgpa Calculator", shortTitle: "CGPA", path: "/cgpa", icon: Calculator },
      { title: "Academic Calender", shortTitle: "Calendar", path: "/calender", icon: CalendarDays },
      { title: "Forums", shortTitle: "Forum", path: "/forums", icon: MessageSquare },
      { title: "Subjects", shortTitle: "Subs", path: "/subjects", icon: Library },
      { title: "Profile", shortTitle: "Me", path: "/profile", icon: User },
      { title: "Feedback", shortTitle: "Feed", path: "/feedback", icon: Edit },
      // { title: "Apps", path: "/apps", icon: AppWindow },
      { title: "Settings", shortTitle: "Set", path: "/settings", icon: Settings },
    ];

    let menu = [...baseMenu];
    if (isAdmin) {
      menu.push(
        {
          title: "Admin Panel",
          shortTitle: "Admin",
          path: "/admin",
          icon: Shield,
        }
      );
    }
    menu.push({
      title: "About & GitHub",
      shortTitle: "More",
      path: "/aboutus",
      icon: Users,
      opensResourceChooser: true,
      subItems: [
        { title: "About Us", path: "/aboutus" },
        { title: "GitHub", path: "/github" },
      ],
    });
    setMenuItems(menu);
  }, [isAdmin]);

  useEffect(() => {
    setHoveredItem(null);
    clearHoverTimeout();
    setSelectedMobileNav(pathname);
  }, [pathname]);

  useEffect(() => {
    document.title = `Srmapi - ${profile?.studentName}`;
  }, [router, pathname, profile?.studentName]);

  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  useEffect(() => {
    if (isMobile) {
      localStorage.setItem("sidebarState", "expanded");
    }
  }, [isMobile]);

  useEffect(() => {
    if (!isMobile) return;
    try {
      const savedScroll = localStorage.getItem(MOBILE_NAV_SCROLL_KEY);
      if (!savedScroll) return;
      const scrollLeft = Number(savedScroll);
      if (Number.isNaN(scrollLeft)) return;

      requestAnimationFrame(() => {
        if (mobileNavScrollRef.current) {
          mobileNavScrollRef.current.scrollLeft = scrollLeft;
        }
      });
    } catch (error) { }
  }, [isMobile, menuItems.length]);

  useEffect(() => {
    localStorage.setItem("sidebarState", state);
  }, [state]);

  useEffect(() => {
    try {
      localStorage.setItem("expandedMenus", JSON.stringify(expandedMenus));
    } catch (error) { }
  }, [expandedMenus]);

  return (
    <div className="min-h-screen flex w-full bg-background">
      {!isMobile && (
        <Sidebar className="border-r" collapsible="icon">
          <SidebarContent>
            {!isCollapsed && (
              <div className="p-4 bg-sidebar/50 relative">
                <h1
                  className="text-xl font-bold text-sidebar-foreground"
                >
                  {profile?.registerNo}
                </h1>
                <div className="absolute bottom-0 left-0 w-full h-px bg-sidebar-border translate-y-[4px]" />
              </div>
            )}
            {isCollapsed && (
              <div className="py-4 px-3 border-b border-sidebar-border bg-sidebar/50 flex justify-center">
                <div className="w-28 h-8 rounded-full overflow-hidden border border-primary/20 shadow-md bg-white">
                  <Image
                    src={profile?.picture || Logo_White}
                    alt="Profile"
                    width={200}
                    height={200}
                    unoptimized={Boolean(profile?.picture)}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}

            <SidebarGroup className="flex-1">
              {!isCollapsed && <SidebarGroupLabel>Navigation</SidebarGroupLabel>}
              <SidebarGroupContent>
                <SidebarMenu className={`space-y-2 ${isCollapsed ? "items-center px-1" : ""}`}>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.path}>
                      {isCollapsed ? (
                        <div className="relative">
                          <SidebarMenuButton
                            onMouseEnter={(e) => handleMouseEnter(item, e)}
                            onMouseLeave={handleMouseLeave}
                            onClick={() => handleMenuClick(item)}
                            className={`group transition-all duration-200 cursor-pointer relative w-10 h-10 p-0 flex items-center justify-center rounded-md ${isSubPathActive(item.path)
                              ? "bg-sidebar-accent text-sidebar-accent-foreground"
                              : "hover:bg-sidebar-accent/50"
                              }`}
                          >
                            <item.icon className="h-4 w-4" />

                            {item.highlight && (
                              <span className="absolute top-2 right-2 flex items-center justify-center">
                                <span className="absolute inline-flex h-2.5 w-2.5 animate-ping rounded-full bg-blue-600 opacity-75"></span>
                                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-blue-600"></span>
                              </span>
                            )}

                            {isSubPathActive(item.path) && (
                              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-0.5 h-6 bg-sidebar-accent-foreground rounded-l-sm" />
                            )}
                          </SidebarMenuButton>
                          <HoverMenu
                            item={item}
                            isVisible={hoveredItem === item.path}
                            mouseY={mousePosition.y}
                          />
                        </div>
                      ) : (
                        <>
                          <SidebarMenuButton
                            onClick={() => handleMenuClick(item)}
                            hasSubItems={!!item.subItems}
                            className={`group transition-all duration-200 cursor-pointer relative ${isSubPathActive(item.path)
                              ? "bg-sidebar-accent text-sidebar-accent-foreground"
                              : "hover:bg-sidebar-accent/50"
                              } ${isMobile ? "text-sm py-2" : "py-2.5"}`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center">
                                <item.icon
                                  className={`mr-3 h-5 w-5 transition-colors ${isMobile ? "h-4 w-4 mr-2" : ""
                                    }`}
                                />
                                <div className="flex flex-col items-start">
                                  <span className="font-medium">{item.title}</span>
                                </div>
                              </div>

                              {item.highlight && (
                                <span className="absolute top-2 right-2 flex items-center justify-center">
                                  <span className="absolute inline-flex h-2.5 w-2.5 animate-ping rounded-full bg-sky-400 opacity-75"></span>
                                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-sky-500"></span>
                                </span>
                              )}

                              {item.subItems && (
                                <>
                                  {expandedMenus[item.path] ? (
                                    <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 transition-transform duration-200" />
                                  )}
                                </>
                              )}
                            </div>
                            {isActive(item.path) && !item.subItems && (
                              <div className="absolute right-0 top-0 bottom-0 w-1 bg-sidebar-accent-foreground rounded-l-full" />
                            )}
                          </SidebarMenuButton>
                          {item.subItems && expandedMenus[item.path] && (
                            <SidebarMenuSub className="mt-1 ml-4 border-l border-sidebar-border/30">
                              {item.subItems.map((subItem) => (
                                <SidebarMenuSubItem key={subItem.path}>
                                  <SidebarMenuSubButton
                                    onClick={() => router.push(subItem.path)}
                                    isActive={isActive(subItem.path)}
                                    className={`transition-all duration-150 cursor-pointer pl-4 ${isActive(subItem.path)
                                      ? "bg-sidebar-accent text-sidebar-accent-foreground border-r-2 border-sidebar-accent-foreground"
                                      : "hover:bg-sidebar-accent/30"
                                      } ${isMobile ? "text-xs py-1.5" : "py-2"}`}
                                  >
                                    <div className="flex flex-col items-start">
                                      <span className="font-medium">{subItem.title}</span>
                                    </div>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          )}
                        </>
                      )}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <div className={`border-t border-sidebar-border bg-sidebar/30 ${isCollapsed ? 'py-4 px-2' : 'p-4'}`}>
              {!isCollapsed ? (
                <>
                  <div className="mb-4 space-y-2">
                    <div className="flex flex-col space-y-1">
                      <button
                        onClick={() => router.push("/terms")}
                        className={`text-left ${isMobile ? 'text-xs' : 'text-sm'} text-sidebar-foreground/70 hover:text-sidebar-foreground hover:underline transition-colors duration-200`}
                      >
                        Terms and Conditions
                      </button>
                      <button
                        onClick={() => router.push("/privacy")}
                        className={`text-left ${isMobile ? 'text-xs' : 'text-sm'} text-sidebar-foreground/70 hover:text-sidebar-foreground hover:underline transition-colors duration-200`}
                      >
                        Privacy Policy
                      </button>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full bg-transparent border-sidebar-border hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all duration-200"
                    onClick={() => logout()}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <div className="flex flex-col items-center space-y-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 hover:bg-accent hover:text-accent-foreground transition-all duration-200 rounded-md"
                    onClick={() => router.push("/terms")}
                    title="Terms and Conditions"
                  >
                    <BookOpenText className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 hover:bg-accent hover:text-accent-foreground transition-all duration-200 rounded-md"
                    onClick={() => router.push("/privacy")}
                    title="Privacy Policy"
                  >
                    <Lock className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-8 h-8 bg-transparent border-sidebar-border hover:bg-destructive hover:text-red-600 hover:border-destructive transition-all duration-200 rounded-md"
                    onClick={() => logout()}
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </SidebarContent>
        </Sidebar>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {lProfile?.hasCachedData && (
          <div className="w-full bg-red-500 text-white text-center text-xs sm:text-sm py-2 px-4 font-medium z-30 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
            <span>Showing cached data from {lProfile.sessionTime} since college portal is down. Click below button if portal was up again!</span>
            <Button 
              size="sm" 
              variant="outline" 
              className="h-7 text-xs bg-transparent border-white text-white hover:bg-white hover:text-red-500" 
              disabled={isFetchingNewData}
              onClick={async () => {
                setIsFetchingNewData(true);
                try {
                  const res = await initiateSession();
                  if (res) {
                    toast({ title: "Success", description: `New data fetched for session: ${res.sessionTime}` });
                  } else {
                    toast({ variant: "destructive", title: "Error", description: "SRM portal is still unreachable." });
                  }
                } finally {
                  setIsFetchingNewData(false);
                }
              }}
            >
              {isFetchingNewData && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
              {isFetchingNewData ? "Fetching..." : "Fetch new data"}
            </Button>
          </div>
        )}
        <div className="sticky top-0 z-40 w-full bg-background relative border-b border-border shadow-sm">
          <motion.div
            animate={{ opacity: isMobile && activeMobileToast ? 0 : 1 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className={isMobile && activeMobileToast ? "pointer-events-none" : ""}
          >
            <header className="h-16 border-b bg-background/80 backdrop-blur-sm">
              <div className="flex items-center px-6 h-full">
                {!isMobile && (
                  <div className="relative">
                    <SidebarTrigger
                      className="mr-4 hover:bg-accent hover:text-accent-foreground"
                      onClick={handleSidebarClick}
                    />
                    {showTutorial && (
                      <div className="absolute left-full -ml-2 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-lg shadow-lg whitespace-nowrap flex items-center">
                        👈 Click here to open the menu
                        <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary rotate-45"></div>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h1 className={`${isMobile ? "text-lg" : "text-xl"} font-semibold truncate`}>
                    {(() => {
                      for (const item of menuItems) {
                        if (item.subItems) {
                          const subItemMatch = item.subItems.find((subItem) =>
                            isActive(subItem.path)
                          );
                          if (subItemMatch) return subItemMatch.title;
                        }
                      }
                      const exactMatch = menuItems.find((item) => isActive(item.path));
                      if (exactMatch) return exactMatch.title;
                      const subPathMatch = menuItems.find((item) =>
                        pathname.startsWith(item.path + '/') && item.path !== '/dashboard'
                      );
                      if (subPathMatch) return subPathMatch.title;
                      return "Dashboard";
                    })()}
                  </h1>
                  {!isMobile ? (
                    <p className="text-sm text-muted-foreground truncate">
                      {profile?.studentName}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground truncate">
                      {profile?.registerNo}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    onClick={whatsapp}
                    className="h-9 shrink-0 gap-1.5 bg-green-600 px-2.5 text-xs text-white hover:bg-green-700 sm:px-3"
                    aria-label="Join the Srmapi WhatsApp channel"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M20.52 3.48A11.91 11.91 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.11.55 4.17 1.6 5.98L0 24l6.21-1.62A11.92 11.92 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.19-1.24-6.21-3.48-8.52ZM12 21.48c-1.8 0-3.55-.48-5.08-1.39l-.36-.21-3.69.96.99-3.6-.24-.37A9.96 9.96 0 0 1 2 12c0-5.52 4.48-10 10-10 2.67 0 5.18 1.04 7.07 2.93A9.96 9.96 0 0 1 22 12c0 5.52-4.48 10-10 10Zm5.44-7.54c-.3-.15-1.77-.87-2.05-.97-.28-.1-.48-.15-.68.15-.2.3-.78.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.68-1.65-.93-2.27-.24-.58-.49-.5-.68-.51h-.58c-.2 0-.52.07-.8.37-.28.3-1.05 1.02-1.05 2.47s1.08 2.86 1.23 3.05c.15.2 2.12 3.24 5.15 4.54.72.31 1.28.5 1.72.64.72.23 1.38.2 1.9.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z" />
                    </svg>
                    <span className="hidden sm:inline">Join</span>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full overflow-hidden hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
                        aria-label="Switch account"
                      >
                        {profile?.picture ? (
                          <Image
                            src={profile.picture}
                            alt="Profile"
                            width={32}
                            height={32}
                            unoptimized
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-4 w-4" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64">
                      <DropdownMenuLabel>Switch Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {(accounts?.length || 0) > 0 ? (
                        accounts.map((account) => {
                          const isActiveAccount = account.id === activeAccountId;
                          return (
                            <DropdownMenuItem
                              key={account.id}
                              onClick={() => {
                                if (!isActiveAccount) {
                                  handleAccountSwitch(account.id);
                                }
                              }}
                              className="cursor-pointer flex items-center justify-between"
                            >
                              <span>{account.username}</span>
                              {isActiveAccount && <Check className="h-4 w-4" />}
                            </DropdownMenuItem>
                          );
                        })
                      ) : (
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => router.push("/settings")}
                        >
                          No accounts found
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => router.push("/settings")}
                      >
                        Manage accounts
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
                        aria-label="Open actions menu"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                      <DropdownMenuItem
                        onClick={handleHomeNavigation}
                        className="cursor-pointer"
                      >
                        <Home className="mr-2 h-4 w-4" />
                        Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleRefresh}
                        className="cursor-pointer"
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Reload
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                        className="cursor-pointer"
                      >
                        {theme === "light" ? (
                          <Moon className="mr-2 h-4 w-4" />
                        ) : (
                          <Sun className="mr-2 h-4 w-4" />
                        )}
                        Theme Change
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => logout()}
                        className="cursor-pointer text-red-600 focus:text-destructive"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </header>

            <div ref={notificationPanelRef} className="relative">
              <div
                onClick={handleNotificationBarClick}
                className={`notifications-bar cursor-pointer bg-slate-200 text-black py-2 pr-6 pl-6 flex items-center justify-between shadow-md ${isMobile && usesMobileSideNav ? "ml-12" : ""}`}
              >
                <span className="font-medium text-sm">
                  {notifications.notifications.length > 0 ? renderNotification(notifications.notifications[0].notification) : "No Notifications"}
                </span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${isNotificationsOpen ? "rotate-180" : ""}`}
                />
              </div>

              {isNotificationsOpen && (
                <div
                  className={`notifications-bar absolute right-0 top-full z-50 bg-popover border border-border shadow-lg ${isMobile && usesMobileSideNav ? "left-12" : "left-0"}`}
                  onMouseEnter={handleMouseEnterNotifications}
                  onMouseLeave={handleMouseLeaveNotifications}
                >
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.notifications.length === 0 ? (
                      <p className="p-4 text-sm text-muted-foreground text-center">
                        {notifications.isLoading ? "Loading..." : "No new notifications"}
                      </p>
                    ) : (
                      notifications.notifications.slice(1).map((note, index) => (
                        <div key={index} className="p-3 border-b bg-accent border-border text-sm hover:bg-accent/30 cursor-pointer">
                          {renderNotification(note.notification)}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          <AnimatePresence>
            {isMobile && activeMobileToast && (
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
            )}
          </AnimatePresence>
        </div>

        <main className="flex-1 flex flex-col overflow-hidden">
          <div className={`flex-1 min-w-0 overflow-x-hidden overflow-y-auto p-4 sm:p-6 ${isMobile && usesMobileSideNav ? "pl-14" : ""}`}>
            {children}
          </div>
          <footer className={`flex-shrink-0 p-6 pt-4 border-t border-border bg-background/80 backdrop-blur-sm ${isMobile && !usesMiniMobileNav && !usesMobileSideNav ? 'pb-28' : ''}`}>
            <div className={`pt-4 ${isMobile ? 'text-center -mt-4' : 'flex items-center justify-between'}`}>
              <p className={`text-sm text-muted-foreground ${isMobile ? 'mb-2' : ''}`}>
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
                Version 5.7.0 • Last updated: 21-Aug-2026
              </p>
            </div>
          </footer>
        </main>

        {isMobile && (
          <>
            {usesMiniMobileNav ? (
              <>
                <MiniMobileNav items={menuItems.slice(0, Math.ceil(menuItems.length / 2))} side="left" selectedPath={selectedMobileNav} isSubPathActive={isSubPathActive} onClick={handleMobileNavClick} />
                <MiniMobileNav items={menuItems.slice(Math.ceil(menuItems.length / 2))} side="right" selectedPath={selectedMobileNav} isSubPathActive={isSubPathActive} onClick={handleMobileNavClick} />
              </>
            ) : usesSidebarMobileNav ? (
              <MobileSidebarNav items={menuItems} selectedPath={selectedMobileNav} isSubPathActive={isSubPathActive} onClick={handleMobileNavClick} />
            ) : (
            <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border rounded-3xl bg-background/95 backdrop-blur-sm">
              <div
                ref={mobileNavScrollRef}
                onScroll={handleMobileNavScroll}
                className={usesDoubleRowMobileNav
                  ? "grid h-20 grid-flow-col grid-rows-2 auto-cols-[68px] gap-px overflow-x-auto no-scrollbar p-1"
                  : "flex h-20 overflow-x-auto no-scrollbar px-2"
                }
              >
                {menuItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => handleMobileNavClick(item)}
                    className={`relative flex items-center justify-center rounded-lg transition-all duration-200
                          ${usesDoubleRowMobileNav ? "min-w-0 flex-col gap-0 px-0.5 py-0" : "mx-1 my-1 min-w-[70px] flex-col p-1"}
                          ${selectedMobileNav === item.path || isSubPathActive(item.path)
                        ? "text-primary font-semibold bg-primary/15 border border-primary/30 shadow-md"
                        : "text-foreground/70 hover:text-foreground hover:bg-accent/10 border border-transparent"
                      }`}
                  >
                    {item.highlight ? (
                      <span className="absolute top-0 right-0 flex items-center justify-center">
                        <span className="absolute inline-flex h-1.5 w-1.5 animate-ping rounded-full bg-blue-600 opacity-75"></span>
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-blue-600"></span>
                      </span>
                    ) : item.subItems ? (
                      <span className="absolute top-0 right-0 flex items-center justify-center">
                        <ChevronUp className="h-2.5 w-2.5 text-foreground/60" />
                      </span>
                    ) : null}
                    <item.icon className={`shrink-0 ${usesDoubleRowMobileNav ? "h-3.5 w-3.5" : "h-4 w-4 mb-0.5"}`} />
                    <span className={`truncate text-center block ${usesDoubleRowMobileNav ? "max-w-[62px] text-[8px] leading-tight" : "max-w-[70px] text-[10px]"}`}>
                      {usesDoubleRowMobileNav ? item.shortTitle ?? item.title : item.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            )}

            <MobileSubMenuDrawer
              isOpen={mobileSubMenuDrawer.isOpen}
              onClose={closeMobileSubMenu}
              menuItem={mobileSubMenuDrawer.menuItem}
            />
          </>
        )}
        <ResourceChooserDrawer isOpen={resourceChooserOpen} onClose={() => setResourceChooserOpen(false)} />
      </div>
    </div>
  );
};

function MiniMobileNav({
  items,
  side,
  selectedPath,
  isSubPathActive,
  onClick,
}: {
  items: MenuItem[];
  side: "left" | "right";
  selectedPath: string | null;
  isSubPathActive: (path: string) => boolean;
  onClick: (item: MenuItem) => void;
}) {
  const edgeClass = side === "left" ? "left-0 rounded-r-md border-r" : "right-0 rounded-l-md border-l";

  return (
    <nav className={`fixed ${edgeClass} top-1/2 z-30 -translate-y-1/2 border-y border-border bg-background/95 py-1 shadow-sm backdrop-blur-sm`} aria-label={`${side} mobile navigation`}>
      <div className="flex flex-col gap-0.5">
        {items.map((item) => {
          const active = selectedPath === item.path || isSubPathActive(item.path);
          return (
            <button
              key={item.path}
              type="button"
              title={item.title}
              aria-label={item.title}
              onClick={() => onClick(item)}
              className={`relative flex h-7 w-7 items-center justify-center transition-colors ${active ? "bg-primary/15 text-primary" : "text-foreground/65 hover:bg-accent hover:text-foreground"}`}
            >
              <item.icon className="h-3.5 w-3.5" />
              {item.highlight && <span className="absolute right-1 top-1 h-1 w-1 rounded-full bg-blue-600" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function MobileSidebarNav({
  items,
  selectedPath,
  isSubPathActive,
  onClick,
}: {
  items: MenuItem[];
  selectedPath: string | null;
  isSubPathActive: (path: string) => boolean;
  onClick: (item: MenuItem) => void;
}) {
  return (
    <nav className="fixed bottom-0 left-0 top-16 z-50 w-12 overflow-y-auto border-r border-border bg-background/95 py-2 shadow-sm backdrop-blur-sm no-scrollbar" aria-label="Mobile sidebar navigation">
      <div className="flex flex-col items-center gap-1.5">
        {items.map((item) => {
          const active = selectedPath === item.path || isSubPathActive(item.path);
          return (
            <button
              key={item.path}
              type="button"
              title={item.title}
              aria-label={item.title}
              onClick={() => onClick(item)}
              className={`relative flex h-10 w-10 items-center justify-center rounded-md transition-colors ${active ? "bg-primary/15 text-primary" : "text-foreground/65 hover:bg-accent hover:text-foreground"}`}
            >
              <item.icon className="h-[18px] w-[18px]" />
              {item.highlight && <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-blue-600" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <DashboardContent>{children}</DashboardContent>
    </SidebarProvider>
  );
};

export default DashboardLayout;
