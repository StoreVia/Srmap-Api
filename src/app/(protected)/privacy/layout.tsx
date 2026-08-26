import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Read the SRMAP API privacy policy. Learn how we handle your data, credentials, and personal information securely.",
  alternates: {
    canonical: "https://srmapi.in/privacy",
  },
  openGraph: {
    title: "Privacy Policy | SRMAP API",
    description: "Read the SRMAP API privacy policy. Learn how we handle your data, credentials, and personal information securely.",
    url: "https://srmapi.in/privacy",
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}