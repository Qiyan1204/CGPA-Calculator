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

export const metadata: Metadata = {
  metadataBase: new URL("https://cgpa.quadrawebs.com"), // 👈 换成你的正式域名

  title: {
    default: "CGPA Calculator",
    template: "%s | CGPA Calculator",
  },

  description:
    "CGPA Calculator helps students calculate current CGPA, set target CGPA, and plan future semesters easily and accurately.",

  applicationName: "CGPA Calculator",

  openGraph: {
    title: "CGPA Calculator",
    description:
      "Calculate CGPA, set target CGPA, and plan your academic journey easily.",
    url: "https://cgpa.quadrawebs.com",
    siteName: "CGPA Calculator",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "CGPA Calculator – Plan Your Academic Journey",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "CGPA Calculator",
    description:
      "Calculate CGPA, set target CGPA, and plan your academic journey.",
    images: ["/og.png"],
  },

  icons: {
    icon: "/favicon.ico",
  },

  robots: {
    index: true,
    follow: true,
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

