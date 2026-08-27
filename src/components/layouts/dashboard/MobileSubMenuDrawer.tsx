"use client";
import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { X } from "lucide-react";
import { MobileSubMenuDrawerProps } from "./types";

export const MobileSubMenuDrawer: React.FC<MobileSubMenuDrawerProps> = ({
  isOpen,
  onClose,
  menuItem,
}) => {
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
                  className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                    isActive(subItem.path)
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
              className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                isActive(menuItem.path)
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