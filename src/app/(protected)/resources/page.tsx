"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/utils/useMobile";
import { useState, useEffect, useRef } from "react";
import API from "@/lib/api/axiosClient";
import { Download, FileText, ChevronDown, ChevronUp, Search, X, Loader2, ArrowRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle, DialogWindowClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStudentData } from "@/context/StudentContext";

type Course = {
    name: string;
    code: string;
};

type Subject = {
    id: string | number;
    code: string;
    name: string;
    courseCode?: string;
    year?: string;
};

type SearchSubjectResult = {
    id: string;
    code: string;
    name: string;
    courseCode: string;
    year: string;
};

type Resource = {
    id: string | number;
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

function parseSemesterNumber(semStr?: string): number | null {
    if (!semStr) return null;
    const clean = String(semStr).trim().toUpperCase();

    const digitMatch = clean.match(/\d+/);
    if (digitMatch) {
        const num = parseInt(digitMatch[0], 10);
        if (num >= 1 && num <= 8) return num;
    }

    if (/\bVIII\b/i.test(clean) || clean === "VIII") return 8;
    if (/\bVII\b/i.test(clean) || clean === "VII") return 7;
    if (/\bVI\b/i.test(clean) || clean === "VI") return 6;
    if (/\bV\b/i.test(clean) || clean === "V") return 5;
    if (/\bIV\b/i.test(clean) || clean === "IV") return 4;
    if (/\bIII\b/i.test(clean) || clean === "III") return 3;
    if (/\bII\b/i.test(clean) || clean === "II") return 2;
    if (/\bI\b/i.test(clean) || clean === "I") return 1;

    return null;
}

const Resources = () => {
    const { profile, subjects: studentSubjects } = useStudentData();
    const isMobile = useIsMobile();

    const [selectedYear, setSelectedYear] = useState<string>("");
    const [selectedCourse, setSelectedCourse] = useState<string>("");
    const [selectedSubject, setSelectedSubject] = useState<string | number | null>(null);
    const [activeResourceType, setActiveResourceType] = useState<"previousYearPapers" | "slidesAndNotes">("previousYearPapers");
    const [previewResource, setPreviewResource] = useState<Resource | null>(null);
    const [showSubjects, setShowSubjects] = useState<boolean>(true);
    const [selectedExamType, setSelectedExamType] = useState<"mid" | "sem">("mid");

    const [courses, setCourses] = useState<Record<string, Course>>({});
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [resources, setResources] = useState<SubjectResources | null>(null);
    const [loading, setLoading] = useState({
        courses: false,
        subjects: false,
        resources: false
    });

    const [searchQuery, setSearchQuery] = useState("");
    const [searchedTerm, setSearchedTerm] = useState("");
    const [searchResults, setSearchResults] = useState<SearchSubjectResult[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [isSearchActive, setIsSearchActive] = useState(false);

    const yearInitializedRef = useRef(false);

    useEffect(() => {
        if (yearInitializedRef.current || selectedYear) return;

        const rawSem = profile?.semester || studentSubjects?.find((s) => s.semester)?.semester;
        const semNum = parseSemesterNumber(rawSem);
        if (semNum !== null && semNum >= 1 && semNum <= 8) {
            const detectedYear = String(Math.ceil(semNum / 2));
            setSelectedYear(detectedYear);
            fetchCourses(detectedYear);
            yearInitializedRef.current = true;
        }
    }, [profile?.semester, studentSubjects, selectedYear]);

    const fetchCourses = async (year: string) => {
        if (!year) {
            setCourses({});
            return;
        }
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
        if (!course || !year) {
            setSubjects([]);
            return;
        }
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

    const fetchResources = async (course: string, year: string, subjectId: string | number) => {
        if (!course || !year || !subjectId) {
            setResources(null);
            return;
        }
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

    const handleYearChange = (year: string) => {
        setSelectedYear(year);
        setSelectedCourse("");
        setSelectedSubject(null);
        setSubjects([]);
        setResources(null);
        fetchCourses(year);
    };

    const handleCourseChange = (course: string) => {
        setSelectedCourse(course);
        setSelectedSubject(null);
        setResources(null);
        if (selectedYear) {
            fetchSubjects(course, selectedYear);
        }
    };

    useEffect(() => {
        const courseKeys = Object.keys(courses);
        if (courseKeys.length > 0 && !selectedCourse && selectedYear) {
            const defaultCourse = courseKeys.includes("CSE") ? "CSE" : courseKeys[0];
            setSelectedCourse(defaultCourse);
            fetchSubjects(defaultCourse, selectedYear);
        }
    }, [courses, selectedCourse, selectedYear]);

    const handleSubjectClick = (subjectId: string | number) => {
        setSelectedSubject(subjectId);
        if (selectedCourse && selectedYear) {
            fetchResources(selectedCourse, selectedYear, subjectId);
        }
        if (isMobile) setShowSubjects(false);
    };

    const handleSearchSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const trimmed = searchQuery.trim();
        if (!trimmed) {
            setSearchResults([]);
            setIsSearchActive(false);
            return;
        }

        setSearchLoading(true);
        setIsSearchActive(true);
        setSearchedTerm(trimmed);

        try {
            const res = await API.get(`/resources/search?q=${encodeURIComponent(trimmed)}`);
            if (res.data?.success) {
                setSearchResults(res.data.data || []);
            } else {
                setSearchResults([]);
            }
        } catch (err) {
            console.error("Search failed:", err);
            setSearchResults([]);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleClearSearch = () => {
        setSearchQuery("");
        setSearchedTerm("");
        setSearchResults([]);
        setIsSearchActive(false);
    };

    const handleSelectSearchResult = async (result: SearchSubjectResult) => {
        setSelectedYear(result.year);
        setSelectedCourse(result.courseCode);
        setSelectedSubject(result.id);
        setIsSearchActive(false);
        fetchCourses(result.year);
        fetchSubjects(result.courseCode, result.year);
        fetchResources(result.courseCode, result.year, result.id);
        if (isMobile) setShowSubjects(false);
    };

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
    
    const currentSubject = subjects.find((s) => String(s.id) === String(selectedSubject));

    return (
        <div className="space-y-4">
            {/* Top Big Long Search Bar */}
            <form onSubmit={handleSearchSubmit} className="w-full">
                <div className="relative flex items-center w-full">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                    <Input
                        type="text"
                        inputMode="search"
                        enterKeyHint="search"
                        placeholder="Search subjects by code or name across all years (e.g. CSE 102, Physics, Economics)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-11 pr-24 h-12 w-full text-sm rounded-xl border-primary/25 focus-visible:ring-primary shadow-sm [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        {searchQuery && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleClearSearch}
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                                title="Clear search"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                        <Button
                            type="submit"
                            size="sm"
                            disabled={searchLoading || !searchQuery.trim()}
                            className="h-8 px-3 text-xs flex items-center gap-1.5"
                        >
                            {searchLoading ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <Search className="h-3.5 w-3.5" />
                            )}
                            <span>Search</span>
                        </Button>
                    </div>
                </div>
            </form>

            {/* Search Results Overlay / Section */}
            {isSearchActive && (
                <Card className="border-primary/30 shadow-md">
                    <CardHeader className="pb-3 pt-3 px-3 sm:px-4 flex flex-row items-center justify-between gap-2 border-b">
                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                            <Search className="h-4 w-4 text-primary shrink-0" />
                            <CardTitle className="text-xs sm:text-sm font-semibold truncate">
                                Results for &ldquo;{searchedTerm}&rdquo;
                            </CardTitle>
                            {!searchLoading && (
                                <Badge variant="secondary" className="text-[10px] sm:text-xs shrink-0 px-1.5 py-0 h-5">
                                    {searchResults.length}
                                </Badge>
                            )}
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearSearch}
                            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground shrink-0"
                        >
                            <X className="h-3.5 w-3.5 mr-1" /> Close
                        </Button>
                    </CardHeader>
                    <CardContent className="p-4">
                        {searchLoading ? (
                            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                                <Loader2 className="h-6 w-6 animate-spin mb-2 text-university-700" />
                                <p className="text-xs">Searching database across all years...</p>
                            </div>
                        ) : searchResults.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[50vh] overflow-y-auto pr-1">
                                {searchResults.map((result) => {
                                    const isSelected = String(selectedSubject) === String(result.id);
                                    return (
                                        <div
                                            key={result.id}
                                            className={`p-3 rounded-lg border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                                                isSelected
                                                    ? "border-primary bg-primary/10 shadow-sm"
                                                    : "hover:border-primary/50 hover:bg-muted/40"
                                            }`}
                                            onClick={() => handleSelectSearchResult(result)}
                                        >
                                            <div>
                                                <div className="flex items-center justify-between gap-1 mb-1">
                                                    <span className="font-semibold text-sm text-foreground">
                                                        {result.code}
                                                    </span>
                                                    <div className="flex items-center gap-1">
                                                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-normal">
                                                            Year {result.year}
                                                        </Badge>
                                                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-medium">
                                                            {result.courseCode}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-muted-foreground line-clamp-2">
                                                    {result.name}
                                                </p>
                                            </div>
                                            <div className="flex items-center justify-end text-xs font-medium text-primary pt-1 border-t border-muted/40">
                                                <span>View Resources</span>
                                                <ArrowRight className="h-3 w-3 ml-1" />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground text-xs">
                                <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
                                <p>No subjects found matching &ldquo;{searchedTerm}&rdquo; across any year.</p>
                                <p className="mt-1 text-[11px] opacity-75">Try searching with a subject code like &ldquo;CSE 102&rdquo; or keyword like &ldquo;Physics&rdquo;.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Year & Course Selectors */}
            <div className="flex flex-col md:flex-row md:gap-4">
                <div className="flex-1 min-w-0">
                    <label htmlFor="yearSelect" className="block text-sm font-medium mb-1">
                        Select Year
                    </label>
                    <Select value={selectedYear} onValueChange={handleYearChange}>
                        <SelectTrigger id="yearSelect" className="w-full">
                            <SelectValue placeholder="Select Year" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="1">Year 1</SelectItem>
                                <SelectItem value="2">Year 2</SelectItem>
                                <SelectItem value="3">Year 3</SelectItem>
                                <SelectItem value="4">Year 4</SelectItem>
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
                        onValueChange={handleCourseChange}
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

            {/* Mobile Subject Toggle */}
            <div className="md:hidden">
                <Button
                    variant="outline"
                    className="w-full flex justify-between items-center"
                    onClick={() => setShowSubjects(!showSubjects)}
                    disabled={!selectedCourse && !selectedSubject}
                >
                    <span>
                        {currentSubject
                            ? `${currentSubject.code} - ${currentSubject.name}`
                            : "Select Subject"}
                    </span>
                    {showSubjects ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </Button>
            </div>

            {/* Main Content Layout */}
            <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                {/* Subjects Column */}
                <div className={`w-full md:w-1/3 lg:w-1/4 border border-primary/20 rounded-lg p-3 ${showSubjects ? "block" : "hidden md:block"}`}>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-base">Subjects</h3>
                            {selectedCourse && (
                                <Badge variant="outline" className="text-xs">
                                    {subjects.length} subjects
                                </Badge>
                            )}
                        </div>

                        {/* Subject List */}
                        <div className="space-y-2 max-h-[50vh] md:max-h-[65vh] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                            {!selectedYear ? (
                                <div className="text-center py-6 text-xs text-muted-foreground">
                                    Please select an academic year above
                                </div>
                            ) : !selectedCourse ? (
                                <div className="text-center py-6 text-xs text-muted-foreground">
                                    Please select a course to view subjects
                                </div>
                            ) : loading.subjects ? (
                                <div className="flex justify-center py-6">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-university-700"></div>
                                </div>
                            ) : subjects.length > 0 ? (
                                subjects.map((subject) => {
                                    const isSelected = String(selectedSubject) === String(subject.id);
                                    return (
                                        <div
                                            key={subject.id}
                                            className={`p-2.5 border rounded-md cursor-pointer transition-colors ${
                                                isSelected
                                                    ? "bg-university-700 text-white border-university-700"
                                                    : "hover:bg-muted/60"
                                            }`}
                                            onClick={() => handleSubjectClick(subject.id)}
                                        >
                                            <p className="font-semibold text-xs">{subject.code}</p>
                                            <p className="text-xs line-clamp-2 opacity-90 mt-0.5">{subject.name}</p>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-6 text-xs text-muted-foreground">
                                    No subjects found for {selectedCourse} (Year {selectedYear})
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Resources Content Column */}
                <div className={`w-full md:w-2/3 lg:w-3/4 ${!showSubjects || isMobile ? "block" : "hidden md:block"}`}>
                    {!selectedYear ? (
                        <div className="flex flex-col items-center justify-center h-64 border border-primary/20 rounded-lg text-gray-500">
                            <FileText className="h-12 w-12 mb-2 opacity-50" />
                            <p>Select an academic year or search for a subject</p>
                        </div>
                    ) : !selectedCourse ? (
                        <div className="flex flex-col items-center justify-center h-64 border border-primary/20 rounded-lg text-gray-500">
                            <FileText className="h-12 w-12 mb-2 opacity-50" />
                            <p>Select a course to view resources</p>
                        </div>
                    ) : !selectedSubject ? (
                        <div className="flex flex-col items-center justify-center h-64 border border-primary/20 rounded-lg text-gray-500 px-4 text-center">
                            <FileText className="h-12 w-12 mb-2 opacity-50" />
                            <p className="mt-2">Select a subject from the left panel to view available resources</p>
                        </div>
                    ) : (
                        <div>
                            <div className="mb-4">
                                <h3 className="text-lg sm:text-xl font-semibold break-words">
                                    {currentSubject ? `${currentSubject.code} - ${currentSubject.name}` : "Subject Resources"}
                                </h3>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Year {selectedYear} • {selectedCourse}
                                </p>
                            </div>

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
                                                                className="transition-all duration-200 hover:shadow-lg flex flex-col justify-between"
                                                            >
                                                                <CardHeader className="pb-2">
                                                                    <CardTitle className="flex items-start gap-2 text-base sm:text-lg">
                                                                        <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-university-700 flex-shrink-0 mt-1" />
                                                                        <span className="line-clamp-2 leading-snug">{resource.title}</span>
                                                                    </CardTitle>
                                                                    <CardDescription className="text-xs sm:text-sm">
                                                                        {resource.type.toUpperCase()} - {resource.size}
                                                                    </CardDescription>
                                                                </CardHeader>
                                                                <CardFooter className="flex items-center gap-2 pt-2 border-t mt-auto">
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => handlePreview(resource)}
                                                                        className="flex-1 text-xs"
                                                                    >
                                                                        <FileText className="h-3.5 w-3.5 mr-1.5" /> Preview
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={() => handleDownload(resource)}
                                                                        className="flex-1 text-xs"
                                                                    >
                                                                        <Download className="h-3.5 w-3.5 mr-1.5" /> Download
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
                                                        className="transition-all duration-200 hover:shadow-lg flex flex-col justify-between"
                                                    >
                                                        <CardHeader className="pb-2">
                                                            <CardTitle className="flex items-start gap-2 text-base sm:text-lg">
                                                                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-university-700 flex-shrink-0 mt-1" />
                                                                <span className="line-clamp-2 leading-snug">{resource.title}</span>
                                                            </CardTitle>
                                                            <CardDescription className="text-xs sm:text-sm">
                                                                {resource.type.toUpperCase()} - {resource.size}
                                                            </CardDescription>
                                                        </CardHeader>
                                                        <CardFooter className="flex items-center gap-2 pt-2 border-t mt-auto">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handlePreview(resource)}
                                                                className="flex-1 text-xs"
                                                            >
                                                                <FileText className="h-3.5 w-3.5 mr-1.5" /> Preview
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleDownload(resource)}
                                                                className="flex-1 text-xs"
                                                            >
                                                                <Download className="h-3.5 w-3.5 mr-1.5" /> Download
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