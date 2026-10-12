import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Faculty & Staff Directory",
  description: "Explore SRM AP faculty profiles, research interests, patents, publications, office locations, and student ratings.",
  alternates: {
    canonical: "https://srmapi.mrpan.in/faculty",
  },
  openGraph: {
    title: "Faculty & Staff Directory | SRMAP API",
    description: "Explore SRM AP faculty profiles, research interests, patents, publications, office locations, and student ratings.",
    url: "https://srmapi.mrpan.in/faculty",
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
      name: "Faculty",
      item: "https://srmapi.mrpan.in/faculty",
    },
  ],
};

export default function FacultyLayout({ children }: { children: React.ReactNode }) {
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