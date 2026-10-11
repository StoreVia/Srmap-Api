"use client";
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { StaffItem } from "@/types/faculty";
import { Maximize2 } from "lucide-react";

interface StaffCardProps {
  staff: StaffItem;
}

export function StaffCard({ staff }: StaffCardProps) {
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const displayImage = staff.imageUrl || "https://www.srmap.edu.in/wp-content/uploads/2025/03/Faculty-Fallback_1.png";

  return (
    <>
      <Card className="w-full overflow-hidden hover:shadow-md transition-all border-border/60 flex flex-col justify-between">
        <CardContent className="p-4 sm:p-5 flex flex-col h-full justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setImageModalOpen(true);
                }}
                className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-muted border border-border flex-shrink-0 hover:ring-2 hover:ring-primary/50 transition-all cursor-pointer group/avatar"
                title="Click to view full photo"
              >
                <img
                  src={displayImage}
                  alt={staff.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity">
                  <Maximize2 className="w-4 h-4 text-white" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base text-foreground leading-snug break-words">
                  {staff.name}
                </h3>
              </div>
            </div>

            <div className="mt-3 space-y-1">
              <p className="text-xs text-primary font-medium leading-normal break-words">
                {staff.designation}
              </p>

              {staff.departments && staff.departments.length > 0 && (
                <p className="text-xs text-muted-foreground mt-0.5 leading-normal break-words">
                  {staff.departments.join(", ")}
                </p>
              )}
            </div>

            <div className="mt-3.5 space-y-2 pt-3 border-t border-border/40 text-xs">
              {staff.phone && (
                <a href={`tel:${staff.phone}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                  <img
                    decoding="async"
                    src="https://www.srmap.edu.in/wp-content/uploads/2025/05/call_icon.svg"
                    className="w-4 h-4 flex-shrink-0"
                    alt="phone"
                  />
                  <span>{staff.phone}</span>
                </a>
              )}

              {staff.email && (
                <a href={`mailto:${staff.email}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground truncate">
                  <img
                    decoding="async"
                    src="https://www.srmap.edu.in/wp-content/uploads/2025/05/mail_icon.svg"
                    className="w-4 h-4 flex-shrink-0"
                    alt="email"
                  />
                  <span className="truncate">{staff.email}</span>
                </a>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
        <DialogContent className="max-w-md p-4 flex flex-col items-center">
          <DialogTitle className="text-base font-bold text-center truncate w-full">
            {staff.name}
          </DialogTitle>
          <div className="w-full max-h-[70vh] rounded-lg overflow-hidden border mt-2 flex items-center justify-center bg-black/5 dark:bg-black/40">
            <img
              src={displayImage}
              alt={staff.name}
              className="w-full h-auto max-h-[70vh] object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
