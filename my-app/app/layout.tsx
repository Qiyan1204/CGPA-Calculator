import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL || "https://cgpacalc.quadrawebs.com";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),

  title: "CGPA Calculator",
  description:
    "CGPA Calculator helps students calculate current CGPA, set target CGPA, and plan future semesters easily and accurately.",
  
  openGraph: {
    title: "CGPA Calculator",
    description: "CGPA Calculator helps students calculate current CGPA, set target CGPA, and plan future semesters easily and accurately.",
    siteName: "CGPA Calculator",
    images: ["/og.png"],
    type: "website",
  },
  
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Suspense>{children}</Suspense>
      </body>
    </html>
  );
}

