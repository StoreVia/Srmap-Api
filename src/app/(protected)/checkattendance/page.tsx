import { redirect } from "next/navigation";

export default function CheckAttendanceRedirect() {
  redirect("/markattendance");
}
