import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Faculty Feedback",
  description: "Submit and manage faculty feedback for SRM University AP courses. Rate your professors and share your experience.",
  alternates: {
    canonical: "https://srmapi.mrpan.in/feedback",
  },
  openGraph: {
    title: "Faculty Feedback | SRMAP API",
    description: "Submit and manage faculty feedback for SRM University AP courses. Rate your professors and share your experience.",
    url: "https://srmapi.mrpan.in/feedback",
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://srmapi.mrpan.in" },
    { "@type": "ListItem", position: 2, name: "Faculty Feedback", item: "https://srmapi.mrpan.in/feedback" },
  ],
};

export default function FeedbackLayout({ children }: { children: React.ReactNode }) {
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