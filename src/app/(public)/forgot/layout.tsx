import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Reset your SRM AP student portal password. Recover access to your SRMAP API account securely.",
  alternates: {
    canonical: "https://srmapi.mrpan.in/forgot",
  },
  openGraph: {
    title: "Forgot Password | SRMAP API",
    description: "Reset your SRM AP student portal password. Recover access to your SRMAP API account securely.",
    url: "https://srmapi.mrpan.in/forgot",
  },
};

export default function ForgotLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}