"use client";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import calendarData from "@/static/academic_calendar.json";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface CalendarEvent {
  id: number;
  details: string;
  date: string;
  day: string;
}

interface Holiday {
  id: number;
  occasion: string;
  date: string;
  day: string;
}

interface CalendarData {
  oddSemesterData: CalendarEvent[];
  evenSemesterData: CalendarEvent[];
  summerTermData: CalendarEvent[];
  oddSemesterHolidays: Holiday[];
  evenSemesterHolidays: Holiday[];
  importantNotes: string[];
}

const AcademicCalendar = () => {
  const [activeTab, setActiveTab] = useState("odd");
  const scrollRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const currentDate = new Date();

  const parseDate = (dateString: string): Date => {
    const [day, month, year] = dateString.split(".");
    return new Date(`${year}-${month}-${day}`);
  };
  const formatDate = (dateString: string): string => {
    return parseDate(dateString).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const isDatePassed = (dateString: string): boolean => parseDate(dateString) < currentDate;
  const isDateRangePassed = (dateRange: string): boolean => {
    const parts = dateRange.split(" - ");
    const endDate = parts[1] ? parseDate(parts[1]) : parseDate(parts[0]);
    return endDate < currentDate;
  };
  const isPassed = (date: string): boolean => date.includes(" - ") ? isDateRangePassed(date) : isDatePassed(date);

  useEffect(() => {
    if (!calendarData) return;

    const tabMap: Record<string, CalendarEvent[]> = {
      odd: calendarData.oddSemesterData,
      even: calendarData.evenSemesterData,
      summer: calendarData.summerTermData,
    };

    const currentTabData = tabMap[activeTab] ?? [];
    const currentEventIndex = currentTabData.findIndex(
      (item) => !isPassed(item.date)
    );

    if (
      currentEventIndex !== -1 &&
      scrollRefs.current[`${activeTab}-${currentEventIndex}`]
    ) {
      setTimeout(() => {
        scrollRefs.current[`${activeTab}-${currentEventIndex}`]?.scrollIntoView(
          { behavior: "smooth", block: "center" }
        );
      }, 300);
    }
  }, [activeTab, calendarData]);

  const renderEventCard = (
    item: CalendarEvent,
    index: number,
    type: string
  ) => {
    const passed = isPassed(item.date);
    return (
      <div
        key={item.id}
        ref={(el) => {
          scrollRefs.current[`${type}-${index}`] = el;
        }}
        className={`p-3 border rounded-lg ${
          passed ? "bg-green-50 border-green-200 dark:text-black" : ""
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
          <div className="flex-1">
            <h4 className="font-medium text-sm sm:text-base">{item.details}</h4>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {item.day}
            </p>
          </div>
          <Badge
            variant={passed ? "default" : "outline"}
            className={`whitespace-nowrap text-xs sm:text-sm ${
              passed
                ? "bg-green-500 dark:text-white hover:bg-green-600"
                : ""
            }`}
          >
            {item.date.includes(" - ")
              ? item.date
                  .split(" - ")
                  .map((d) => formatDate(d))
                  .join(" - ")
              : formatDate(item.date)}
          </Badge>
        </div>
      </div>
    );
  };

  const renderHolidayCard = (holiday: Holiday) => {
    const passed = isDatePassed(holiday.date);
    return (
      <div
        key={holiday.id}
        className={`p-3 border rounded-lg ${
          passed ? "bg-green-50 border-green-200 dark:text-black" : ""
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
          <div className="flex-1">
            <h4 className="font-medium text-sm sm:text-base">
              {holiday.occasion}
            </h4>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {holiday.day}
            </p>
          </div>
          <Badge
            variant={passed ? "default" : "outline"}
            className={`whitespace-nowrap text-xs sm:text-sm ${
              passed
                ? "bg-green-500 dark:text-white hover:bg-green-600"
                : ""
            }`}
          >
            {formatDate(holiday.date)}
          </Badge>
        </div>
      </div>
    );
  };

  if (!calendarData) {
    return (
      <div className="w-full flex items-center justify-center py-20 text-muted-foreground text-sm">
        Loading calendar data…
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">
          Academic Calendar AY 2025-26
        </h2>
        <p className="text-muted-foreground text-xs sm:text-sm md:text-base">
          SRM University-AP, Andhra Pradesh – Applicable to all programs of UG,
          PG &amp; PhD
        </p>
      </div>

      <Tabs
        defaultValue="even"
        className="w-full"
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full grid-cols-3 mb-4 sm:mb-6">
          <TabsTrigger value="odd" className="text-xs sm:text-sm">
            Odd
          </TabsTrigger>
          <TabsTrigger value="even" className="text-xs sm:text-sm">
            Even
          </TabsTrigger>
          <TabsTrigger value="summer" className="text-xs sm:text-sm">
            Summer
          </TabsTrigger>
        </TabsList>

        <TabsContent value="odd">
          <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
            <Card className="overflow-hidden">
              <CardHeader className="p-3 sm:p-4 md:p-6">
                <CardTitle className="text-base sm:text-lg md:text-xl">
                  Odd Semester Schedule
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Academic Year 2025-26
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 md:p-6">
                <ScrollArea className="h-[300px] sm:h-[400px] md:h-[500px] pr-3">
                  <div className="space-y-2 sm:space-y-3">
                    {calendarData.oddSemesterData.map((item, index) =>
                      renderEventCard(item, index, "odd")
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="p-3 sm:p-4 md:p-6">
                <CardTitle className="text-base sm:text-lg md:text-xl">
                  Holidays – Odd Semester
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  AY 2025-26
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 md:p-6">
                <ScrollArea className="h-[300px] sm:h-[400px] md:h-[500px] pr-3">
                  <div className="space-y-2 sm:space-y-3">
                    {calendarData.oddSemesterHolidays.map((holiday) =>
                      renderHolidayCard(holiday)
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="even">
          <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
            <Card className="overflow-hidden">
              <CardHeader className="p-3 sm:p-4 md:p-6">
                <CardTitle className="text-base sm:text-lg md:text-xl">
                  Even Semester Schedule
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Academic Year 2025-26
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 md:p-6">
                <ScrollArea className="h-[300px] sm:h-[400px] md:h-[500px] pr-3">
                  <div className="space-y-2 sm:space-y-3">
                    {calendarData.evenSemesterData.map((item, index) =>
                      renderEventCard(item, index, "even")
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="p-3 sm:p-4 md:p-6">
                <CardTitle className="text-base sm:text-lg md:text-xl">
                  Holidays – Even Semester
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  AY 2025-26
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 md:p-6">
                <ScrollArea className="h-[300px] sm:h-[400px] md:h-[500px] pr-3">
                  <div className="space-y-2 sm:space-y-3">
                    {calendarData.evenSemesterHolidays.map((holiday) =>
                      renderHolidayCard(holiday)
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="summer">
          <Card className="overflow-hidden">
            <CardHeader className="p-3 sm:p-4 md:p-6">
              <CardTitle className="text-base sm:text-lg md:text-xl">
                Summer Term Schedule (Optional)
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Academic Year 2025-26
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6">
              <ScrollArea className="h-[250px] sm:h-[300px] md:h-[350px] pr-3">
                <div className="space-y-2 sm:space-y-3">
                  {calendarData.summerTermData.map((item, index) =>
                    renderEventCard(item, index, "summer")
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-4 sm:mt-6">
        <Card>
          <CardHeader className="p-3 sm:p-4 md:p-6">
            <CardTitle className="text-base sm:text-lg md:text-xl">
              Important Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 md:p-6">
            <ul className="list-disc pl-4 sm:pl-5 space-y-1 sm:space-y-2 text-xs sm:text-sm md:text-base">
              {calendarData.importantNotes.map((note, idx) => (
                <li key={idx}>{note}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AcademicCalendar;