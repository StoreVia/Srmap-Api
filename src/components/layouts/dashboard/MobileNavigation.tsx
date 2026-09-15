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
      ? "left-0 rounded-r-md border-r"
      : "right-0 rounded-l-md border-l";

  return (
    <nav
      className={`fixed ${edgeClass} top-1/2 z-30 -translate-y-1/2 border-y border-border bg-background/95 py-1 shadow-sm backdrop-blur-sm`}
      aria-label={`${side} mobile navigation`}
    >
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
              className={`relative flex h-7 w-7 items-center justify-center transition-colors ${
                active
                  ? "bg-primary/15 text-primary"
                  : "text-foreground/65 hover:bg-accent hover:text-foreground"
              }`}
            >
              <item.icon className="h-3.5 w-3.5" />
              {item.highlight && (
                <span className="absolute right-1 top-1 h-1 w-1 rounded-full bg-blue-600" />
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
      className="w-full flex flex-col items-center gap-1 py-1.5"
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
            className={`relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg transition-colors ${
              active
                ? "bg-primary/15 text-primary"
                : "text-foreground/65 hover:bg-accent hover:text-foreground"
            }`}
          >
            <item.icon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
            {item.highlight && (
              <span className="absolute right-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-blue-600" />
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
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const isDraggingRef = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now(),
      };
      isDraggingRef.current = false;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current || e.touches.length === 0) return;
    const deltaX = Math.abs(e.touches[0].clientX - touchStartRef.current.x);
    const deltaY = Math.abs(e.touches[0].clientY - touchStartRef.current.y);
    if (deltaX > 7 || deltaY > 7) {
      isDraggingRef.current = true;
    }
  };

  const handleItemClick = (item: MenuItem, e?: React.MouseEvent) => {
    if (isDraggingRef.current) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      return;
    }
    onNavClick(item);
  };

  const handleMobileNavScroll = (e: React.UIEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    try {
      localStorage.setItem(MOBILE_NAV_SCROLL_KEY, String(e.currentTarget.scrollLeft));
    } catch (error) {}
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
    } catch (error) {}
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
    <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-background/95 backdrop-blur-sm pt-1 pb-[max(1.25rem,env(safe-area-inset-bottom,16px))] select-none">
      <div
        ref={mobileNavScrollRef}
        onScroll={handleMobileNavScroll}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => {
          setTimeout(() => {
            isDraggingRef.current = false;
          }, 80);
        }}
        className={
          usesDoubleRowMobileNav
            ? "grid h-16 sm:h-20 grid-flow-col grid-rows-2 auto-cols-[56px] sm:auto-cols-[68px] gap-px overflow-x-auto no-scrollbar p-1 touch-pan-x"
            : "flex h-14 sm:h-16 items-center overflow-x-auto no-scrollbar px-1 sm:px-2 touch-pan-x"
        }
      >
        {items.map((item) => (
          <button
            key={item.path}
            onClick={(e) => handleItemClick(item, e)}
            className={`relative flex items-center justify-center rounded-lg transition-all duration-200
                ${
                  usesDoubleRowMobileNav
                    ? "min-w-0 flex-col gap-0 px-0.5 py-0"
                    : "mx-0.5 my-0.5 min-w-[54px] sm:min-w-[64px] max-w-[64px] sm:max-w-[72px] flex-col p-1 h-12 sm:h-14 shrink-0"
                }
                ${
                  selectedPath === item.path || isSubPathActive(item.path)
                    ? "text-primary font-semibold bg-primary/15 border border-primary/30 shadow-xs"
                    : "text-foreground/70 hover:text-foreground hover:bg-accent/10 border border-transparent"
                }`}
          >
            {item.highlight ? (
              <span className="absolute top-0.5 right-0.5 flex items-center justify-center">
                <span className="absolute inline-flex h-1.5 w-1.5 animate-ping rounded-full bg-blue-600 opacity-75"></span>
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-blue-600"></span>
              </span>
            ) : item.subItems ? (
              <span className="absolute top-0.5 right-0.5 flex items-center justify-center">
                <ChevronUp className="h-2 w-2 sm:h-2.5 sm:w-2.5 text-foreground/60" />
              </span>
            ) : null}
            <item.icon
              className={`shrink-0 ${
                usesDoubleRowMobileNav ? "h-3 w-3 sm:h-3.5 sm:w-3.5" : "h-3.5 w-3.5 sm:h-4 sm:w-4 mb-0.5"
              }`}
            />
            <span
              className={`truncate text-center block w-full ${
                usesDoubleRowMobileNav
                  ? "max-w-[52px] sm:max-w-[62px] text-[7.5px] sm:text-[8px] leading-tight"
                  : "max-w-[54px] sm:max-w-[64px] text-[8.5px] sm:text-[10px] leading-tight"
              }`}
            >
              {item.shortTitle ?? item.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};