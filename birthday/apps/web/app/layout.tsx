import type { Metadata } from "next";
import type { ReactNode } from "react";
import { fontDisplay, fontNunito, fontPixel } from "@/fonts/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Darshita's Virtual Birthday",
  description: "A cozy pixel-art multiplayer birthday venue.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${fontDisplay.variable} ${fontPixel.variable} ${fontNunito.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
