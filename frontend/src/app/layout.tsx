import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import ToastContainer from "@/components/ui/Toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ThePlacementProject — Placement prep that fits your life",
  description:
    "Replace chaotic study plans with a deterministic, timetable-aware navigation engine. Get a realistic weekly schedule, track your streak, and go Pro for ₹29/month.",
  keywords: ["placement prep", "campus placements", "DSA study plan", "engineering jobs India"],
  authors: [{ name: "ThePlacementProject" }],
  openGraph: {
    title: "ThePlacementProject",
    description: "Placement prep that fits your life. Not the other way around.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </head>
      <body className="font-sans antialiased bg-background text-on-surface">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        <ToastContainer />
      </body>
    </html>
  );
}
