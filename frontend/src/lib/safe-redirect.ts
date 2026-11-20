// A `?next=` value is attacker-controlled input. Only accept a same-site,
// root-relative path — never "//host/path" or "/\host/path" (both of which
// browsers treat as protocol-relative, i.e. an open redirect) and never a
// value that embeds a scheme.
export function getSafeNextPath(value: string | null | undefined, fallback: string): string {
  if (!value) return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  if (/^\/[a-zA-Z][a-zA-Z0-9+.-]*:/.test(value)) return fallback;
  return value;
}
