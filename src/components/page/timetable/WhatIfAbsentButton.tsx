"use client";
import * as React from "react";
import { Calculator } from "lucide-react";
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
      variant={isSimulationActive ? "default" : "outline"}
      size={size}
      onClick={onClick}
      className={cn(
        "text-xs font-semibold gap-1 sm:gap-1.5 shadow-sm transition-all shrink-0 h-8 px-2 sm:px-3 whitespace-nowrap",
        isSimulationActive
          ? "bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-700"
          : "hover:border-blue-300 hover:text-blue-700 dark:hover:text-blue-300",
        className
      )}
    >
      <Calculator className="w-3.5 h-3.5 shrink-0" />
      <span className="hidden sm:inline">What If?</span>
      <span className="sm:hidden">What If?</span>
      {isSimulationActive && (
        <Badge
          variant="secondary"
          className="ml-0.5 bg-white text-blue-700 dark:bg-white dark:text-blue-700 px-1 py-0 text-[10px] font-bold"
        >
          {selectedCount}
        </Badge>
      )}
    </Button>
  );
}
