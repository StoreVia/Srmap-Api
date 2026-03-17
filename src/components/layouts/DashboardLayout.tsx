"use client";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useIsMobile } from "@/hooks/useMobile";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";
import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useStudentData } from "@/context/StudentContext";
import { useNotifications } from "@/hooks/useNotification";
import Logo_White from "../../../public/icons/round_corner_logo.png";
import { useLocalStorageContext } from "@/context/LocalStorageContext";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { BookOpenText, Lock, ChevronDown, Library, Folder, MessageSquare, ChevronRight, ChevronUp, Sun, Moon, LogOut, RotateCcw, Home, List, AppWindow, Calendar, Calculator, User, Users, Settings, ListChecks, CalendarDays, Shield, Edit, X, FileSpreadsheet, Building, CheckSquare } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface MenuItem {
  title: string;
  path: string;
  group?: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
  subItems?: Array<{
    title: string;
    path: string;
  }>;
}

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

const DashboardContent: React.FC<DashboardLayoutProps> = ({ children }) => {
  const routeRegex = /\/[a-zA-Z0-9\/-]+/g;
  const mdLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const REFRESH_INTERVAL = 30 * 1000;
  const { logout, isAdmin } = useAuth();
  const { profile } = useStudentData();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const { state } = useSidebar();
  const { settings, updateSettings } = useLocalStorageContext();

  const notifications = useNotifications();
  const isCollapsed = state === "collapsed";
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
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

  const isActive = (path: string) => pathname === path;
  const isSubPathActive = (basePath: string) => pathname.startsWith(basePath);

  const handleRefresh = () => window.location.reload();
  const handleHomeNavigation = () => router.push("/dashboard");

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
    if (item.subItems) {
      openMobileSubMenu(item);
    } else {
      router.push(item.path);
    }
  };

  useEffect(() => {
    const baseMenu: MenuItem[] = [
      { title: "Dashboard", path: "/dashboard", icon: Home },
      { title: "Apps", path: "/apps", icon: AppWindow },
      { title: "Attendance Details", path: "/attendance", icon: List },
      { title: "Time Table", path: "/timetable", icon: Calendar },
      { title: "Check Attendance", path: "/checkattendance", icon: CheckSquare },
      { title: "Code Attendance", path: "/markattendance", icon: ListChecks },
      { title: "Vacant", path: "/vacant", icon: Building },
      { title: "Exams", path: "/exams", icon: FileSpreadsheet, subItems: [{ title: "Internals", path: "/exams/internals" }] },
      { title: "Resources", path: "/resources", icon: Folder },
      { title: "Cgpa Calculator", path: "/cgpa", icon: Calculator },
      { title: "Academic Calender", path: "/calender", icon: CalendarDays },
      { title: "Forums", path: "/forums", icon: MessageSquare },
      { title: "Subjects", path: "/subjects", icon: Library },
      { title: "Profile", path: "/profile", icon: User },
      { title: "Feedback", path: "/feedback", icon: Edit, highlight: false },
      { title: "Settings", path: "/settings", icon: Settings },
      { title: "About Us", path: "/aboutus", icon: Users },
    ];

    let menu = [...baseMenu];
    if (isAdmin) {
      menu.push(
        {
          title: "Admin Panel",
          path: "/admin",
          icon: Shield,
        });
    }
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
                    className="w-8 h-8 bg-transparent border-sidebar-border hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all duration-200 rounded-md"
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
        <header className="h-16 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-20">
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
              {!isMobile && (
                <p className="text-sm text-muted-foreground truncate">
                  {profile?.studentName}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleHomeNavigation}
                className="hover:bg-accent hover:text-accent-foreground transition-colors duration-200 disabled:cursor-not-allowed"
                aria-label="Go to dashboard"
              >
                <Home className={`h-4 w-4 transition-all duration-300 scale-100 hover:scale-105`} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRefresh}
                className="hover:bg-accent hover:text-accent-foreground transition-colors duration-200 disabled:cursor-not-allowed"
                aria-label="Refresh page"
              >
                <RotateCcw className={`h-4 w-4 transition-transform duration-500`} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
                aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              >
                <div className="relative w-4 h-4">
                  <Sun
                    className={`absolute inset-0 h-4 w-4 transition-all duration-300 ${theme === "light" ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0"
                      }`}
                  />
                  <Moon
                    className={`absolute inset-0 h-4 w-4 transition-all duration-300 ${theme === "dark" ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
                      }`}
                  />
                </div>
              </Button>
            </div>
          </div>
        </header>

        <div
          onClick={handleNotificationBarClick}
          className="notifications-bar cursor-pointer bg-slate-200 text-black px-6 py-2 flex items-center justify-between shadow-md"
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
            className="notifications-bar bg-popover border border-border shadow-lg z-50"
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
                  <div key={index} className="p-3 border-b bg-accent border-border text-sm hover:bg-accent/30 cursor-pointer" >
                    {renderNotification(note.notification)}
                  </div>
                )))}
            </div>
          </div>
        )}

        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 p-6 overflow-y-auto">
            {children}
          </div>
          <footer className={`flex-shrink-0 p-6 pt-4 border-t border-border bg-background/80 backdrop-blur-sm ${isMobile ? 'pb-28' : ''}`}>
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

              {!isMobile && (
                <p className="text-xs text-muted-foreground">
                  Version1 • Last updated: 17-Meb-2026
                </p>
              )}
            </div>
          </footer>
        </main>

        {isMobile && (
          <>
            <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border rounded-3xl bg-background/95 backdrop-blur-sm">
              <div className="flex overflow-x-auto no-scrollbar h-20 px-2">
                {menuItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => handleMobileNavClick(item)}
                    className={`relative flex flex-col items-center justify-center p-1 min-w-[70px]
                          rounded-lg transition-all duration-200 mx-1 my-1
                          ${selectedMobileNav === item.path || isActive(item.path)
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
                    <item.icon className="h-4 w-4 mb-0.5" />
                    <span className="text-[10px] truncate max-w-[70px] text-center block">{item.title}</span>
                  </button>
                ))}
                <button
                  onClick={() => logout()}
                  className="flex flex-col items-center justify-center p-1 -ml-1 min-w-[70px] text-foreground/70 hover:text-destructive hover:bg-accent/10 rounded-lg transition-all duration-200 mx-1 my-1"
                >
                  <LogOut className="h-4 w-4 mb-0.5" />
                  <span className="text-[10px]">Logout</span>
                </button>
              </div>
            </div>

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