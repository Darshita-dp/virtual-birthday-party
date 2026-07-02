import { Nunito, Pixelify_Sans, Press_Start_2P } from "next/font/google";

/** Hero / wordmark display face — use only at large, integer sizes. */
export const fontDisplay = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

/** Pixel UI face — headings, chips, buttons, counters, decorative labels. */
export const fontPixel = Pixelify_Sans({
  subsets: ["latin"],
  variable: "--font-pixel",
  display: "swap",
});

/** Readable body face — chat, wishes, paragraphs, inputs. */
export const fontNunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});
