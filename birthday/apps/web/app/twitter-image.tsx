import { renderOgImage } from "@/lib/og-image";

// Twitter Card image — same visual as the Open Graph image, exposed under the
// Twitter-specific metadata key. Route segment config MUST be declared as
// literal top-level exports (re-exports aren't statically detected by Next).
// https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image

export const alt = "Darshita's Virtual Birthday — a cozy pixel-art birthday venue";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "edge";

export default function TwitterImage() {
  return renderOgImage();
}
