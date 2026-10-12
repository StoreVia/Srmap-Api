import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Past Internal Marks",
  description: "View previous semester internal exam marks and historical internal test records at SRM University AP.",
  alternates: {
    canonical: "https://srmapi.mrpan.in/exams/past-internals",
  },
  openGraph: {
    title: "Past Internal Marks | SRMAP API",
    description: "View previous semester internal exam marks and historical internal test records at SRM University AP.",
    url: "https://srmapi.mrpan.in/exams/past-internals",
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://srmapi.mrpan.in" },
    { "@type": "ListItem", position: 2, name: "Exams", item: "https://srmapi.mrpan.in/exams" },
    { "@type": "ListItem", position: 3, name: "Past Internals", item: "https://srmapi.mrpan.in/exams/past-internals" },
  ],
};

export default function PastInternalsLayout({ children }: { children: React.ReactNode }) {
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