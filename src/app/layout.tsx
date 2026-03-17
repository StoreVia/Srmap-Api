import "@/app/globals.css";
import "@/css/pages/feedback/RadioButton.css";

import { Suspense } from "react";
import ErrorFallBack from "./error";
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import ErrorBoundary from "@/components/utils/ErrorBoundary";
import { StudentDataProvider } from "@/context/StudentContext";
import ProgressBar from "@/components/client/utils/PageProgress";
import SplashScreen from "@/components/client/loading/SplashScreen";
import { LocalStorageProvider } from "@/context/LocalStorageContext";
import GoogleAnalytics from "@/components/client/analytics/GoogleAnalytics";

export const metadata: Metadata = {
  title: "Srmapi - Alternative Portal For Srmap Students",
  description: "Srmapi is an alternative portal designed for SRMAP students to access track academics, resources, and manage student data easily.",
  keywords: ["Srmap", "Srmapi", "student portal", "alternative portal", "SRM University"],
  authors: [{ name: "Srmapi Team" }],
  metadataBase: new URL("https://srmapi.in"),
  openGraph: {
    title: "Srmapi - Alternative Portal for SRMAP Students",
    description: "An alternative, modern portal for SRMAP students with better features, accessibility, and speed.",
    url: "https://srmapi.in",
    siteName: "Srmapi",
    images: [
      {
        url: "/icons/round_corner_logo.png",
        width: 1024,
        height: 1024,
        alt: "Srmapi",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Srmapi | SRMAP Alternative Portal",
    description: "Srmapi is an alternative student portal for SRMAP students with modern design and better performance.",
    images: ["/icons/round_corner_logo.png"],
  },
  verification: {
    google: "7jojaX5OVabW3qlu",
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" crossOrigin="use-credentials" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon" />
      </head>
      <body>
        <GoogleAnalytics />
        <LocalStorageProvider>
          <AuthProvider>
            <StudentDataProvider>
              <ThemeProvider>
                <ErrorBoundary fallback={<ErrorFallBack />}>
                  <Suspense fallback={<SplashScreen />}>
                    <ProgressBar />
                    {children}
                  </Suspense>
                  <Toaster />
                </ErrorBoundary>
              </ThemeProvider>
            </StudentDataProvider>
          </AuthProvider>
        </LocalStorageProvider>
      </body>
    </html>
  );
}