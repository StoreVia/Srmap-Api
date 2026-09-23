import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Download, ExternalLink, FileText, Pencil, Trash2 } from "lucide-react";

export interface ResourceItemData {
  _id?: string;
  id?: string;
  courseCode: string;
  year: string;
  subjectId: string;
  category: "previousYearPapers" | "slidesAndNotes";
  examType?: "mid" | "sem";
  title: string;
  size: string;
  fileType: string;
  downloadUrl: string;
}

interface ResourceCardProps {
  resource: ResourceItemData;
  onEdit: (resource: ResourceItemData) => void;
  onDelete: (resource: ResourceItemData) => void;
  onPreview?: (resource: ResourceItemData) => void;
}

export function ResourceCard({
  resource,
  onEdit,
  onDelete,
  onPreview,
}: ResourceCardProps) {
  return (
    <Card className="hover:border-primary/50 transition-colors flex flex-col overflow-hidden">
      <CardContent className="p-4 flex flex-col justify-between h-full gap-3">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 min-w-0 flex-1">
              <FileText className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <h4 className="font-semibold text-sm line-clamp-2 leading-tight">
                {resource.title}
              </h4>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <Badge variant="secondary" className="text-xs uppercase">
                {resource.fileType}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                onClick={() => onEdit(resource)}
                title="Edit resource"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-destructive/80 hover:text-destructive hover:bg-destructive/10"
                onClick={() => onDelete(resource)}
                title="Delete resource"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>Size: {resource.size}</span>
            {resource.examType && (
              <Badge variant="outline" className="text-[10px] uppercase">
                {resource.examType === "mid" ? "Mid Term" : "Semester"}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2.5 border-t mt-auto">
          {onPreview && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-8 text-xs"
              onClick={() => onPreview(resource)}
            >
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
              Preview
            </Button>
          )}
          <a
            href={resource.downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center rounded-md text-xs font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Download
          </a>
        </div>
      </CardContent>
    </Card>
  );
}