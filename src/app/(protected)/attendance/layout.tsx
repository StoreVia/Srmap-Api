import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Attendance Tracker",
  description: "Track your SRM University AP subject-wise attendance percentage, bunk calculations, and attendance threshold margins.",
  alternates: {
    canonical: "https://srmapi.in/attendance",
  },
  openGraph: {
    title: "Attendance Tracker | SRMAP API",
    description: "Track your SRM University AP subject-wise attendance percentage, bunk calculations, and attendance threshold margins.",
    url: "https://srmapi.in/attendance",
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: "https://srmapi.in",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Attendance Tracker",
      item: "https://srmapi.in/attendance",
    },
  ],
};

export default function AttendanceLayout({ children }: { children: React.ReactNode }) {
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