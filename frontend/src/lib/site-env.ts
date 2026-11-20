export type SiteEnv = "development" | "staging" | "production";

// Safety rule: a deployment that forgets to set NEXT_PUBLIC_SITE_ENV must
// have mocks OFF. Only an explicit "staging" value (or local NODE_ENV
// "development") turns mocks on — everything else, including an unset or
// misspelled value, is treated as production.
export function getSiteEnv(): SiteEnv {
  if (process.env.NODE_ENV === "development") return "development";
  const value = process.env.NEXT_PUBLIC_SITE_ENV;
  if (value === "staging" || value === "production") return value;
  return "production";
}

export function isMockAllowed(): boolean {
  return getSiteEnv() !== "production";
}
