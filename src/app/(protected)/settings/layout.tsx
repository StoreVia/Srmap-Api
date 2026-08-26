import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your SRMAP API account settings, preferences, theme, startup page, and notification options.",
  alternates: {
    canonical: "https://srmapi.in/settings",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}