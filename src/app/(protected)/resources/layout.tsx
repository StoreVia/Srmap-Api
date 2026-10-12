import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Study Resources & Notes",
  description: "Access curated study material, lecture notes, syllabus guides, and previous question papers for SRM AP courses.",
  alternates: {
    canonical: "https://srmapi.mrpan.in/resources",
  },
  openGraph: {
    title: "Study Resources & Notes | SRMAP API",
    description: "Access curated study material, lecture notes, syllabus guides, and previous question papers for SRM AP courses.",
    url: "https://srmapi.mrpan.in/resources",
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
      item: "https://srmapi.mrpan.in",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Study Resources",
      item: "https://srmapi.mrpan.in/resources",
    },
  ],
};

export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
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