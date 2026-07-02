import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { fontDisplay, fontNunito, fontPixel } from "@/fonts/fonts";
import "./globals.css";

const SITE_URL = "https://virtual-birthday-party-mu.vercel.app";
const TITLE = "Darshita's Virtual Birthday";
const DESCRIPTION =
  "A cozy, dreamy pixel-art birthday venue. RSVP with a name and avatar, leave a wish for Darshita, and celebrate with confetti and music.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: `%s · ${TITLE}`,
  },
  description: DESCRIPTION,
  applicationName: TITLE,
  authors: [{ name: "Darshita" }],
  keywords: [
    "pixel art",
    "birthday",
    "invitation",
    "Next.js",
    "React",
    "portfolio",
    "web app",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: TITLE,
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#1B0F38",
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
