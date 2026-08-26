import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student Forums",
  description: "Join the SRMAP API student community forums. Discuss academics, share resources, and connect with fellow SRM AP students.",
  alternates: {
    canonical: "https://srmapi.in/forums",
  },
  openGraph: {
    title: "Student Forums | SRMAP API",
    description: "Join the SRMAP API student community forums. Discuss academics, share resources, and connect with fellow SRM AP students.",
    url: "https://srmapi.in/forums",
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://srmapi.in" },
    { "@type": "ListItem", position: 2, name: "Forums", item: "https://srmapi.in/forums" },
  ],
};

export default function ForumsLayout({ children }: { children: React.ReactNode }) {
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