import { renderOgImage } from "@/lib/og-image";

// Next.js Metadata file convention: this file becomes /opengraph-image and is
// wired into the OG metadata automatically. Route segment config MUST be
// declared as literal top-level exports so Next can statically detect them.
// https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image

export const alt = "Darshita's Virtual Birthday — a cozy pixel-art birthday venue";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "edge";

export default function OpengraphImage() {
  return renderOgImage();
}
