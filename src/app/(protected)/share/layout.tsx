import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Secure Share",
  description: "Share text, code, and files securely with password protection, expiration timers, and single-use download links between SRM AP students.",
  alternates: {
    canonical: "https://srmapi.in/share",
  },
  openGraph: {
    title: "Secure Share | SRMAP API",
    description: "Share text, code, and files securely with password protection, expiration timers, and single-use download links between SRM AP students.",
    url: "https://srmapi.in/share",
  },
};

export default function ShareLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
