"use client";
import React from "react";
import { HoverMenuProps } from "./types";

export const HoverMenu: React.FC<HoverMenuProps> = ({
  item,
  isVisible,
  mouseY,
  onSelect,
  onMouseEnter,
  onMouseLeave,
  isActive,
}) => {
  if (!isVisible) return null;

  return (
    <div
      className="fixed bg-popover border border-border rounded-md shadow-xl z-[9999] min-w-40 py-2"
      style={{
        left: "50px",
        top: `${mouseY - 20}px`,
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="px-3 py-2 text-sm font-medium text-foreground border-b border-border">
        {item.title}
      </div>

      {item.subItems ? (
        item.subItems.map((subItem) => (
          <button
            key={subItem.path}
            onClick={() => onSelect(subItem.path)}
            className={`w-full text-left px-3 py-2 text-sm transition-colors duration-150 ${
              isActive(subItem.path)
                ? "bg-accent text-accent-foreground dark:text-accent-foreground text-black"
                : "hover:bg-accent/50 text-foreground"
            }`}
          >
            {subItem.title}
          </button>
        ))
      ) : (
        <button
          onClick={() => onSelect(item.path)}
          className={`w-full text-left px-3 py-2 text-sm transition-colors duration-150 ${
            isActive(item.path)
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