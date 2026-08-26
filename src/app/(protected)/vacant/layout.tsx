import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vacant Rooms",
  description: "Find currently vacant classrooms and labs at SRM University AP. Check room availability for study sessions or group work.",
  alternates: {
    canonical: "https://srmapi.in/vacant",
  },
  openGraph: {
    title: "Vacant Rooms | SRMAP API",
    description: "Find currently vacant classrooms and labs at SRM University AP. Check room availability for study sessions or group work.",
    url: "https://srmapi.in/vacant",
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://srmapi.in" },
    { "@type": "ListItem", position: 2, name: "Vacant Rooms", item: "https://srmapi.in/vacant" },
  ],
};

export default function VacantLayout({ children }: { children: React.ReactNode }) {
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