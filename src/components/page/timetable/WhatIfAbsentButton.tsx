"use client";
import * as React from "react";
import { CalendarX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/shared/utils/functions";
import type { WhatIfAbsentButtonProps } from "@/types/simulation";

export function WhatIfAbsentButton({
  isSimulationActive,
  selectedCount,
  onClick,
  className,
  size = "sm",
}: WhatIfAbsentButtonProps) {
  return (
    <Button
      type="button"
      variant={isSimulationActive ? "destructive" : "outline"}
      size={size}
      onClick={onClick}
      className={cn(
        "text-xs font-semibold gap-1 sm:gap-1.5 shadow-sm transition-all shrink-0 h-8 px-2 sm:px-3 whitespace-nowrap",
        isSimulationActive
          ? "bg-red-600 hover:bg-red-700 text-white"
          : "hover:border-red-300 hover:text-red-700 dark:hover:text-red-300",
        className
      )}
    >
      <CalendarX className="w-3.5 h-3.5 shrink-0" />
      <span className="hidden sm:inline">What If I'm Absent?</span>
      <span className="sm:hidden">Absent?</span>
      {isSimulationActive && (
        <Badge
          variant="secondary"
          className="ml-0.5 bg-white text-red-700 dark:bg-white dark:text-red-700 px-1 py-0 text-[10px] font-bold"
        >
          {selectedCount}
        </Badge>
      )}
    </Button>
  );
}
