import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Subjects",
  description: "View all your enrolled subjects, course codes, credit hours, and faculty details for the current semester at SRM AP.",
  alternates: {
    canonical: "https://srmapi.in/subjects",
  },
  openGraph: {
    title: "My Subjects | SRMAP API",
    description: "View all your enrolled subjects, course codes, credit hours, and faculty details for the current semester at SRM AP.",
    url: "https://srmapi.in/subjects",
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://srmapi.in" },
    { "@type": "ListItem", position: 2, name: "Subjects", item: "https://srmapi.in/subjects" },
  ],
};

export default function SubjectsLayout({ children }: { children: React.ReactNode }) {
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