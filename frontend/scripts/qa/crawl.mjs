// QA item 1: link crawler. Plain fetch() against the running production
// server is enough for the public site — every public route here is a
// server component, so the link set doesn't depend on client JS running.
// /admin and /dashboard are the exception: their auth guard is a client
// component that redirects via router.replace(), which a bare fetch()
// never sees — those two are checked separately with a real browser in
// run.mjs and reported alongside this crawl's results.
import { serviceGroups, services } from "../../src/data/service-catalog.ts";

export function collectExpectedUrls() {
  const publicPaths = [
    "/",
    "/about",
    "/contact",
    "/services",
    "/terms",
    "/privacy",
    "/refund-policy",
    "/disclaimer",
    "/checkout",
    "/checkout/success",
    "/checkout/failed",
    "/login",
  ];
  const groupPaths = serviceGroups.map((g) => `/services/${g.slug}`);
  const servicePaths = services.filter((s) => s.mode !== "hidden").map((s) => `/${s.slug}`);
  return {
    publicPaths,
    groupPaths,
    servicePaths,
    all: [...new Set([...publicPaths, ...groupPaths, ...servicePaths])],
  };
}

export async function crawl(baseUrl) {
  const { all, groupPaths, servicePaths } = collectExpectedUrls();
  const results = [];
  for (const path of all) {
    let status = null;
    let error = null;
    try {
      const res = await fetch(`${baseUrl}${path}`, { redirect: "manual" });
      status = res.status;
    } catch (e) {
      error = e.message;
    }
    results.push({ path, status, error });
  }
  const broken = results.filter((r) => r.error || (r.status !== 200 && !(r.status >= 300 && r.status < 400)));
  const servicesOk = servicePaths.every((p) => results.find((r) => r.path === p)?.status === 200);
  const groupsOk = groupPaths.every((p) => results.find((r) => r.path === p)?.status === 200);
  return { results, broken, servicesOk, groupsOk, serviceCount: servicePaths.length, groupCount: groupPaths.length };
}
