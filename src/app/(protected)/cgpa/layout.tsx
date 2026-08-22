import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CGPA & SGPA Calculator",
  description: "Calculate your SGPA and CGPA accurately for SRM University AP courses. Auto-fill grades or calculate manually.",
  alternates: {
    canonical: "https://srmapi.in/cgpa",
  },
  openGraph: {
    title: "CGPA & SGPA Calculator | SRMAP API",
    description: "Calculate your SGPA and CGPA accurately for SRM University AP courses. Auto-fill grades or calculate manually.",
    url: "https://srmapi.in/cgpa",
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
      name: "CGPA Calculator",
      item: "https://srmapi.in/cgpa",
    },
  ],
};

export default function CGPALayout({ children }: { children: React.ReactNode }) {
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