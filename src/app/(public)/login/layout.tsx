import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student Login",
  description: "Sign in to SRMAP API using your SRM AP student credentials to access attendance, CGPA, timetable, and academic data.",
  alternates: {
    canonical: "https://srmapi.in/login",
  },
  openGraph: {
    title: "Student Login | SRMAP API",
    description: "Sign in to SRMAP API using your SRM AP student credentials to access attendance, CGPA, timetable, and academic data.",
    url: "https://srmapi.in/login",
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}