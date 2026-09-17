"use client";
import React, { useRef, useEffect } from "react";
import { ChevronUp } from "lucide-react";
import { MenuItem, MobileNavProps, MiniMobileNavProps } from "./types";
import { useLocalStorageContext } from "@/context/LocalStorageContext";

const MOBILE_NAV_SCROLL_KEY = "mobileNavScrollLeft";

export function MiniMobileNav({
  items,
  side,
  selectedPath,
  isSubPathActive,
  onClick,
}: MiniMobileNavProps) {
  const edgeClass =
    side === "left"
      ? "left-0 rounded-r-xl border-r border-y"
      : "right-0 rounded-l-xl border-l border-y";

  return (
    <nav
      className={`fixed ${edgeClass} top-1/2 z-30 -translate-y-1/2 border-border/60 bg-background/90 py-1.5 px-0.5 shadow-lg backdrop-blur-md select-none`}
      aria-label={`${side} mobile navigation`}
    >
      <div className="flex flex-col gap-1">
        {items.map((item) => {
          const active = selectedPath === item.path || isSubPathActive(item.path);
          return (
            <button
              key={item.path}
              type="button"
              title={item.title}
              aria-label={item.title}
              onClick={() => onClick(item)}
              className={`relative flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
                active
                  ? "bg-primary/15 text-primary shadow-xs"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.highlight && (
                <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export function MobileSidebarNav({
  items,
  selectedPath,
  isSubPathActive,
  onClick,
}: MobileNavProps) {
  return (
    <nav
      className="w-full flex flex-col items-center gap-1 py-2 px-1 select-none"
      aria-label="Mobile sidebar navigation"
    >
      {items.map((item) => {
        const active = selectedPath === item.path || isSubPathActive(item.path);
        return (
          <button
            key={item.path}
            type="button"
            title={item.title}
            aria-label={item.title}
            onClick={() => onClick(item)}
            className={`relative flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
              active
                ? "bg-primary/15 text-primary shadow-xs font-semibold"
                : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
            }`}
          >
            <item.icon className="h-4 w-4" />
            {item.highlight && (
              <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-blue-600" />
            )}
          </button>
        );
      })}
    </nav>
  );
}

export interface MobileNavigationContainerProps {
  items: MenuItem[];
  selectedPath: string | null;
  isSubPathActive: (path: string) => boolean;
  onNavClick: (item: MenuItem) => void;
}

export const MobileNavigation: React.FC<MobileNavigationContainerProps> = ({
  items,
  selectedPath,
  isSubPathActive,
  onNavClick,
}) => {
  const { settings } = useLocalStorageContext();
  const usesDoubleRowMobileNav = settings.mobileNavigationLayout === "double";
  const usesMiniMobileNav = settings.mobileNavigationLayout === "mini";
  const usesSidebarMobileNav = settings.mobileNavigationLayout === "sidebar";

  const mobileNavScrollRef = useRef<HTMLDivElement | null>(null);

  const handleMobileNavScroll = (e: React.UIEvent<HTMLDivElement>) => {
    try {
      localStorage.setItem(MOBILE_NAV_SCROLL_KEY, String(e.currentTarget.scrollLeft));
    } catch {}
  };

  useEffect(() => {
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
    } catch {}
  }, [items.length]);

  if (usesMiniMobileNav) {
    const halfLength = Math.ceil(items.length / 2);
    return (
      <>
        <MiniMobileNav
          items={items.slice(0, halfLength)}
          side="left"
          selectedPath={selectedPath}
          isSubPathActive={isSubPathActive}
          onClick={onNavClick}
        />
        <MiniMobileNav
          items={items.slice(halfLength)}
          side="right"
          selectedPath={selectedPath}
          isSubPathActive={isSubPathActive}
          onClick={onNavClick}
        />
      </>
    );
  }

  if (usesSidebarMobileNav) {
    return (
      <MobileSidebarNav
        items={items}
        selectedPath={selectedPath}
        isSubPathActive={isSubPathActive}
        onClick={onNavClick}
      />
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border/60 bg-background/90 backdrop-blur-md pt-1 pb-[max(0.6rem,env(safe-area-inset-bottom,8px))] select-none">
      <div
        ref={mobileNavScrollRef}
        onScroll={handleMobileNavScroll}
        className={
          usesDoubleRowMobileNav
            ? "grid h-20 grid-flow-col grid-rows-2 auto-cols-[64px] sm:auto-cols-[72px] gap-1 overflow-x-auto no-scrollbar px-2 py-0.5 touch-pan-x scroll-smooth"
            : "flex h-14 sm:h-15 items-center overflow-x-auto no-scrollbar px-1.5 touch-pan-x scroll-smooth"
        }
      >
        {items.map((item) => {
          const active = selectedPath === item.path || isSubPathActive(item.path);
          return (
            <button
              key={item.path}
              type="button"
              onClick={() => onNavClick(item)}
              className={`relative flex items-center justify-center rounded-xl transition-all duration-150 shrink-0
                ${
                  usesDoubleRowMobileNav
                    ? "min-w-0 flex-col gap-0 px-1 py-1"
                    : "mx-0.5 min-w-[64px] sm:min-w-[70px] max-w-[76px] flex-col py-1.5 px-1 h-12 sm:h-13"
                }
                ${
                  active
                    ? "text-primary font-semibold bg-primary/15 border border-primary/25 shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/40 border border-transparent"
                }`}
            >
              {item.highlight ? (
                <span className="absolute top-1 right-1 flex items-center justify-center">
                  <span className="absolute inline-flex h-1.5 w-1.5 animate-ping rounded-full bg-blue-600 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-blue-600" />
                </span>
              ) : item.subItems ? (
                <span className="absolute top-1 right-1 flex items-center justify-center">
                  <ChevronUp className="h-2.5 w-2.5 text-muted-foreground/60" />
                </span>
              ) : null}
              <item.icon
                className={`shrink-0 ${
                  usesDoubleRowMobileNav
                    ? "h-3.5 w-3.5 mb-0.5"
                    : "h-4 w-4 mb-0.5"
                }`}
              />
              <span
                className={`truncate text-center block w-full ${
                  usesDoubleRowMobileNav
                    ? "text-[8.5px] leading-tight"
                    : "text-[10px] sm:text-[11px] leading-tight"
                }`}
              >
                {item.shortTitle ?? item.title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};