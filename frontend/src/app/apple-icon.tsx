import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Generated from our own logo mark (see components/layout/Logo.tsx) — no
// external artwork.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0f2a4a",
        }}
      >
        <svg width="120" height="120" viewBox="0 0 32 32">
          <path d="M16 7 L23 23 H18.5 L16 17 L13.5 23 H9 L16 7 Z" fill="#1e4fa3" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
