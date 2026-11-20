// Backslash, tab, newline, carriage return and other control characters are
// all ways browsers or downstream code can be tricked into treating a
// "same-site" path as something else (e.g. "/\evil.com" as protocol-relative,
// or a stray newline smuggled into a header). Reject the lot.
const CONTROL_CHAR_OR_BACKSLASH_PATTERN = /[\u0000-\u001f\u007f\\]/;

// A `?next=` value is attacker-controlled input. Only accept a same-site,
// root-relative path — never "//host/path" (which browsers treat as
// protocol-relative, i.e. an open redirect) and never a value that embeds a
// scheme or a control character.
export function getSafeNextPath(value: string | null | undefined, fallback: string): string {
  if (!value) return fallback;
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  if (CONTROL_CHAR_OR_BACKSLASH_PATTERN.test(value)) return fallback;
  if (/^\/[a-zA-Z][a-zA-Z0-9+.-]*:/.test(value)) return fallback;
  return value;
}
