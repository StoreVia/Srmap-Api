import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GitHub & Open Source",
  description: "View SRMAP API open source contributions, GitHub repository links, and project information.",
  alternates: {
    canonical: "https://srmapi.in/github",
  },
  openGraph: {
    title: "GitHub & Open Source | SRMAP API",
    description: "View SRMAP API open source contributions, GitHub repository links, and project information.",
    url: "https://srmapi.in/github",
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://srmapi.in" },
    { "@type": "ListItem", position: 2, name: "GitHub", item: "https://srmapi.in/github" },
  ],
};

export default function GithubLayout({ children }: { children: React.ReactNode }) {
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