"use client";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/useMobile";
import React, { useState, useEffect } from "react";
import API from "@/components/client/api/AxiosClient";
import { Download, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle, DialogWindowClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Course = {
    name: string;
    code: string;
};

type Subject = {
    id: number;
    code: string;
    name: string;
};

type Resource = {
    id: number;
    title: string;
    size: string;
    type: string;
    downloadUrl: string;
};

type SubjectResources = {
    previousYearPapers?: {
        mid?: Resource[];
        sem?: Resource[];
    };
    slidesAndNotes?: Resource[];
};

const Resources = () => {
    const [selectedCourse, setSelectedCourse] = useState<string>("CSE");
    const [selectedYear, setSelectedYear] = useState<string>("1");
    const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
    const [activeResourceType, setActiveResourceType] = useState<"previousYearPapers" | "slidesAndNotes">("previousYearPapers");
    const [previewResource, setPreviewResource] = useState<Resource | null>(null);
    const [showSubjects, setShowSubjects] = useState<boolean>(true);
    const isMobile = useIsMobile();
    const [selectedExamType, setSelectedExamType] = useState<"mid" | "sem">("mid");

    const [courses, setCourses] = useState<Record<string, Course>>({});
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [resources, setResources] = useState<SubjectResources | null>(null);
    const [loading, setLoading] = useState({
        courses: false,
        subjects: false,
        resources: false
    });

    const fetchCourses = async (year: string) => {
        setLoading(prev => ({ ...prev, courses: true }));
        try {
            const response = await API.get(`/resources/courses?year=${year}`);
            const data = response.data;
            if (data.success) {
                setCourses(data.data);
            } else {
                setCourses({});
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
            setCourses({});
        } finally {
            setLoading(prev => ({ ...prev, courses: false }));
        }
    };

    const fetchSubjects = async (course: string, year: string) => {
        setLoading(prev => ({ ...prev, subjects: true }));
        try {
            const response = await API.get(`/resources/subjects?course=${course}&year=${year}`);
            const data = response.data;
            if (data.success) {
                setSubjects(data.data);
            } else {
                setSubjects([]);
            }
        } catch (error) {
            console.error('Error fetching subjects:', error);
            setSubjects([]);
        } finally {
            setLoading(prev => ({ ...prev, subjects: false }));
        }
    };

    const fetchResources = async (course: string, year: string, subjectId: number) => {
        setLoading(prev => ({ ...prev, resources: true }));
        try {
            const response = await API.get(`/resources/resource?course=${course}&year=${year}&subjectId=${subjectId}`);
            const data = response.data;
            if (data.success) {
                setResources(data.data);
            } else {
                setResources(null);
            }
        } catch (error) {
            console.error('Error fetching resources:', error);
            setResources(null);
        } finally {
            setLoading(prev => ({ ...prev, resources: false }));
        }
    };

    useEffect(() => {
        if (selectedYear) {
            fetchCourses(selectedYear);
            setSelectedCourse("");
            setSelectedSubject(null);
            setSubjects([]);
            setResources(null);
        }
    }, [selectedYear]);

    useEffect(() => {
        if (selectedCourse && selectedYear) {
            fetchSubjects(selectedCourse, selectedYear);
            setSelectedSubject(null);
            setResources(null);
        }
    }, [selectedCourse, selectedYear]);

    useEffect(() => {
        if (selectedCourse && selectedYear && selectedSubject) {
            fetchResources(selectedCourse, selectedYear, selectedSubject);
        }
    }, [selectedCourse, selectedYear, selectedSubject]);

    const getPreviewUrl = (url: string) => {
        const match = url.match(/\/d\/(.*)\/view/);
        if (match && match[1]) {
            return `https://drive.google.com/file/d/${match[1]}/preview`;
        }
        return url;
    };

    const handlePreview = (resource: Resource) => {
        setPreviewResource(resource);
    };

    const handleDownload = (resource: Resource) => {
        const link = document.createElement("a");
        link.href = resource.downloadUrl;
        link.download = resource.title;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div>
            <div className="mb-4 flex flex-col md:flex-row md:gap-4">
                <div className="flex-1 min-w-0">
                    <label htmlFor="yearSelect" className="block text-sm font-medium mb-1">
                        Select Year
                    </label>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger id="yearSelect" className="w-full">
                            <SelectValue placeholder="Select Year" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="1">Year 1</SelectItem>
                                <SelectItem value="2">Year 2</SelectItem>
                                {/* <SelectItem value="3">Year 3</SelectItem>
                                <SelectItem value="4">Year 4</SelectItem> */}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex-1 min-w-0">
                    <label htmlFor="courseSelect" className="block text-sm font-medium mb-1">
                        Select Course
                    </label>
                    <Select
                        value={selectedCourse}
                        onValueChange={setSelectedCourse}
                        disabled={loading.courses || Object.keys(courses).length === 0}
                    >
                        <SelectTrigger id="courseSelect" className="w-full">
                            <SelectValue
                                placeholder={
                                    loading.courses
                                        ? "Loading courses..."
                                        : Object.keys(courses).length === 0
                                            ? "No courses available"
                                            : "Select Course"
                                }
                            />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {Object.entries(courses).map(([code, course]) => (
                                    <SelectItem key={code} value={code}>
                                        {course.code} - {course.name}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="md:hidden mb-4">
                <Button
                    variant="outline"
                    className="w-full flex justify-between items-center"
                    onClick={() => setShowSubjects(!showSubjects)}
                    disabled={!selectedCourse}
                >
                    <span>
                        {selectedSubject
                            ? `${subjects.find((s) => s.id === selectedSubject)?.code || "Select Subject"}`
                            : "Select Subject"}
                    </span>
                    {showSubjects ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                <div className={`w-full md:w-1/3 lg:w-1/4 border border-primary/20 rounded-lg ${showSubjects ? "block" : "hidden md:block"}`}>
                    <div className="space-y-2 mt-4 max-h-[50vh] md:max-h-[70vh] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500">
                        <h3 className="font-medium ml-6 text-lg">Subjects</h3>
                        {!selectedCourse ? (
                            <div className="text-center py-4 text-gray-500">
                                Select a course to view subjects
                            </div>
                        ) : loading.subjects ? (
                            <div className="flex justify-center py-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-university-700"></div>
                            </div>
                        ) : subjects.length > 0 ? (
                            subjects.map((subject) => (
                                <div
                                    key={subject.id}
                                    className={`p-3 border ml-4 rounded-md cursor-pointer transition-colors ${selectedSubject === subject.id
                                        ? "bg-university-700 text-white"
                                        : "hover:bg-gray-100 hover:dark:bg-gray-800"
                                        }`}
                                    onClick={() => {
                                        setSelectedSubject(subject.id);
                                        if (isMobile) setShowSubjects(false);
                                    }}
                                >
                                    <p className="font-medium">{subject.code}</p>
                                    <p className="text-sm">{subject.name}</p>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-4 text-gray-500">
                                No subjects found for this course
                            </div>
                        )}
                    </div>
                </div>

                <div className={`w-full md:w-2/3 lg:w-3/4 ${!showSubjects || isMobile ? "block" : "hidden md:block"}`}>
                    {!selectedCourse ? (
                        <div className="flex flex-col items-center justify-center h-64 border border-primary/20 rounded-lg text-gray-500">
                            <FileText className="h-12 w-12 mb-2 opacity-50" />
                            <p>Select a course to view resources</p>
                        </div>
                    ) : !selectedSubject ? (
                        <div className="flex flex-col items-center justify-center h-64 border border-primary/20 rounded-lg text-gray-500 px-4 text-center">
                            <FileText className="h-12 w-12 mb-2 opacity-50" />
                            <p className="mt-2">Select a subject to view available resources</p>
                        </div>
                    ) : (
                        <div>
                            <h3 className="text-lg sm:text-xl font-semibold mb-4 break-words">
                                {subjects.find((s) => s.id === selectedSubject)?.code} - {" "}
                                {subjects.find((s) => s.id === selectedSubject)?.name}
                            </h3>

                            {loading.resources ? (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-university-700"></div>
                                </div>
                            ) : resources ? (
                                <Tabs
                                    value={activeResourceType}
                                    onValueChange={(val) => setActiveResourceType(val as "previousYearPapers" | "slidesAndNotes")}
                                    className="w-full"
                                >
                                    <TabsList className="mb-6 w-full grid grid-cols-2 h-auto">
                                        <TabsTrigger value="previousYearPapers" className="py-2 px-1 text-xs sm:text-sm">
                                            Previous Papers
                                        </TabsTrigger>
                                        <TabsTrigger value="slidesAndNotes" className="py-2 px-1 text-xs sm:text-sm">
                                            Slides & Notes
                                        </TabsTrigger>
                                    </TabsList>

                                    {/* Rest of the TabsContent remains the same as before */}
                                    <TabsContent value="previousYearPapers" className="mt-0">
                                        {resources.previousYearPapers ? (
                                            <div>
                                                <div className="mb-4">
                                                    <label className="block text-sm font-medium mb-1">
                                                        Select Exam Type
                                                    </label>
                                                    <Select
                                                        value={selectedExamType}
                                                        onValueChange={(val) => setSelectedExamType(val as "mid" | "sem")}
                                                    >
                                                        <SelectTrigger className="w-40">
                                                            <SelectValue placeholder="Select Exam" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectGroup>
                                                                <SelectItem value="mid">Mid Semester</SelectItem>
                                                                <SelectItem value="sem">End Semester</SelectItem>
                                                            </SelectGroup>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                                                    {resources.previousYearPapers[selectedExamType]?.length ? (
                                                        resources.previousYearPapers[selectedExamType]!.map((resource) => (
                                                            <Card
                                                                key={resource.id}
                                                                className="transition-all duration-200 hover:shadow-lg"
                                                            >
                                                                <CardHeader className="pb-2">
                                                                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                                                        <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-university-700 flex-shrink-0" />
                                                                        <span className="line-clamp-1">{resource.title}</span>
                                                                    </CardTitle>
                                                                    <CardDescription className="text-xs sm:text-sm">
                                                                        {resource.type.toUpperCase()} - {resource.size}
                                                                    </CardDescription>
                                                                </CardHeader>
                                                                <CardFooter className="flex flex-col sm:flex-row justify-between pt-2 gap-2">
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => handlePreview(resource)}
                                                                        className="w-full"
                                                                    >
                                                                        <FileText className="h-4 w-4 mr-2" /> Preview
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={() => handleDownload(resource)}
                                                                        className="w-full"
                                                                    >
                                                                        <Download className="h-4 w-4 mr-2" /> Download
                                                                    </Button>
                                                                </CardFooter>
                                                            </Card>
                                                        ))
                                                    ) : (
                                                        <div className="col-span-full flex flex-col items-center justify-center h-32 border border-dashed rounded-lg text-gray-500">
                                                            <FileText className="h-8 w-8 mb-2 opacity-50" />
                                                            <p>No {selectedExamType.toUpperCase()} papers available</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-64 border border-dashed rounded-lg text-gray-500">
                                                <FileText className="h-12 w-12 mb-2 opacity-50" />
                                                <p>No Previous Papers Available</p>
                                            </div>
                                        )}
                                    </TabsContent>

                                    <TabsContent value="slidesAndNotes" className="mt-0">
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                                            {resources.slidesAndNotes?.length ? (
                                                resources.slidesAndNotes.map((resource) => (
                                                    <Card
                                                        key={resource.id}
                                                        className="transition-all duration-200 hover:shadow-lg"
                                                    >
                                                        <CardHeader className="pb-2">
                                                            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                                                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-university-700 flex-shrink-0" />
                                                                <span className="line-clamp-1">{resource.title}</span>
                                                            </CardTitle>
                                                            <CardDescription className="text-xs sm:text-sm">
                                                                {resource.type.toUpperCase()} - {resource.size}
                                                            </CardDescription>
                                                        </CardHeader>
                                                        <CardFooter className="flex flex-col sm:flex-row justify-between pt-2 gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handlePreview(resource)}
                                                                className="w-full"
                                                            >
                                                                <FileText className="h-4 w-4 mr-2" /> Preview
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleDownload(resource)}
                                                                className="w-full"
                                                            >
                                                                <Download className="h-4 w-4 mr-2" /> Download
                                                            </Button>
                                                        </CardFooter>
                                                    </Card>
                                                ))
                                            ) : (
                                                <div className="col-span-full flex flex-col items-center justify-center h-32 border border-dashed rounded-lg text-gray-500">
                                                    <FileText className="h-8 w-8 mb-2 opacity-50" />
                                                    <p>No Slides Or Notes Available</p>
                                                </div>
                                            )}
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-64 border border-dashed rounded-lg text-gray-500">
                                    <FileText className="h-12 w-12 mb-2 opacity-50" />
                                    <p>No Resources Uploaded For This Subject Yet!</p>
                                    <p className="text-sm mt-1">Resources Will Be Added Soon!</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={!!previewResource} onOpenChange={() => setPreviewResource(null)}>
                <DialogContent className="max-w-5xl w-full h-[80vh] p-0 overflow-hidden">
                    <DialogTitle className="sr-only">
                        <span>Preview Resource</span>
                    </DialogTitle>
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
        </div>
    );
};

export default Resources;