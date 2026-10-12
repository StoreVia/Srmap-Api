import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Apps & Tools",
  description: "Explore SRMAP API companion apps and tools — mobile apps, extensions, and integrations for SRM AP students.",
  alternates: {
    canonical: "https://srmapi.mrpan.in/apps",
  },
  openGraph: {
    title: "Apps & Tools | SRMAP API",
    description: "Explore SRMAP API companion apps and tools — mobile apps, extensions, and integrations for SRM AP students.",
    url: "https://srmapi.mrpan.in/apps",
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://srmapi.mrpan.in" },
    { "@type": "ListItem", position: 2, name: "Apps", item: "https://srmapi.mrpan.in/apps" },
  ],
};

export default function AppsLayout({ children }: { children: React.ReactNode }) {
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