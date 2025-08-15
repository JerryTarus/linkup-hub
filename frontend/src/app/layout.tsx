import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

// --- Import the Toaster from Sonner ---
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// --- Enhanced Metadata for the Project ---
export const metadata: Metadata = {
  title: "Link Up Hub - Connect and Engage",
  description: "A modern, secure, and vibrant community-driven platform for event management, networking, and real-time engagement.",
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
        {children}
        
        {/* --- Add the Toaster component here --- */}
        {/* This will render notifications anywhere in your app. */}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}