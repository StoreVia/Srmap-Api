import React from "react";

export interface SubMenuItem {
  title: string;
  path: string;
}

export interface MenuItem {
  title: string;
  shortTitle?: string;
  path: string;
  group?: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
  subItems?: SubMenuItem[];
}

export interface HoverMenuProps {
  item: MenuItem;
  isVisible: boolean;
  mouseY: number;
  onSelect: (path: string) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  isActive: (path: string) => boolean;
}

export interface MobileSubMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  menuItem: MenuItem | null;
}

export interface MobileNavProps {
  items: MenuItem[];
  selectedPath: string | null;
  isSubPathActive: (path: string) => boolean;
  onClick: (item: MenuItem) => void;
}

export interface MiniMobileNavProps extends MobileNavProps {
  side: "left" | "right";
}