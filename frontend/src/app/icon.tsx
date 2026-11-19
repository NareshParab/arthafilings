import { ImageResponse } from "next/og";
import { brandColors } from "@/lib/brand-colors";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Generated from our own logo mark (see components/layout/Logo.tsx) — no
// external artwork.
export default function Icon() {
  return new ImageResponse(
    (
      <svg width="32" height="32" viewBox="0 0 32 32">
        <rect width="32" height="32" rx="8" fill={brandColors.navy} />
        <path d="M16 7 L23 23 H18.5 L16 17 L13.5 23 H9 L16 7 Z" fill={brandColors.primary} />
      </svg>
    ),
    { ...size }
  );
}
