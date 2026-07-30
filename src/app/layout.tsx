import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BrightSmile Dental | Gentle Care for Your Smile",
  description:
    "Modern dental clinic offering comprehensive dental services. Book your appointment online or call us today for a brighter, healthier smile.",
  keywords: [
    "dentist",
    "dental clinic",
    "teeth cleaning",
    "dental implants",
    "cosmetic dentistry",
    "teeth whitening",
    "oral health",
  ],
  icons: {
    icon: "/dental-logo.png",
  },
  openGraph: {
    title: "BrightSmile Dental | Gentle Care for Your Smile",
    description:
      "Modern dental clinic offering comprehensive dental services. Book your appointment today.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
