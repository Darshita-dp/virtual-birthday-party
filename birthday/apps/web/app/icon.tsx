import { ImageResponse } from "next/og";

// Next.js Metadata files: this file becomes /icon and is auto-linked as favicon.
// https://nextjs.org/docs/app/api-reference/file-conventions/metadata/app-icons

export const size = { width: 32, height: 32 };
export const contentType = "image/png";
export const runtime = "edge";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background:
            "radial-gradient(120% 100% at 50% 0%, #2E1A55 0%, #1B0F38 60%, #14092B 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 8,
        }}
      >
        <div
          style={{
            fontSize: 22,
            lineHeight: 1,
            color: "#FF8FC6",
            textShadow: "0 0 6px rgba(255, 120, 180, 0.9)",
          }}
        >
          ♡
        </div>
      </div>
    ),
    { ...size },
  );
}
