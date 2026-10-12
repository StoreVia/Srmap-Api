import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Semester Results",
  description: "Check your SRM University AP end-semester exam results, course grades, SGPA, and grade cards.",
  alternates: {
    canonical: "https://srmapi.mrpan.in/exams/semester-results",
  },
  openGraph: {
    title: "Semester Results | SRMAP API",
    description: "Check your SRM University AP end-semester exam results, course grades, SGPA, and grade cards.",
    url: "https://srmapi.mrpan.in/exams/semester-results",
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://srmapi.mrpan.in" },
    { "@type": "ListItem", position: 2, name: "Exams", item: "https://srmapi.mrpan.in/exams" },
    { "@type": "ListItem", position: 3, name: "Semester Results", item: "https://srmapi.mrpan.in/exams/semester-results" },
  ],
};

export default function SemesterResultsLayout({ children }: { children: React.ReactNode }) {
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