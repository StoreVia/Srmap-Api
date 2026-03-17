"use client";
import { Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useStudentData } from "@/context/StudentContext";
import { toTitleCase, whatsapp } from "@/fullStackUtils/utils/functions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Dashboard = () => {
  const { profile, attendance, timetable } = useStudentData();
  const router = useRouter();

  const lowAttendanceSubjects = attendance.filter(
    (subject) => parseFloat(subject.attendance_percentage) < 75
  );

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const currentDay = days[new Date().getDay()];
  const todayTimetable = timetable.find((t) => t.day === currentDay);
  const todayClasses = todayTimetable
    ? todayTimetable.subjects
      .map((subjectCode: string, idx: number) => ({ subjectCode, timeSlot: idx + 1 }))
      .filter(({ subjectCode }) => subjectCode !== "")
    : [];

  return (
    <div className="grid gap-6">
      <h2 className="text-3xl font-bold">Welcome, {toTitleCase(profile?.studentName || "")}</h2>
      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-500 via-green-400 to-green-500 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 group">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
            <svg className="w-6 h-6 text-green-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.52 3.48A11.91 11.91 0 0012 0C5.37 0 0 5.37 0 12c0 2.11.55 4.17 1.6 5.98L0 24l6.21-1.62A11.92 11.92 0 0012 24c6.63 0 12-5.37 12-12 0-3.19-1.24-6.21-3.48-8.52zm-8.52 18c-1.8 0-3.55-.48-5.08-1.39l-.36-.21-3.69.96.99-3.6-.24-.37A9.96 9.96 0 012 12c0-5.52 4.48-10 10-10 2.67 0 5.18 1.04 7.07 2.93A9.96 9.96 0 0122 12c0 5.52-4.48 10-10 10zm5.44-7.54c-.3-.15-1.77-.87-2.05-.97-.28-.1-.48-.15-.68.15-.2.3-.78.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.68-1.65-.93-2.27-.24-.58-.49-.5-.68-.51h-.58c-.2 0-.52.07-.8.37-.28.3-1.05 1.02-1.05 2.47s1.08 2.86 1.23 3.05c.15.2 2.12 3.24 5.15 4.54.72.31 1.28.5 1.72.64.72.23 1.38.2 1.9.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35z" />
            </svg>
          </div>
        </div>

        <div className="flex-1">
          <p className="text-white font-medium text-lg drop-shadow-sm">
            Join Our WhatsApp Channel!
          </p>
        </div>

        <button
          className="bg-white hover:bg-green-50 text-green-600 font-semibold px-5 py-2.5 rounded-full shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 border-2 border-transparent hover:border-green-200"
          onClick={() => whatsapp()}
        >
          Join Now
        </button>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Attendance Warnings</CardTitle>
            <CardDescription>Subject Where Attendance Percentage Is Below 75%</CardDescription>
          </CardHeader>
          <CardContent>
            {lowAttendanceSubjects.length > 0 ? (
              <div className="space-y-4">
                {lowAttendanceSubjects.map((subject) => (
                  <div
                    key={subject.subject_code}
                    className="flex items-center justify-between pb-4 border-b"
                  >
                    <div>
                      <h4 className="font-semibold">{subject.subject_name}</h4>
                      <p className="text-sm text-muted-foreground">{subject.subject_code}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-red-600">
                        {Number(subject.attendance_percentage).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="default" className="mt-4" onClick={() => router.push("/attendance")}>
                  View All Details
                </Button>
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-green-600 font-medium">No Attendance Warnings!</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => router.push("/attendance")}
                >
                  View Attedance Details
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Today's Classes</CardTitle>
            <CardDescription>
              {currentDay === "Saturday" || currentDay === "Sunday"
                ? "No Classes On Weekends!"
                : `Your Schedule For Current Day ${currentDay}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentDay !== "Saturday" && currentDay !== "Sunday" ? (
              todayClasses.length > 0 ? (
                <div className="space-y-3">
                  {todayClasses.map(({ subjectCode, timeSlot }) => (
                    <div
                      key={timeSlot}
                      className="flex justify-between items-center p-2 bg-muted rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Slot {timeSlot}</span>
                      </div>
                      <div className="font-medium">{subjectCode}</div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() => router.push("/timetable")}
                  >
                    View Full Timetable
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No Classes For Today</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => router.push("/timetable")}
                  >
                    View Timetable
                  </Button>
                </div>
              )
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">Enjoy Your Weekend!</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => router.push("/timetable")}
                >
                  View Weekday Schedule
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;