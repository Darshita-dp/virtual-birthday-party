import { ImageResponse } from "next/og";

/**
 * Shared renderer used by both /opengraph-image and /twitter-image. The
 * route-segment config fields (`runtime`, `size`, `alt`, `contentType`) MUST be
 * declared literally in the metadata files themselves — Next can't statically
 * pick them up when re-exported — so only the JSX/ImageResponse lives here.
 */

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

const STARS: Array<{ x: number; y: number; r: number; o: number }> = [
  { x: 60, y: 70, r: 3, o: 0.85 },
  { x: 140, y: 40, r: 2, o: 0.7 },
  { x: 240, y: 100, r: 2.5, o: 0.8 },
  { x: 320, y: 60, r: 2, o: 0.6 },
  { x: 420, y: 90, r: 3, o: 0.9 },
  { x: 520, y: 40, r: 2, o: 0.7 },
  { x: 640, y: 80, r: 2.5, o: 0.85 },
  { x: 760, y: 50, r: 2, o: 0.65 },
  { x: 860, y: 95, r: 3, o: 0.9 },
  { x: 980, y: 55, r: 2, o: 0.75 },
  { x: 1080, y: 80, r: 2.5, o: 0.85 },
  { x: 1140, y: 40, r: 2, o: 0.6 },
  { x: 90, y: 500, r: 2, o: 0.55 },
  { x: 220, y: 540, r: 2.5, o: 0.7 },
  { x: 380, y: 570, r: 2, o: 0.65 },
  { x: 540, y: 520, r: 2.5, o: 0.75 },
  { x: 720, y: 560, r: 2, o: 0.6 },
  { x: 900, y: 540, r: 2.5, o: 0.7 },
  { x: 1060, y: 570, r: 2, o: 0.55 },
];

export function renderOgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(120% 100% at 50% 0%, #2E1A55 0%, #1B0F38 60%, #14092B 100%)",
          color: "#F4EEFF",
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          position: "relative",
          padding: "0 80px",
          textAlign: "center",
        }}
      >
        {STARS.map((s, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: s.x,
              top: s.y,
              width: s.r * 2,
              height: s.r * 2,
              borderRadius: 999,
              background: "#ffffff",
              opacity: s.o,
              boxShadow: "0 0 8px rgba(255,255,255,0.6)",
            }}
          />
        ))}

        <div
          style={{
            display: "flex",
            gap: 32,
            color: "#C6B2F2",
            fontSize: 38,
            letterSpacing: 12,
            marginBottom: 28,
          }}
        >
          ★ ✦ ★
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 22,
            letterSpacing: 6,
            color: "#FF8FC6",
            textShadow: "0 0 12px rgba(255, 120, 180, 0.55)",
            marginBottom: 40,
            textTransform: "uppercase",
          }}
        >
          ✦ You are cordially invited ✦
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 108,
            lineHeight: 1,
            fontWeight: 900,
            letterSpacing: 4,
            color: "#F4C95B",
            textShadow: "0 0 24px rgba(255, 226, 160, 0.65)",
          }}
        >
          DARSHITA&apos;S
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 86,
            lineHeight: 1,
            fontWeight: 900,
            letterSpacing: 4,
            color: "#FF8FC6",
            textShadow: "0 0 24px rgba(255, 120, 180, 0.65)",
            marginTop: 12,
          }}
        >
          VIRTUAL BIRTHDAY
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 46,
            fontSize: 30,
            color: "#CBBEE8",
            letterSpacing: 1,
          }}
        >
          A cozy pixel-art birthday venue ✨
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 34,
            padding: "10px 22px",
            borderRadius: 999,
            background: "rgba(36, 21, 68, 0.85)",
            border: "1px solid rgba(168, 140, 232, 0.5)",
            color: "#F4EEFF",
            fontSize: 20,
            letterSpacing: 1,
          }}
        >
          live demo → virtual-birthday-party-mu.vercel.app
        </div>
      </div>
    ),
    { width: OG_WIDTH, height: OG_HEIGHT },
  );
}
