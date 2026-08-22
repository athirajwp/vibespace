import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "VibeSpace — Synchronized Music Social Platform",
  description:
    "Connect, share moments, chat, explore spaces, and listen to music together in real-time.",
  keywords: [
    "VibeSpace",
    "Listen Together",
    "Synchronized Music",
    "Couple Space",
    "Social Platform",
    "Music Rooms",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakarta.variable}`}>
      <body className="bg-[#F0F2F5] text-[#050505] min-h-screen antialiased selection:bg-[#1877F2] selection:text-white">
        {children}
      </body>
    </html>
  );
}
