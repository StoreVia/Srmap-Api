import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Exams & Results",
  description: "Check your SRM University AP internal marks, past examination performance, and semester grade results.",
  alternates: {
    canonical: "https://srmapi.in/exams",
  },
  openGraph: {
    title: "Exams & Results | SRMAP API",
    description: "Check your SRM University AP internal marks, past examination performance, and semester grade results.",
    url: "https://srmapi.in/exams",
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
      name: "Exams & Results",
      item: "https://srmapi.in/exams",
    },
  ],
};

export default function ExamsLayout({ children }: { children: React.ReactNode }) {
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