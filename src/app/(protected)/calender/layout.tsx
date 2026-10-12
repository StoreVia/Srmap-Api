import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Academic Calendar",
  description: "View the SRM University AP academic calendar with exam dates, holidays, semester schedules, and important deadlines.",
  alternates: {
    canonical: "https://srmapi.mrpan.in/calender",
  },
  openGraph: {
    title: "Academic Calendar | SRMAP API",
    description: "View the SRM University AP academic calendar with exam dates, holidays, semester schedules, and important deadlines.",
    url: "https://srmapi.mrpan.in/calender",
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://srmapi.mrpan.in" },
    { "@type": "ListItem", position: 2, name: "Academic Calendar", item: "https://srmapi.mrpan.in/calender" },
  ],
};

export default function CalenderLayout({ children }: { children: React.ReactNode }) {
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