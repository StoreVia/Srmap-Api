import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your SRMAP API dashboard — view attendance summary, upcoming classes, academic progress, and quick access to all student tools.",
  alternates: {
    canonical: "https://srmapi.in/dashboard",
  },
  openGraph: {
    title: "Dashboard | SRMAP API",
    description: "Your SRMAP API dashboard — view attendance summary, upcoming classes, academic progress, and quick access to all student tools.",
    url: "https://srmapi.in/dashboard",
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://srmapi.in" },
    { "@type": "ListItem", position: 2, name: "Dashboard", item: "https://srmapi.in/dashboard" },
  ],
};

export default function DashboardPageLayout({ children }: { children: React.ReactNode }) {
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