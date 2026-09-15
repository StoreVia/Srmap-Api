import type { Metadata } from "next";
import { ArcadeProvider } from "@/context/ArcadeContext";

export const metadata: Metadata = {
  title: "Arcade",
  description: "Play multiplayer chess, typing test challenges, and arcade mini-games on SRMAP API.",
  alternates: {
    canonical: "https://srmapi.in/arcade",
  },
  openGraph: {
    title: "Arcade | SRMAP API",
    description: "Play multiplayer chess, typing test challenges, and arcade mini-games on SRMAP API.",
    url: "https://srmapi.in/arcade",
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://srmapi.in" },
    { "@type": "ListItem", position: 2, name: "Arcade", item: "https://srmapi.in/arcade" },
  ],
};

export default function ArcadeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ArcadeProvider>{children}</ArcadeProvider>
    </>
  );
}