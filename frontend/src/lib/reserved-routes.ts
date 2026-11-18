// Top-level route segments the [service] catch-all must never shadow.
export const reservedRoutes = [
  "about",
  "contact",
  "terms",
  "privacy",
  "refund-policy",
  "disclaimer",
  "checkout",
  "login",
  "dashboard",
  "admin",
  "services",
] as const;

export function assertNoReservedSlugCollisions(slugs: string[]) {
  const collisions = slugs.filter((slug) => (reservedRoutes as readonly string[]).includes(slug));
  if (collisions.length > 0) {
    throw new Error(
      `Service catalog slug(s) collide with reserved routes: ${collisions.join(", ")}`
    );
  }
}
