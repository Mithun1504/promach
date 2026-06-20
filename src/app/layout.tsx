import type { Metadata } from "next";
import { IBM_Plex_Mono, Plus_Jakarta_Sans, Syncopate } from "next/font/google";
import { CustomCursor } from "@/components/landing/custom-cursor";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const syncopate = Syncopate({
  variable: "--font-display-tech",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ProMach | Precision CNC Manufacturing",
  description:
    "A cinematic precision machining experience for advanced CNC manufacturing, finishing, and inspection.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${plusJakartaSans.variable} ${syncopate.variable} ${ibmPlexMono.variable}`}
      >
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}

