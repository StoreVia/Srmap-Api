"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useStudentData } from "@/context/StudentContext";
import { Button } from "@/components/ui/button";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, useSidebar } from "@/components/ui/sidebar";
import { ChevronDown, ChevronRight, BookOpenText, Lock, LogOut } from "lucide-react";
import Logo_White from "../../../../public/icons/round_corner_logo.png";
import { MenuItem } from "./types";
import { HoverMenu } from "./HoverMenu";

interface DesktopSidebarProps {
  menuItems: MenuItem[];
  isMobile: boolean;
  isActive: (path: string) => boolean;
  isSubPathActive: (path: string) => boolean;
  onOpenMobileSubMenu: (item: MenuItem) => void;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  menuItems,
  isMobile,
  isActive,
  isSubPathActive,
  onOpenMobileSubMenu,
}) => {
  const router = useRouter();
  const { logout } = useAuth();
  const { profile } = useStudentData();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("expandedMenus");
      return stored ? JSON.parse(stored) : {};
    }
    return {};
  });

  useEffect(() => {
    try {
      localStorage.setItem("expandedMenus", JSON.stringify(expandedMenus));
    } catch (error) {}
  }, [expandedMenus]);

  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

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

  const toggleSubMenu = (key: string) => {
    if (!isCollapsed) {
      setExpandedMenus((prev) => ({
        ...prev,
        [key]: !prev[key],
      }));
    }
  };

  const handleMouseEnter = (item: MenuItem, e: React.MouseEvent) => {
    if (isCollapsed) {
      clearHoverTimeout();
      setHoveredItem(item.path);
      setMousePosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseLeave = () => {
    if (isCollapsed) {
      setDelayedHoverTimeout(() => {
        setHoveredItem(null);
      });
    }
  };

  const handleMenuClick = (item: MenuItem) => {
    if (item.subItems) {
      if (isCollapsed || isMobile) {
        onOpenMobileSubMenu(item);
      } else {
        toggleSubMenu(item.path);
      }
    } else {
      router.push(item.path);
      setHoveredItem(null);
      clearHoverTimeout();
    }
  };

  const handleHoverSelect = (path: string) => {
    router.push(path);
    setHoveredItem(null);
    clearHoverTimeout();
  };

  if (isMobile) return null;

  return (
    <Sidebar className="border-r" collapsible="icon">
      <SidebarContent>
        {!isCollapsed && (
          <div className="p-4 bg-sidebar/50 relative">
            <h1 className="text-xl font-bold text-sidebar-foreground">
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
                        className={`group transition-all duration-200 cursor-pointer relative w-10 h-10 p-0 flex items-center justify-center rounded-md ${
                          isSubPathActive(item.path)
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
                        onSelect={handleHoverSelect}
                        onMouseEnter={() => {
                          clearHoverTimeout();
                          setHoveredItem(item.path);
                        }}
                        onMouseLeave={() => {
                          setDelayedHoverTimeout(() => {
                            setHoveredItem(null);
                          });
                        }}
                        isActive={isActive}
                      />
                    </div>
                  ) : (
                    <>
                      <SidebarMenuButton
                        onClick={() => handleMenuClick(item)}
                        hasSubItems={!!item.subItems}
                        className={`group transition-all duration-200 cursor-pointer relative ${
                          isSubPathActive(item.path)
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "hover:bg-sidebar-accent/50"
                        } ${isMobile ? "text-sm py-2" : "py-2.5"}`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center">
                            <item.icon
                              className={`mr-3 h-5 w-5 transition-colors ${
                                isMobile ? "h-4 w-4 mr-2" : ""
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
                                className={`transition-all duration-150 cursor-pointer pl-4 ${
                                  isActive(subItem.path)
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

        <div className={`border-t border-sidebar-border bg-sidebar/30 ${isCollapsed ? "py-4 px-2" : "p-4"}`}>
          {!isCollapsed ? (
            <>
              <div className="mb-4 space-y-2">
                <div className="flex flex-col space-y-1">
                  <button
                    onClick={() => router.push("/terms")}
                    className={`text-left ${isMobile ? "text-xs" : "text-sm"} text-sidebar-foreground/70 hover:text-sidebar-foreground hover:underline transition-colors duration-200`}
                  >
                    Terms and Conditions
                  </button>
                  <button
                    onClick={() => router.push("/privacy")}
                    className={`text-left ${isMobile ? "text-xs" : "text-sm"} text-sidebar-foreground/70 hover:text-sidebar-foreground hover:underline transition-colors duration-200`}
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
  );
};