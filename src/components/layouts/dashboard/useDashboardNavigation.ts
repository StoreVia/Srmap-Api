import { useState, useEffect, useMemo, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { MenuItem } from "./types";
import { Home, List, Calendar, ListChecks, Building, FileSpreadsheet, Folder, Calculator, CalendarDays, MessageSquare, Library, User, Edit, Settings, Users, Shield } from "lucide-react";

export function useDashboardNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAdmin } = useAuth();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

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
      { title: "CGPA Calculator", shortTitle: "CGPA", path: "/cgpa", icon: Calculator },
      { title: "Academic Calender", shortTitle: "Calendar", path: "/calender", icon: CalendarDays },
      // { title: "Forums", shortTitle: "Forum", path: "/forums", icon: MessageSquare },
      { title: "Subjects", shortTitle: "Subs", path: "/subjects", icon: Library },
      { title: "Profile", shortTitle: "Me", path: "/profile", icon: User },
      { title: "Feedback", shortTitle: "Feed", path: "/feedback", icon: Edit },
      { title: "Settings", shortTitle: "Set", path: "/settings", icon: Settings },
      {
        title: "About & GitHub",
        shortTitle: "More",
        path: "/aboutus",
        icon: Users,
        subItems: [
          { title: "About Us", path: "/aboutus" },
          { title: "GitHub", path: "/github" },
        ],
      },
    ];

    const menu = [...baseMenu];
    if (isAdmin) {
      menu.push({
        title: "Admin Panel",
        shortTitle: "Admin",
        path: "/admin",
        icon: Shield,
      });
    }
    setMenuItems(menu);
  }, [isAdmin]);

  useEffect(() => {
    if (menuItems.length > 0) {
      menuItems.forEach((item) => {
        router.prefetch(item.path);
        if (item.subItems) {
          item.subItems.forEach((sub) => router.prefetch(sub.path));
        }
      });
    }
  }, [menuItems, router]);

  const isActive = useCallback(
    (path: string) => pathname === path,
    [pathname]
  );

  const isSubPathActive = useCallback(
    (basePath: string) => {
      if (pathname === basePath) return true;
      if (basePath === "/admin" || basePath === "/dashboard") {
        return pathname === basePath;
      }
      return pathname.startsWith(basePath + "/");
    },
    [pathname]
  );

  const currentTitle = useMemo(() => {
    for (const item of menuItems) {
      if (item.subItems) {
        const subItemMatch = item.subItems.find((subItem) => isActive(subItem.path));
        if (subItemMatch) return subItemMatch.title;
      }
    }
    const exactMatch = menuItems.find((item) => isActive(item.path));
    if (exactMatch) return exactMatch.title;
    const subPathMatch = menuItems.find(
      (item) => pathname.startsWith(item.path + "/") && item.path !== "/dashboard"
    );
    if (subPathMatch) return subPathMatch.title;
    return "Dashboard";
  }, [menuItems, pathname, isActive]);

  return {
    menuItems,
    pathname,
    isActive,
    isSubPathActive,
    currentTitle,
  };
}