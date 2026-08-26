import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Internal Exam Marks",
  description: "Check your SRM University AP internal examination marks, test scores, and continuous assessment details.",
  alternates: {
    canonical: "https://srmapi.in/exams/internals",
  },
  openGraph: {
    title: "Internal Exam Marks | SRMAP API",
    description: "Check your SRM University AP internal examination marks, test scores, and continuous assessment details.",
    url: "https://srmapi.in/exams/internals",
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://srmapi.in" },
    { "@type": "ListItem", position: 2, name: "Exams", item: "https://srmapi.in/exams" },
    { "@type": "ListItem", position: 3, name: "Internal Marks", item: "https://srmapi.in/exams/internals" },
  ],
};

export default function InternalsLayout({ children }: { children: React.ReactNode }) {
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