"use client";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AcademicCalendar = () => {
  const [activeTab, setActiveTab] = useState("even");
  const scrollRefs = useRef<any>({});
  const currentDate = new Date();

  const formatDate = (dateString: string) => {
    const [day, month, year] = dateString.split('.');
    const dateObj = new Date(`${year}-${month}-${day}`);
    return dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const isDatePassed = (dateString: string) => {
    const [day, month, year] = dateString.split('.');
    const itemDate = new Date(`${year}-${month}-${day}`);
    return itemDate < currentDate;
  };

  const isDateRangePassed = (dateRange: string) => {
    const [startDateStr, endDateStr] = dateRange.split(' - ');
    const [startDay, startMonth, startYear] = startDateStr.split('.');
    const endDate = endDateStr ? new Date(endDateStr.split('.').reverse().join('-')) : null;
    const startDate = new Date(`${startYear}-${startMonth}-${startDay}`);
    if (endDate) {
      return endDate < currentDate;
    }
    return startDate < currentDate;
  };

  const oddSemesterData = [
    { id: 1, details: "Semester Course Pre-Registration/ Course Choice Filling", date: "02.06.2025", day: "Monday" },
    { id: 2, details: "Commencement of Student Enrolment (First Years)", date: "30.06.2025", day: "Monday" },
    { id: 3, details: "Commencement of Academic Registration (Higher Semesters)", date: "09.07.2025", day: "Wednesday" },
    { id: 4, details: "Finalization of Timetable (Higher Semesters)", date: "17.07.2025", day: "Friday" },
    { id: 5, details: "Commencement of Classes (Higher Semester)", date: "04.08.2025", day: "Monday" },
    { id: 6, details: "Last Date for the Re-registration of the Arrear Courses (Higher Semester)", date: "07.08.2025", day: "Thursday" },
    { id: 7, details: "Commencement of Induction Program (First Semester)", date: "18.08.2025", day: "Monday" },
    { id: 8, details: "Last date of Academic and Course Registration with Late Fee as per the fee circular dated 01.07.2025(Higher Semesters)", date: "19.08.2025", day: "Tuesday" },
    { id: 9, details: "Issue of Struck off notice and course registration with readmission fee as per the fee circular dated 01.07.2025 (Higher Semesters)", date: "20.08.2025", day: "Wednesday" },
    { id: 10, details: "Finalization of Timetable (First Semester)", date: "21.08.2025", day: "Thursday" },
    { id: 11, details: "Commencement of Classes (First Years)", date: "01.09.2025", day: "Monday" },
    { id: 12, details: "Midterm Examinations/Assessments", date: "13.10.2025 - 17.10.2025", day: "Monday - Friday" },
    { id: 13, details: "Window for filling End-Term Feedback", date: "27.10.2025 - 04.11.2025", day: "Monday - Tuesday" },
    { id: 14, details: "Examination Registration", date: "27.10.2025 - 05.11.2025", day: "Monday - Wednesday" },
    { id: 15, details: "Window for Semester Practical Examinations", date: "27.11.2025 - 08.12.2025", day: "Thursday - Monday" },
    { id: 16, details: "Last Day of Teaching", date: "11.12.2025", day: "Thursday" },
    { id: 17, details: "Last Day for Submitting Continuous Assessment Marks", date: "11.12.2025", day: "Thursday" },
    { id: 18, details: "Last Date for Submission of Assessment Marks of Project/ Seminar/ Internship/ Practical Courses", date: "12.12.2025", day: "Friday" },
    { id: 19, details: "Publishing Students Attendance Shortage", date: "12.12.2025", day: "Friday" },
    { id: 20, details: "Window for End-Term Examinations", date: "13.12.2025 - 24.12.2025", day: "Saturday - Wednesday" },
    { id: 21, details: "Window for End-Term Examinations Grade Submission to the office of Controller of Examinations", date: "16.12.2025 - 30.12.2025", day: "Tuesday - Tuesday" },
    { id: 22, details: "Window for End-Semester Arrear Examinations", date: "24.12.2025 - 31.12.2026", day: "Wednesday - Wednesday" },
    { id: 23, details: "Last Date to Submit the Course Files by Faculty to the Respective Departments", date: "26.12.2025", day: "Friday" },
    { id: 24, details: "Date of Result Declaration", date: "10.01.2026", day: "Wednesday" },
    { id: 25, details: "Last Date to Apply for End-term Re-evaluation", date: "19.01.2026", day: "Monday" },
    { id: 26, details: "Winter Break for Students", date: "25.12.2025 - 04.01.2026", day: "Thursday - Sunday" },
  ];

  const evenSemesterData = [
    { id: 1, details: "Semester Course Pre-Registration/ Course Choice Filling", date: "10.11.2025", day: "Monday" },
    { id: 2, details: "Commencement of Academic Registration", date: "16.12.2025", day: "Tuesday" },
    { id: 3, details: "Finalization of Timetable", date: "24.12.2025", day: "Friday" },
    { id: 4, details: "Commencement of Classes", date: "05.01.2026", day: "Monday" },
    { id: 5, details: "Last Date for the Re-registration of the Arrear Courses", date: "08.01.2026", day: "Thursday" },
    { id: 6, details: "Issue of Struck off notice and course registration with readmission fee", date: "20.01.2026", day: "Tuesday" },
    { id: 7, details: "Mid-Term Examinations/Assessments", date: "09.03.2026 - 13.03.2026", day: "Monday - Friday" },
    { id: 8, details: "Window for Filling End-Term Feedback", date: "30.03.2026 - 07.04.2026", day: "Monday - Tuesday" },
    { id: 9, details: "Examination Registration", date: "30.03.2026 - 08.04.2026", day: "Monday - Wednesday" },
    { id: 10, details: "Window for Semester Practical Examinations", date: "15.04.2026 - 30.04.2026", day: "Wednesday - Thursday" },
    { id: 11, details: "Last Day for Submitting Continuous Assessment Marks", date: "27.04.2026", day: "Monday" },
    { id: 12, details: "Last Day of Teaching", date: "04.05.2026", day: "Monday" },
    { id: 13, details: "Last Date for Submission of Assessment Marks of Project/ Seminar/ Internship/ Practical Courses", date: "05.05.2026", day: "Tuesday" },
    { id: 14, details: "Publishing Students Attendance Shortage", date: "06.05.2026", day: "Wednesday" },
    { id: 15, details: "Window for End-Term Examinations", date: "11.05.2026 - 28.05.2025", day: "Monday - Thursday" },
    { id: 16, details: "Window for End-Term Examinations Grade Submission to the office of Controller of Examinations", date: "13.05.2026 - 29.05.2026", day: "Wednesday - Friday" },
    { id: 17, details: "Last Date to Submit the Course Files by Faculty to the Respective Departments", date: "27.05.2026", day: "Wednesday" },
    { id: 18, details: "Window for End-Semester Arrear Examinations", date: "29.05.2026 - 08.06.2026", day: "Friday - Monday" },
    { id: 19, details: "Date of Result Declaration", date: "12.06.2026", day: "Friday" },
    { id: 20, details: "Last Date to Apply for End-term Re-evaluation", date: "19.06.2026", day: "Friday" },
    { id: 21, details: "Summer Break for Students", date: "29.05.2026 - 24.07.2026", day: "Friday - Friday" },
  ];

  const summerTermData = [
    { id: 1, details: "Last Date for Summer Term Registration", date: "15.06.2026", day: "Monday" },
    { id: 2, details: "Commencement of Classes", date: "16.06.2026", day: "Tuesday" },
    { id: 3, details: "Window for Summer Term Examinations", date: "10.08.2026 - 12.08.2026", day: "Monday - Wednesday" },
    { id: 4, details: "Date of Result Declaration", date: "17.08.2026", day: "Monday" },
  ];

  const oddSemesterHolidays = [
    { id: 1, occasion: "Independence Day", date: "15.08.2025", day: "Friday" },
    { id: 2, occasion: "Vinayakachavithi", date: "27.08.2025", day: "Wednesday" },
    { id: 3, occasion: "Eid Milanun Nabi", date: "05.09.2025", day: "Friday" },
    { id: 4, occasion: "Durgastami", date: "30.09.2025", day: "Tuesday" },
    { id: 5, occasion: "Vijayadasami/Mahatma Gandhi Jayanthi", date: "02.10.2025", day: "Thursday" },
    { id: 6, occasion: "Deepavali", date: "21.10.2025", day: "Tuesday" },
    { id: 7, occasion: "Guru Nanak Jayanthi/Karthika Purnima", date: "05.11.2025", day: "Wednesday" },
    { id: 8, occasion: "Christmas", date: "25.12.2025", day: "Thursday" },
  ];

  const evenSemesterHolidays = [
    { id: 1, occasion: "Bhogi", date: "14.01.2026", day: "Tuesday" },
    { id: 2, occasion: "Makara Sankranthi", date: "15.01.2026", day: "Wednesday" },
    { id: 3, occasion: "Kanuma", date: "16.01.2026", day: "Thursday" },
    { id: 4, occasion: "Republic Day", date: "26.01.2026", day: "Monday" },
    { id: 5, occasion: "Holi", date: "02.03.2026", day: "Monday" },
    { id: 6, occasion: "Ugadi", date: "20.03.2026", day: "Friday" },
    { id: 7, occasion: "Sri Rama Navami", date: "27.03.2026", day: "Friday" },
    { id: 8, occasion: "Good Friday", date: "03.04.2026", day: "Friday" },
    { id: 9, occasion: "Dr. B.R Ambedkar's Birthday", date: "14.04.2026", day: "Tuesday" },
    { id: 10, occasion: "Bakrid (EID-UL-ZUHA)", date: "27.05.2026", day: "Wednesday" },
    { id: 11, occasion: "Muharrum", date: "26.06.2026", day: "Friday" },
  ];

  useEffect(() => {
    const scrollToCurrentEvent = () => {
      const currentTabData = activeTab === "odd" ? oddSemesterData : activeTab === "even" ? evenSemesterData : summerTermData;
      let currentEventIndex = -1;
      for (let i = 0; i < currentTabData.length; i++) {
        const item = currentTabData[i];
        const isPassed = item.date.includes('-') ? isDateRangePassed(item.date) : isDatePassed(item.date);
        if (!isPassed) {
          currentEventIndex = i;
          break;
        }
      }
      
      if (currentEventIndex !== -1 && scrollRefs.current[`${activeTab}-${currentEventIndex}`]) {
        setTimeout(() => {
          scrollRefs.current[`${activeTab}-${currentEventIndex}`].scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }, 300);
      }
    };

    scrollToCurrentEvent();
  }, [activeTab]);

  const renderEventCard = (item: any, index: number, type: any) => {
    const isPassed = item.date.includes('-') ? 
        isDateRangePassed(item.date) : 
        isDatePassed(item.date);
    
    return (
      <div 
        key={item.id} 
        ref={el => { scrollRefs.current[`${type}-${index}`] = el }}
        className={`p-3 border rounded-lg ${isPassed ? 'bg-green-50 border-green-200 dark:text-black' : ''}`}
      >
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
          <div className="flex-1">
            <h4 className="font-medium text-sm sm:text-base">{item.details}</h4>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">{item.day}</p>
          </div>
          <Badge 
            variant={isPassed ? "default" : "outline"} 
            className={`whitespace-nowrap text-xs sm:text-sm ${isPassed ? 'bg-green-500 dark:text-white hover:bg-green-600' : ''}`}
          >
            {item.date.includes('-') ? 
              item.date.split(' - ').map((d: string) => formatDate(d)).join(' - ') : 
              formatDate(item.date)
            }
          </Badge>
        </div>
      </div>
    );
  };

  const renderHolidayCard = (holiday: any, index: number, type: any) => {
    const isPassed = isDatePassed(holiday.date);
    return (
      <div 
        key={holiday.id} 
        className={`p-3 border rounded-lg ${isPassed ? 'bg-green-50 border-green-200 dark:text-black' : ''}`}
      >
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
          <div className="flex-1">
            <h4 className="font-medium text-sm sm:text-base">{holiday.occasion}</h4>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">{holiday.day}</p>
          </div>
          <Badge 
            variant={isPassed ? "default" : "outline"} 
            className={`whitespace-nowrap text-xs sm:text-sm ${isPassed ? 'bg-green-500 dark:text-white hover:bg-green-600' : ''}`}
          >
            {formatDate(holiday.date)}
          </Badge>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">Academic Calendar AY 2025-26</h2>
        <p className="text-muted-foreground text-xs sm:text-sm md:text-base">
          SRM University-AP, Andhra Pradesh - Applicable to all programs of UG, PG & PhD
        </p>
      </div>

      <Tabs defaultValue="even" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-4 sm:mb-6">
          <TabsTrigger value="odd" className="text-xs sm:text-sm">Odd</TabsTrigger>
          <TabsTrigger value="even" className="text-xs sm:text-sm">Even</TabsTrigger>
          <TabsTrigger value="summer" className="text-xs sm:text-sm">Summer</TabsTrigger>
        </TabsList>

        <TabsContent value="odd">
          <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
            <Card className="overflow-hidden">
              <CardHeader className="p-3 sm:p-4 md:p-6">
                <CardTitle className="text-base sm:text-lg md:text-xl">Odd Semester Schedule</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Academic Year 2025-26</CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 md:p-6">
                <ScrollArea className="h-[300px] sm:h-[400px] md:h-[500px] pr-3">
                  <div className="space-y-2 sm:space-y-3">
                    {oddSemesterData.map((item, index) => renderEventCard(item, index, "odd"))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="p-3 sm:p-4 md:p-6">
                <CardTitle className="text-base sm:text-lg md:text-xl">Holidays - Odd Semester</CardTitle>
                <CardDescription className="text-xs sm:text-sm">AY 2025-26</CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 md:p-6">
                <ScrollArea className="h-[300px] sm:h-[400px] md:h-[500px] pr-3">
                  <div className="space-y-2 sm:space-y-3">
                    {oddSemesterHolidays.map((holiday, index) => renderHolidayCard(holiday, index, "odd-holiday"))}
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
                <CardTitle className="text-base sm:text-lg md:text-xl">Even Semester Schedule</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Academic Year 2025-26</CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 md:p-6">
                <ScrollArea className="h-[300px] sm:h-[400px] md:h-[500px] pr-3">
                  <div className="space-y-2 sm:space-y-3">
                    {evenSemesterData.map((item, index) => renderEventCard(item, index, "even"))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="p-3 sm:p-4 md:p-6">
                <CardTitle className="text-base sm:text-lg md:text-xl">Holidays - Even Semester</CardTitle>
                <CardDescription className="text-xs sm:text-sm">AY 2025-26</CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 md:p-6">
                <ScrollArea className="h-[300px] sm:h-[400px] md:h-[500px] pr-3">
                  <div className="space-y-2 sm:space-y-3">
                    {evenSemesterHolidays.map((holiday, index) => renderHolidayCard(holiday, index, "even-holiday"))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="summer">
          <Card className="overflow-hidden">
            <CardHeader className="p-3 sm:p-4 md:p-6">
              <CardTitle className="text-base sm:text-lg md:text-xl">Summer Term Schedule (Optional)</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Academic Year 2025-26</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6">
              <ScrollArea className="h-[250px] sm:h-[300px] md:h-[350px] pr-3">
                <div className="space-y-2 sm:space-y-3">
                  {summerTermData.map((item, index) => renderEventCard(item, index, "summer"))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-4 sm:mt-6">
        <Card>
          <CardHeader className="p-3 sm:p-4 md:p-6">
            <CardTitle className="text-base sm:text-lg md:text-xl">Important Notes</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 md:p-6">
            <ul className="list-disc pl-4 sm:pl-5 space-y-1 sm:space-y-2 text-xs sm:text-sm md:text-base">
              <li>In view of Dussehra 29.09.2025, 01.10.2025 and 03.10.2025 declared as holidays and compensated with a working day on 20.09.2025, 11.10.2025 and 25.10.2025.</li>
              <li>In view of Diwali 20.10.2025 is declared as holiday and compensated with a working on 01.11.2025</li>
              <li>Holidays are subject to change as per the AP Government notification</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AcademicCalendar;