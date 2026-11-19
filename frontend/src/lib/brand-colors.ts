// Raw hex mirrors of the --navy/--primary tokens in app/globals.css, for use
// in generated-image routes (icon.tsx, apple-icon.tsx, opengraph-image.tsx).
// next/og's ImageResponse renders via satori outside the DOM, so it can't
// resolve CSS custom properties — these values must be kept in sync with
// globals.css by hand if the brand palette changes.
export const brandColors = {
  navy: "#0f2a4a",
  primary: "#1e4fa3",
} as const;
