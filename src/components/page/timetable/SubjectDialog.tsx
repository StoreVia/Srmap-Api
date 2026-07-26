"use client"
import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { MapPin } from "lucide-react"
import AttendanceCard from "@/components/page/attendance/AttendanceCard"
import type { AttendanceShape } from "@/hooks/timetable/useSubjectMaps"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogWindowClose } from "@/components/ui/dialog"

export interface SubjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subject: {
    code: string
    name: string
    venue: string
    day: string
    timeSlot: string
  } | null
  attendance: AttendanceShape | null
}

export function SubjectDialog({
  open,
  onOpenChange,
  subject,
  attendance,
}: SubjectDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-md max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="p-3 border-b">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-base font-semibold truncate">
                {subject?.name}
              </DialogTitle>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 flex-wrap">
                <Badge variant="secondary" className="font-mono text-xs">
                  {subject?.code}
                </Badge>
                <span>•</span>
                <span>{subject?.day}</span>
                <span>•</span>
                <span>{subject?.timeSlot}</span>
                {subject?.venue && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{subject.venue}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            <DialogWindowClose />
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-3">
          {attendance && <AttendanceCard subject={attendance} />}
        </div>
      </DialogContent>
    </Dialog>
  )
}