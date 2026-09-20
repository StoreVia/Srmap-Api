import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/utils/useToast";
import { isValidCourse, isValidSubject, isValidResource } from "@/validators/srmapi/resource";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export type FormTargetType = "course" | "subject" | "resource";

interface ResourceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: FormTargetType;
  mode: "create" | "edit";
  initialData?: any;
  contextData?: {
    year?: string;
    courseCode?: string;
    subjectId?: string;
    yearsList?: string[];
    coursesList?: Array<{ code: string; name: string }>;
    subjectsList?: Array<{ id: string; code: string; name: string }>;
  };
  onSubmit: (formData: any) => Promise<void>;
  loading?: boolean;
}

export function ResourceFormDialog({
  open,
  onOpenChange,
  type,
  mode,
  initialData,
  contextData,
  onSubmit,
  loading = false,
}: ResourceFormDialogProps) {
  const [courseYear, setCourseYear] = useState("1");
  const [courseCode, setCourseCode] = useState("");
  const [courseName, setCourseName] = useState("");

  const [subjectYear, setSubjectYear] = useState("1");
  const [subjectCourseCode, setSubjectCourseCode] = useState("CSE");
  const [subjectCode, setSubjectCode] = useState("");
  const [subjectName, setSubjectName] = useState("");

  const [resYear, setResYear] = useState("1");
  const [resCourseCode, setResCourseCode] = useState("CSE");
  const [resSubjectId, setResSubjectId] = useState("");
  const [resCategory, setResCategory] = useState<"previousYearPapers" | "slidesAndNotes">("previousYearPapers");
  const [resExamType, setResExamType] = useState<"mid" | "sem">("mid");
  const [resTitle, setResTitle] = useState("");
  const [resSize, setResSize] = useState("");
  const [resFileType, setResFileType] = useState("pdf");
  const [resDownloadUrl, setResDownloadUrl] = useState("");

  useEffect(() => {
    if (!open) return;

    if (type === "course") {
      if (mode === "edit" && initialData) {
        setCourseYear(initialData.year || "1");
        setCourseCode(initialData.code || "");
        setCourseName(initialData.name || "");
      } else {
        setCourseYear(contextData?.year || "1");
        setCourseCode("");
        setCourseName("");
      }
    } else if (type === "subject") {
      if (mode === "edit" && initialData) {
        setSubjectYear(initialData.year || "1");
        setSubjectCourseCode(initialData.courseCode || "CSE");
        setSubjectCode(initialData.code || "");
        setSubjectName(initialData.name || "");
      } else {
        setSubjectYear(contextData?.year || "1");
        setSubjectCourseCode(contextData?.courseCode || "CSE");
        setSubjectCode("");
        setSubjectName("");
      }
    } else if (type === "resource") {
      if (mode === "edit" && initialData) {
        setResYear(initialData.year || "1");
        setResCourseCode(initialData.courseCode || "CSE");
        setResSubjectId(initialData.subjectId || "");
        setResCategory(initialData.category || "previousYearPapers");
        setResExamType(initialData.examType || "mid");
        setResTitle(initialData.title || "");
        setResSize(initialData.size || "");
        setResFileType(initialData.fileType || "pdf");
        setResDownloadUrl(initialData.downloadUrl || "");
      } else {
        setResYear(contextData?.year || "1");
        setResCourseCode(contextData?.courseCode || "CSE");
        setResSubjectId(contextData?.subjectId || "");
        setResCategory("previousYearPapers");
        setResExamType("mid");
        setResTitle("");
        setResSize("");
        setResFileType("pdf");
        setResDownloadUrl("");
      }
    }
  }, [open, type, mode, initialData, contextData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (type === "course") {
      const payload = {
        ...(mode === "edit" ? { id: initialData?._id || initialData?.id } : {}),
        year: courseYear.trim(),
        code: courseCode.trim().toUpperCase(),
        name: courseName.trim(),
      };

      const [valid, errorMsg] = isValidCourse(payload);
      if (!valid) {
        toast({ title: "Validation Error", description: errorMsg || "Invalid input", variant: "destructive" });
        return;
      }

      await onSubmit(payload);
    } else if (type === "subject") {
      const payload = {
        ...(mode === "edit" ? { id: initialData?._id || initialData?.id } : {}),
        year: subjectYear.trim(),
        courseCode: subjectCourseCode.trim().toUpperCase(),
        code: subjectCode.trim(),
        name: subjectName.trim(),
      };

      const [valid, errorMsg] = isValidSubject(payload);
      if (!valid) {
        toast({ title: "Validation Error", description: errorMsg || "Invalid input", variant: "destructive" });
        return;
      }

      await onSubmit(payload);
    } else if (type === "resource") {
      const payload = {
        ...(mode === "edit" ? { id: initialData?._id || initialData?.id } : {}),
        year: resYear.trim(),
        courseCode: resCourseCode.trim().toUpperCase(),
        subjectId: resSubjectId.trim(),
        category: resCategory,
        ...(resCategory === "previousYearPapers" ? { examType: resExamType } : {}),
        title: resTitle.trim(),
        size: resSize.trim(),
        fileType: resFileType.trim().toLowerCase(),
        downloadUrl: resDownloadUrl.trim(),
      };

      const [valid, errorMsg] = isValidResource(payload);
      if (!valid) {
        toast({ title: "Validation Error", description: errorMsg || "Invalid input", variant: "destructive" });
        return;
      }

      await onSubmit(payload);
    }
  };

  const getTitle = () => {
    const action = mode === "create" ? "Add" : "Edit";
    if (type === "course") return `${action} Course`;
    if (type === "subject") return `${action} Subject`;
    return `${action} Resource File`;
  };

  const getDescription = () => {
    if (type === "course") return "Manage course branch details and academic year.";
    if (type === "subject") return "Manage subject code and name for a selected course and year.";
    return "Provide file details and a direct Google Drive or download URL.";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {type === "course" && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Academic Year</label>
                <Select value={courseYear} onValueChange={setCourseYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Year 1</SelectItem>
                    <SelectItem value="2">Year 2</SelectItem>
                    <SelectItem value="3">Year 3</SelectItem>
                    <SelectItem value="4">Year 4</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Course Code</label>
                <Input
                  placeholder="e.g. CSE, ECE, MECH"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value.toUpperCase())}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Course Full Name</label>
                <Input
                  placeholder="e.g. Computer Science & Engineering"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          {type === "subject" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Year</label>
                  <Select value={subjectYear} onValueChange={setSubjectYear}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Year 1</SelectItem>
                      <SelectItem value="2">Year 2</SelectItem>
                      <SelectItem value="3">Year 3</SelectItem>
                      <SelectItem value="4">Year 4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Course</label>
                  <Input
                    placeholder="e.g. CSE"
                    value={subjectCourseCode}
                    onChange={(e) => setSubjectCourseCode(e.target.value.toUpperCase())}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Subject Code</label>
                <Input
                  placeholder="e.g. CSE 101, FIC 103"
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Subject Name</label>
                <Input
                  placeholder="e.g. Fundamentals of Computing"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          {type === "resource" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Resource Category</label>
                  <Select
                    value={resCategory}
                    onValueChange={(val: "previousYearPapers" | "slidesAndNotes") => setResCategory(val)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="previousYearPapers">Previous Year Papers</SelectItem>
                      <SelectItem value="slidesAndNotes">Slides & Notes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {resCategory === "previousYearPapers" && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Exam Type</label>
                    <Select
                      value={resExamType}
                      onValueChange={(val: "mid" | "sem") => setResExamType(val)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mid">Mid Term</SelectItem>
                        <SelectItem value="sem">Semester</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Resource Title</label>
                <Input
                  placeholder="e.g. 2023 Mid Term Paper, Unit 1 Lecture Slides"
                  value={resTitle}
                  onChange={(e) => setResTitle(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">File Size</label>
                  <Input
                    placeholder="e.g. 2.4 MB, 500 KB"
                    value={resSize}
                    onChange={(e) => setResSize(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">File Type</label>
                  <Input
                    placeholder="e.g. pdf, pptx, docx"
                    value={resFileType}
                    onChange={(e) => setResFileType(e.target.value.toLowerCase())}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Download / Drive URL</label>
                <Input
                  type="url"
                  placeholder="https://drive.google.com/..."
                  value={resDownloadUrl}
                  onChange={(e) => setResDownloadUrl(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : mode === "create" ? "Add" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}