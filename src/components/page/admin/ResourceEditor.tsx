"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import API from "@/lib/api/axiosClient";
import { toast } from "@/hooks/utils/useToast";
import { ResourceCard, ResourceItemData } from "./ResourceCard";
import { ResourceDeleteConfirm } from "./ResourceDeleteConfirm";
import { ResourceFormDialog, FormTargetType } from "./ResourceFormDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle, DialogWindowClose } from "@/components/ui/dialog";
import { BookOpen, FileText, Plus, Pencil, Trash2, Search, RefreshCw, FolderOpen, Layers } from "lucide-react";

interface CourseItem {
  _id: string;
  year: string;
  code: string;
  name: string;
}

interface SubjectItem {
  _id: string;
  year: string;
  courseCode: string;
  code: string;
  name: string;
}

export function ResourceEditor() {
  const [selectedYear, setSelectedYear] = useState<string>("1");
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");

  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [resources, setResources] = useState<ResourceItemData[]>([]);

  const [stats, setStats] = useState({
    totalCourses: 0,
    totalSubjects: 0,
    totalResources: 0,
  });

  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [subjectSearch, setSubjectSearch] = useState("");
  const [resourceSearch, setResourceSearch] = useState("");

  const [activeTab, setActiveTab] = useState<"previousYearPapers" | "slidesAndNotes">("previousYearPapers");
  const [examTypeTab, setExamTypeTab] = useState<"mid" | "sem">("mid");

  const [formDialog, setFormDialog] = useState<{
    open: boolean;
    type: FormTargetType;
    mode: "create" | "edit";
    initialData?: any;
  }>({
    open: false,
    type: "course",
    mode: "create",
  });

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    type: FormTargetType;
    targetId: string;
    title: string;
    description: string;
    warning?: string;
  }>({
    open: false,
    type: "course",
    targetId: "",
    title: "",
    description: "",
  });

  const [previewResource, setPreviewResource] = useState<ResourceItemData | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/resources/list");
      const data = res.data;

      if (data.success) {
        const fetchedCourses: CourseItem[] = data.data.courses || [];
        const fetchedSubjects: SubjectItem[] = data.data.subjects || [];
        const fetchedResources: ResourceItemData[] = data.data.resources || [];

        setCourses(fetchedCourses);
        setSubjects(fetchedSubjects);
        setResources(fetchedResources);
        if (data.data.stats) {
          setStats(data.data.stats);
        }
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to load resource data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const yearCourses = useMemo(() => {
    return courses.filter((c) => c.year === selectedYear);
  }, [courses, selectedYear]);

  useEffect(() => {
    if (yearCourses.length > 0) {
      const stillExists = yearCourses.some((c) => c.code === selectedCourse);
      if (!stillExists) {
        setSelectedCourse(yearCourses[0].code);
      }
    } else {
      setSelectedCourse("");
    }
  }, [yearCourses, selectedCourse]);

  const courseSubjects = useMemo(() => {
    return subjects.filter(
      (s) => s.year === selectedYear && s.courseCode === selectedCourse
    );
  }, [subjects, selectedYear, selectedCourse]);

  const filteredSubjects = useMemo(() => {
    if (!subjectSearch.trim()) return courseSubjects;
    const q = subjectSearch.toLowerCase().trim();
    return courseSubjects.filter(
      (s) => s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
    );
  }, [courseSubjects, subjectSearch]);

  useEffect(() => {
    if (courseSubjects.length > 0) {
      const stillExists = courseSubjects.some((s) => s._id === selectedSubjectId);
      if (!stillExists) {
        setSelectedSubjectId(courseSubjects[0]._id);
      }
    } else {
      setSelectedSubjectId("");
    }
  }, [courseSubjects, selectedSubjectId]);

  const activeSubject = useMemo(() => {
    return subjects.find((s) => s._id === selectedSubjectId);
  }, [subjects, selectedSubjectId]);

  const activeSubjectResources = useMemo(() => {
    if (!selectedSubjectId) return [];
    return resources.filter((r) => r.subjectId === selectedSubjectId);
  }, [resources, selectedSubjectId]);

  const filteredMidPapers = useMemo(() => {
    return activeSubjectResources.filter((r) => {
      const isMid = r.category === "previousYearPapers" && r.examType === "mid";
      if (!isMid) return false;
      if (!resourceSearch.trim()) return true;
      return r.title.toLowerCase().includes(resourceSearch.toLowerCase().trim());
    });
  }, [activeSubjectResources, resourceSearch]);

  const filteredSemPapers = useMemo(() => {
    return activeSubjectResources.filter((r) => {
      const isSem = r.category === "previousYearPapers" && r.examType === "sem";
      if (!isSem) return false;
      if (!resourceSearch.trim()) return true;
      return r.title.toLowerCase().includes(resourceSearch.toLowerCase().trim());
    });
  }, [activeSubjectResources, resourceSearch]);

  const filteredSlidesAndNotes = useMemo(() => {
    return activeSubjectResources.filter((r) => {
      const isSlide = r.category === "slidesAndNotes";
      if (!isSlide) return false;
      if (!resourceSearch.trim()) return true;
      return r.title.toLowerCase().includes(resourceSearch.toLowerCase().trim());
    });
  }, [activeSubjectResources, resourceSearch]);

  const handleFormSubmit = async (formData: any) => {
    try {
      setFormLoading(true);
      const isEdit = formDialog.mode === "edit";

      if (formDialog.type === "course") {
        if (isEdit) {
          await API.put("/admin/resources/courses", formData);
          toast({ title: "Success", description: "Course updated successfully" });
        } else {
          await API.post("/admin/resources/courses", formData);
          toast({ title: "Success", description: "Course added successfully" });
        }
      } else if (formDialog.type === "subject") {
        if (isEdit) {
          await API.put("/admin/resources/subjects", formData);
          toast({ title: "Success", description: "Subject updated successfully" });
        } else {
          await API.post("/admin/resources/subjects", formData);
          toast({ title: "Success", description: "Subject added successfully" });
        }
      } else if (formDialog.type === "resource") {
        if (isEdit) {
          await API.put("/admin/resources/resources", formData);
          toast({ title: "Success", description: "Resource updated successfully" });
        } else {
          await API.post("/admin/resources/resources", formData);
          toast({ title: "Success", description: "Resource added successfully" });
        }
      }

      setFormDialog((prev) => ({ ...prev, open: false }));
      await fetchData();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Operation failed",
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleteLoading(true);

      if (deleteDialog.type === "course") {
        await API.delete(`/admin/resources/courses?id=${deleteDialog.targetId}`);
        toast({ title: "Success", description: "Course and associated subjects/resources deleted" });
      } else if (deleteDialog.type === "subject") {
        await API.delete(`/admin/resources/subjects?id=${deleteDialog.targetId}`);
        toast({ title: "Success", description: "Subject and associated resources deleted" });
      } else if (deleteDialog.type === "resource") {
        await API.delete(`/admin/resources/resources?id=${deleteDialog.targetId}`);
        toast({ title: "Success", description: "Resource deleted" });
      }

      setDeleteDialog((prev) => ({ ...prev, open: false }));
      await fetchData();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Delete failed",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const getPreviewUrl = (url: string) => {
    const match = url.match(/\/d\/(.*)\/view/);
    if (match && match[1]) {
      return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
    return url;
  };

  const openAddCourse = () => {
    setFormDialog({
      open: true,
      type: "course",
      mode: "create",
    });
  };

  const openEditCourse = (course: CourseItem) => {
    setFormDialog({
      open: true,
      type: "course",
      mode: "edit",
      initialData: course,
    });
  };

  const openDeleteCourse = (course: CourseItem) => {
    setDeleteDialog({
      open: true,
      type: "course",
      targetId: course._id,
      title: `Delete Course: ${course.code}?`,
      description: `Are you sure you want to delete course ${course.name} (${course.code}) for Year ${course.year}?`,
      warning: "WARNING: Deleting this course will permanently remove all associated subjects and resources for this year.",
    });
  };

  const openAddSubject = () => {
    if (!selectedCourse) {
      toast({ title: "Notice", description: "Please create or select a course first." });
      return;
    }
    setFormDialog({
      open: true,
      type: "subject",
      mode: "create",
      initialData: null,
    });
  };

  const openEditSubject = (subject: SubjectItem) => {
    setFormDialog({
      open: true,
      type: "subject",
      mode: "edit",
      initialData: subject,
    });
  };

  const openDeleteSubject = (subject: SubjectItem) => {
    setDeleteDialog({
      open: true,
      type: "subject",
      targetId: subject._id,
      title: `Delete Subject: ${subject.code}?`,
      description: `Are you sure you want to delete ${subject.name} (${subject.code})?`,
      warning: "WARNING: Deleting this subject will permanently remove all attached resource files.",
    });
  };

  const openAddResource = () => {
    if (!selectedSubjectId) {
      toast({ title: "Notice", description: "Please select a subject first." });
      return;
    }
    setFormDialog({
      open: true,
      type: "resource",
      mode: "create",
    });
  };

  const openEditResource = (resource: ResourceItemData) => {
    setFormDialog({
      open: true,
      type: "resource",
      mode: "edit",
      initialData: resource,
    });
  };

  const openDeleteResource = (resource: ResourceItemData) => {
    setDeleteDialog({
      open: true,
      type: "resource",
      targetId: resource._id || resource.id || "",
      title: `Delete Resource: ${resource.title}?`,
      description: `Are you sure you want to delete this resource file?`,
    });
  };

  return (
    <Card className="overflow-hidden flex flex-col border shadow-sm">
      <CardHeader className="border-b bg-muted/20 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <FolderOpen className="h-5 w-5 text-primary" />
              Resources Hub Management
            </CardTitle>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              disabled={loading}
              className="h-8 text-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              1. Select Academic Year
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {["1", "2", "3", "4"].map((year) => {
              const isSelected = selectedYear === year;
              const count = courses.filter((c) => c.year === year).length;
              return (
                <Button
                  key={year}
                  variant={isSelected ? "default" : "outline"}
                  className="h-10 text-xs sm:text-sm font-medium flex items-center justify-center gap-1.5"
                  onClick={() => setSelectedYear(year)}
                >
                  <span>Year {year}</span>
                  <Badge
                    variant={isSelected ? "secondary" : "outline"}
                    className="text-[10px] px-1.5 py-0 h-4"
                  >
                    {count}
                  </Badge>
                </Button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              2. Courses for Year {selectedYear}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-primary"
              onClick={openAddCourse}
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Course
            </Button>
          </div>

          {loading ? (
            <div className="flex gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
            </div>
          ) : yearCourses.length === 0 ? (
            <div className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
              No courses configured for Year {selectedYear}. Click "Add Course" above.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {yearCourses.map((course) => {
                const isSelected = selectedCourse === course.code;
                const subjectCount = subjects.filter(
                  (s) => s.year === selectedYear && s.courseCode === course.code
                ).length;

                return (
                  <div
                    key={course._id}
                    className={`inline-flex items-center rounded-lg border text-xs font-medium transition-all ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background hover:bg-muted/50 border-input"
                    }`}
                  >
                    <button
                      type="button"
                      className="px-3 py-2 flex items-center gap-2 cursor-pointer focus:outline-none"
                      onClick={() => setSelectedCourse(course.code)}
                    >
                      <span>{course.code}</span>
                      <Badge
                        variant={isSelected ? "secondary" : "outline"}
                        className="text-[10px] px-1 py-0 h-4"
                      >
                        {subjectCount}
                      </Badge>
                    </button>
                    <div className="flex items-center border-l border-inherit pr-1.5 pl-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-6 w-6 p-0 ${
                          isSelected ? "hover:bg-primary-foreground/20 text-inherit" : ""
                        }`}
                        onClick={() => openEditCourse(course)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-6 w-6 p-0 text-red-500 hover:text-red-700 ${
                          isSelected ? "hover:bg-primary-foreground/20" : ""
                        }`}
                        onClick={() => openDeleteCourse(course)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {selectedCourse && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2 border-t">
            <div className="lg:col-span-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Subjects ({courseSubjects.length})
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={openAddSubject}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Subject
                </Button>
              </div>

              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Filter subjects..."
                  value={subjectSearch}
                  onChange={(e) => setSubjectSearch(e.target.value)}
                  className="pl-8 h-8 text-xs"
                />
              </div>

              <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
                {filteredSubjects.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
                    No subjects found.
                  </div>
                ) : (
                  filteredSubjects.map((subject) => {
                    const isSelected = selectedSubjectId === subject._id;
                    const resCount = resources.filter((r) => r.subjectId === subject._id).length;

                    return (
                      <div
                        key={subject._id}
                        className={`p-2.5 rounded-lg border text-left transition-all flex items-start justify-between gap-2 cursor-pointer ${
                          isSelected
                            ? "border-primary bg-primary/5 dark:bg-primary/10"
                            : "hover:bg-muted/40"
                        }`}
                        onClick={() => setSelectedSubjectId(subject._id)}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-xs text-foreground">
                              {subject.code}
                            </span>
                            <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                              {resCount} files
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                            {subject.name}
                          </p>
                        </div>

                        <div
                          className="flex items-center gap-0.5 shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                            onClick={() => openEditSubject(subject)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-destructive/80 hover:text-destructive"
                            onClick={() => openDeleteSubject(subject)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="lg:col-span-8 space-y-4">
              {activeSubject ? (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-muted/30 rounded-lg border">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary">
                          {activeSubject.code}
                        </span>
                        <h3 className="text-sm font-semibold">{activeSubject.name}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Year {selectedYear} • {selectedCourse} • {activeSubjectResources.length} total files
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={openAddResource}
                        className="h-8 text-xs"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" /> Add Resource File
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <Tabs
                      value={activeTab}
                      onValueChange={(val: any) => setActiveTab(val)}
                      className="w-full sm:w-auto"
                    >
                      <TabsList className="grid grid-cols-2 w-full sm:w-auto">
                        <TabsTrigger value="previousYearPapers" className="text-xs">
                          Previous Papers ({filteredMidPapers.length + filteredSemPapers.length})
                        </TabsTrigger>
                        <TabsTrigger value="slidesAndNotes" className="text-xs">
                          Slides & Notes ({filteredSlidesAndNotes.length})
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>

                    <div className="relative w-full sm:w-56">
                      <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        placeholder="Search files..."
                        value={resourceSearch}
                        onChange={(e) => setResourceSearch(e.target.value)}
                        className="pl-8 h-8 text-xs"
                      />
                    </div>
                  </div>

                  {activeTab === "previousYearPapers" && (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Button
                          variant={examTypeTab === "mid" ? "default" : "outline"}
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => setExamTypeTab("mid")}
                        >
                          Mid Term Papers ({filteredMidPapers.length})
                        </Button>
                        <Button
                          variant={examTypeTab === "sem" ? "default" : "outline"}
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => setExamTypeTab("sem")}
                        >
                          Semester Papers ({filteredSemPapers.length})
                        </Button>
                      </div>

                      {examTypeTab === "mid" && (
                        <div>
                          {filteredMidPapers.length === 0 ? (
                            <div className="rounded-lg border border-dashed p-8 text-center text-xs text-muted-foreground">
                              <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
                              <p>No Mid Term papers added yet.</p>
                              <Button
                                variant="link"
                                size="sm"
                                className="text-xs mt-1"
                                onClick={openAddResource}
                              >
                                Click here to add one
                              </Button>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {filteredMidPapers.map((item) => (
                                <ResourceCard
                                  key={item._id || item.id}
                                  resource={item}
                                  onEdit={openEditResource}
                                  onDelete={openDeleteResource}
                                  onPreview={(r) => setPreviewResource(r)}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {examTypeTab === "sem" && (
                        <div>
                          {filteredSemPapers.length === 0 ? (
                            <div className="rounded-lg border border-dashed p-8 text-center text-xs text-muted-foreground">
                              <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
                              <p>No Semester papers added yet.</p>
                              <Button
                                variant="link"
                                size="sm"
                                className="text-xs mt-1"
                                onClick={openAddResource}
                              >
                                Click here to add one
                              </Button>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {filteredSemPapers.map((item) => (
                                <ResourceCard
                                  key={item._id || item.id}
                                  resource={item}
                                  onEdit={openEditResource}
                                  onDelete={openDeleteResource}
                                  onPreview={(r) => setPreviewResource(r)}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "slidesAndNotes" && (
                    <div>
                      {filteredSlidesAndNotes.length === 0 ? (
                        <div className="rounded-lg border border-dashed p-8 text-center text-xs text-muted-foreground">
                          <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
                          <p>No Slides & Notes added yet.</p>
                          <Button
                            variant="link"
                            size="sm"
                            className="text-xs mt-1"
                            onClick={openAddResource}
                          >
                            Click here to add one
                          </Button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {filteredSlidesAndNotes.map((item) => (
                            <ResourceCard
                              key={item._id || item.id}
                              resource={item}
                              onEdit={openEditResource}
                              onDelete={openDeleteResource}
                              onPreview={(r) => setPreviewResource(r)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed p-10 text-center text-xs text-muted-foreground">
                  <Layers className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p>Select a subject from the left list or create a new subject to manage resources.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <ResourceFormDialog
        open={formDialog.open}
        onOpenChange={(open) => setFormDialog((prev) => ({ ...prev, open }))}
        type={formDialog.type}
        mode={formDialog.mode}
        initialData={formDialog.initialData}
        contextData={{
          year: selectedYear,
          courseCode: selectedCourse,
          subjectId: selectedSubjectId,
        }}
        onSubmit={handleFormSubmit}
        loading={formLoading}
      />

      <ResourceDeleteConfirm
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog((prev) => ({ ...prev, open }))}
        title={deleteDialog.title}
        description={deleteDialog.description}
        warning={deleteDialog.warning}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />

      <Dialog open={!!previewResource} onOpenChange={() => setPreviewResource(null)}>
        <DialogContent className="max-w-5xl w-full h-[80vh] p-0 overflow-hidden">
          <DialogTitle className="sr-only">Preview Resource</DialogTitle>
          <DialogWindowClose
            className="bg-red-500 hover:bg-red-600 text-white p-1 rounded"
            position="top-left"
            title="Close preview"
          />
          <iframe
            src={previewResource ? getPreviewUrl(previewResource.downloadUrl) : ""}
            className="w-full h-full border-0"
            allow="autoplay"
            title={previewResource ? `Preview of ${previewResource.title}` : "Preview"}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
}