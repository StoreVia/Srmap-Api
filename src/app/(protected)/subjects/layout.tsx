import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Subjects",
  description: "View all your enrolled subjects, course codes, credit hours, and faculty details for the current semester at SRM AP.",
  alternates: {
    canonical: "https://srmapi.mrpan.in/subjects",
  },
  openGraph: {
    title: "My Subjects | SRMAP API",
    description: "View all your enrolled subjects, course codes, credit hours, and faculty details for the current semester at SRM AP.",
    url: "https://srmapi.mrpan.in/subjects",
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://srmapi.mrpan.in" },
    { "@type": "ListItem", position: 2, name: "Subjects", item: "https://srmapi.mrpan.in/subjects" },
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