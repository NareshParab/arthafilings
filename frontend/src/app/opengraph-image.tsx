import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site-config";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Generated from our own logo mark and brand palette (see Logo.tsx and
// globals.css) — no external artwork.
export default function OpengraphImage() {
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
          gap: 32,
          backgroundColor: "#0f2a4a",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="96" height="96" viewBox="0 0 32 32">
            <rect width="32" height="32" rx="8" fill="#0f2a4a" />
            <path d="M16 7 L23 23 H18.5 L16 17 L13.5 23 H9 L16 7 Z" fill="#1e4fa3" />
          </svg>
          <span style={{ fontSize: 72, fontWeight: 700 }}>{siteConfig.name}</span>
        </div>
        <span style={{ fontSize: 32, color: "#cdd8e6" }}>{siteConfig.tagline}</span>
      </div>
    ),
    { ...size }
  );
}
