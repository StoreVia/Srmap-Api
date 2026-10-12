import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mark Attendance",
  description: "Mark your class attendance quickly and easily through SRMAP API. Track and manage your daily attendance records.",
  alternates: {
    canonical: "https://srmapi.mrpan.in/markattendance",
  },
  openGraph: {
    title: "Mark Attendance | SRMAP API",
    description: "Mark your class attendance quickly and easily through SRMAP API. Track and manage your daily attendance records.",
    url: "https://srmapi.mrpan.in/markattendance",
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://srmapi.mrpan.in" },
    { "@type": "ListItem", position: 2, name: "Mark Attendance", item: "https://srmapi.mrpan.in/markattendance" },
  ],
};

export default function MarkAttendanceLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {children}
    </>
  );
}