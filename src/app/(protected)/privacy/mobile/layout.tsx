import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mobile App Privacy Policy",
  description: "Read the SRMAP API mobile application privacy policy and security commitment for student data.",
  alternates: {
    canonical: "https://srmapi.in/privacy/mobile",
  },
  openGraph: {
    title: "Mobile App Privacy Policy | SRMAP API",
    description: "Read the SRMAP API mobile application privacy policy and security commitment for student data.",
    url: "https://srmapi.in/privacy/mobile",
  },
};

export default function MobilePrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}