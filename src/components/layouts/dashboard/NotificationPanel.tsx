"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/hooks/utils/useNotification";
import { ChevronDown } from "lucide-react";

interface NotificationPanelProps {
  isMobile: boolean;
  usesMobileSideNav: boolean;
}

const mdLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
const routeRegex = /\/[a-zA-Z0-9\/-]+/g;
const REFRESH_INTERVAL = 30 * 1000;

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isMobile,
  usesMobileSideNav,
}) => {
  const router = useRouter();
  const notifications = useNotifications();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const lastRefreshRef = useRef<number>(0);
  const notificationPanelRef = useRef<HTMLDivElement | null>(null);

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

  const handleNotificationBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement | null;
    if (
      target &&
      target.closest &&
      (target.closest("a") ||
        target.closest("button") ||
        target.closest("[data-notif-ignore]"))
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
    return () =>
      document.removeEventListener("pointerdown", closeNotificationsOnOutsidePress);
  }, [isNotificationsOpen]);

  const handleMouseEnterNotifications = () => {
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollBarWidth}px`;
  };

  const handleMouseLeaveNotifications = () => {
    document.body.style.overflow = "auto";
    document.body.style.paddingRight = "0";
  };

  return (
    <div ref={notificationPanelRef} className="relative">
      <div
        onClick={handleNotificationBarClick}
        className={`notifications-bar cursor-pointer bg-slate-200 text-black py-2 pr-6 pl-6 flex items-center justify-between shadow-md ${
          isMobile && usesMobileSideNav ? "ml-12" : ""
        }`}
      >
        <span className="font-medium text-sm">
          {notifications.notifications.length > 0
            ? renderNotification(notifications.notifications[0].notification)
            : "No Notifications"}
        </span>
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${
            isNotificationsOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {isNotificationsOpen && (
        <div
          className={`notifications-bar absolute right-0 top-full z-50 bg-popover border border-border shadow-lg ${
            isMobile && usesMobileSideNav ? "left-12" : "left-0"
          }`}
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
                <div
                  key={index}
                  className="p-3 border-b bg-accent border-border text-sm hover:bg-accent/30 cursor-pointer"
                >
                  {renderNotification(note.notification)}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};