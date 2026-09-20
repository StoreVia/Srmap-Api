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
    <Card className="hover:border-primary/50 transition-colors">
      <CardContent className="p-4 flex flex-col justify-between h-full gap-3">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
              <h4 className="font-semibold text-sm line-clamp-2 leading-tight">
                {resource.title}
              </h4>
            </div>
            <Badge variant="secondary" className="text-xs uppercase shrink-0">
              {resource.fileType}
            </Badge>
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

        <div className="flex items-center justify-between gap-2 pt-2 border-t mt-auto">
          <div className="flex items-center gap-1">
            {onPreview && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs"
                onClick={() => onPreview(resource)}
              >
                <ExternalLink className="h-3.5 w-3.5 mr-1" />
                Preview
              </Button>
            )}
            <a
              href={resource.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 px-2"
            >
              <Download className="h-3.5 w-3.5 mr-1" />
              Download
            </a>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onEdit(resource)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onDelete(resource)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}