import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Profile",
  description: "View your SRMAP API student profile, registration details, academic information, and account settings.",
  alternates: {
    canonical: "https://srmapi.in/profile",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}