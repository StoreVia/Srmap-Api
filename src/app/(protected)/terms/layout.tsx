import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Read the SRMAP API terms of service, usage guidelines, and acceptable use policy for the student portal.",
  alternates: {
    canonical: "https://srmapi.in/terms",
  },
  openGraph: {
    title: "Terms of Service | SRMAP API",
    description: "Read the SRMAP API terms of service, usage guidelines, and acceptable use policy for the student portal.",
    url: "https://srmapi.in/terms",
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}