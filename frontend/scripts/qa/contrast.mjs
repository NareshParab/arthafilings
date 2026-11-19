// QA item 3: WCAG contrast ratios for the palette token pairs this app
// actually renders (read by eye from globals.css + component classNames,
// not auto-extracted — there's no build step that maps Tailwind classes
// back to token pairs, so this list is maintained by hand as the palette
// changes).
function hexToRgb(hex) {
  const n = hex.replace("#", "");
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  return [r, g, b];
}

function blend(fgHex, alpha, bgHex) {
  const [fr, fg, fb] = hexToRgb(fgHex);
  const [br, bg, bb] = hexToRgb(bgHex);
  const r = Math.round(fr * alpha + br * (1 - alpha));
  const g = Math.round(fg * alpha + bg * (1 - alpha));
  const b = Math.round(fb * alpha + bb * (1 - alpha));
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

function relativeLuminance(hex) {
  const [r, g, b] = hexToRgb(hex).map((c) => c / 255);
  const toLinear = (c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const [rl, gl, bl] = [toLinear(r), toLinear(g), toLinear(b)];
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

export function contrastRatio(fgHex, bgHex) {
  const l1 = relativeLuminance(fgHex);
  const l2 = relativeLuminance(bgHex);
  const [lighter, darker] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (lighter + 0.05) / (darker + 0.05);
}

export const tokens = {
  foreground: "#1b2433",
  background: "#f6f8fb",
  white: "#ffffff",
  cream: "#fbf6ea",
  blueTint: "#eaf1fb",
  primary: "#1e4fa3",
  primaryForeground: "#ffffff",
  navy: "#0f2a4a",
  mutedForeground: "#5b6678",
  gold: "#926e26",
};

export const pairs = [
  { label: "body text on background (off-white)", fg: tokens.foreground, bg: tokens.background },
  { label: "body text on white (card)", fg: tokens.foreground, bg: tokens.white },
  { label: "body text on cream", fg: tokens.foreground, bg: tokens.cream },
  { label: "body text on blue-tint", fg: tokens.foreground, bg: tokens.blueTint },
  { label: "white text on primary (buttons)", fg: tokens.primaryForeground, bg: tokens.primary },
  { label: "muted text on background", fg: tokens.mutedForeground, bg: tokens.background },
  { label: "muted text on white", fg: tokens.mutedForeground, bg: tokens.white },
  { label: "footer: blue-tint text on navy (full opacity nav links)", fg: tokens.blueTint, bg: tokens.navy, alpha: 1 },
  { label: "footer: blue-tint/80 text on navy (column links)", fg: tokens.blueTint, bg: tokens.navy, alpha: 0.8 },
  { label: "footer: blue-tint/70 text on navy (copyright/social)", fg: tokens.blueTint, bg: tokens.navy, alpha: 0.7 },
  { label: "footer: white text on navy (headings/logo)", fg: tokens.white, bg: tokens.navy, alpha: 1 },
  { label: "gold Popular badge: white text on gold", fg: tokens.white, bg: tokens.gold },
];

function run() {
  const results = pairs.map((pair) => {
    const effectiveFg = pair.alpha !== undefined && pair.alpha < 1 ? blend(pair.fg, pair.alpha, pair.bg) : pair.fg;
    const ratio = contrastRatio(effectiveFg, pair.bg);
    return { ...pair, effectiveFg, ratio };
  });

  for (const r of results) {
    const status = r.ratio >= 4.5 ? "PASS" : "FAIL";
    console.log(`${status}  ${r.ratio.toFixed(2)}:1  ${r.label}  (${r.fg} on ${r.bg}${r.alpha !== undefined ? `, effective ${r.effectiveFg}` : ""})`);
  }
  return results;
}

import { pathToFileURL } from "node:url";

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  run();
}
