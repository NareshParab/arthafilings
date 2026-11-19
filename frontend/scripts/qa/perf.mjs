// QA item 5: performance. Measures real transferred JS bytes per route (our
// stand-in for Turbopack's old "First Load JS" column, which this build's
// output format no longer prints — see docs/QA_REPORT.md for why) across a
// broader route sample, then LCP/CLS on 5 representative pages under
// simulated CPU + Fast-4G throttling.
import { setTimeout as delay } from "node:timers/promises";
import { launchChrome, openTab, closeTab, navigate, evaluate, withTimeout, waitUntil } from "./cdp.mjs";
import { startProdServer, QA_BASE_URL } from "./server.mjs";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

// Published "Fast 4G" figures (Lighthouse's preset): ~1.6 Mbps down,
// ~0.75 Mbps up, 150ms RTT.
const FAST_4G = {
  downloadThroughput: (1.6 * 1024 * 1024) / 8,
  uploadThroughput: (0.75 * 1024 * 1024) / 8,
  latency: 150,
};

const JS_SIZE_ROUTES = [
  "/",
  "/proprietorship-registration",
  "/partnership",
  "/trademark-registration",
  "/gst-registration",
  "/services/startup",
  "/services/registrations",
  "/about",
  "/contact",
  "/checkout",
  "/login",
  "/dashboard",
  "/admin/services",
  "/terms",
  "/privacy",
];

const VITALS_ROUTES = [
  { label: "home", path: "/" },
  { label: "service page", path: "/proprietorship-registration" },
  { label: "checkout", path: "/checkout" },
  { label: "dashboard", path: "/dashboard" },
  { label: "group page", path: "/services/startup" },
];

async function measureJsBytes(cdpPort, baseUrl) {
  const { session, targetId } = await openTab(cdpPort);
  const results = [];
  for (const routePath of JS_SIZE_ROUTES) {
    const requests = [];
    const dataByRequestId = new Map();
    const responseHandler = (p) => {
      if (p.type === "Script") dataByRequestId.set(p.requestId, p);
    };
    session.on("Network.responseReceived", responseHandler);
    const finishedHandler = (p) => {
      const meta = dataByRequestId.get(p.requestId);
      if (meta) requests.push({ ...meta, encodedDataLength: p.encodedDataLength });
    };
    session.on("Network.loadingFinished", finishedHandler);

    await session.send("Network.enable");
    await session.send("Network.setCacheDisabled", { cacheDisabled: true });
    await navigate(session, `${baseUrl}${routePath}`, { timeoutMs: 15000 });
    await delay(800);
    // Remove this iteration's listeners before the next route navigates —
    // left registered, every earlier route's handler would keep firing on
    // every later route's network events too (harmless here since each
    // closes over its own now-stale map, but still a real listener leak
    // across 14 iterations).
    session.off("Network.responseReceived", responseHandler);
    session.off("Network.loadingFinished", finishedHandler);

    const totalBytes = requests.reduce((sum, r) => sum + (r.encodedDataLength || 0), 0);
    results.push({ path: routePath, scriptRequests: requests.length, totalJsBytes: totalBytes });
  }
  await closeTab(cdpPort, targetId, session);
  return results.sort((a, b) => b.totalJsBytes - a.totalJsBytes).slice(0, 10);
}

// LCP trace categories — the web Performance Timeline API
// (`getEntriesByType("largest-contentful-paint")`) never reports an entry for
// a tab opened via CDP's /json/new: the LCP spec permanently suppresses it
// for any document that was ever non-visible during its lifetime, and a
// freshly created CDP target has exactly that kind of hidden window around
// creation — confirmed empirically (every route came back lcpMs: null even
// with Page.bringToFront + focus emulation forced on). Lighthouse and other
// lab tools hit the same restriction and work around it the same way: read
// the `largestContentfulPaint::Candidate` trace event via the CDP Tracing
// domain instead, which isn't subject to the web API's visibility rule.
const LCP_TRACE_CATEGORIES = "loading,devtools.timeline,disabled-by-default-devtools.timeline,blink.user_timing,rail";

async function measureLcpViaTracing(session, url, { settleMs = 3000 } = {}) {
  const events = [];
  session.on("Tracing.dataCollected", (p) => events.push(...(p.value || [])));
  let tracingDone = false;
  const doneHandler = () => (tracingDone = true);
  session.on("Tracing.tracingComplete", doneHandler);

  try {
    await session.send("Tracing.start", { categories: LCP_TRACE_CATEGORIES, transferMode: "ReportEvents" });
    await navigate(session, url, { timeoutMs: 30000 });
    await delay(settleMs);
    await session.send("Tracing.end");
    await waitUntil(() => tracingDone, { timeoutMs: 10000, intervalMs: 100 });
  } finally {
    session.off("Tracing.tracingComplete", doneHandler);
  }

  const lcpCandidate = events.filter((e) => e.name === "largestContentfulPaint::Candidate").pop();
  if (!lcpCandidate) return null;
  // Multiple navigationStart events can show up (e.g. the tab's initial
  // about:blank load) — the one for *this* navigation is the closest one
  // preceding the LCP candidate's own timestamp, not necessarily the first.
  const navStart = events
    .filter((e) => e.name === "navigationStart" && e.ts <= lcpCandidate.ts)
    .sort((a, b) => b.ts - a.ts)[0];
  if (!navStart) return null;
  return (lcpCandidate.ts - navStart.ts) / 1000; // trace ts is in microseconds
}

async function measureVitals(cdpPort, baseUrl) {
  const results = [];
  for (const route of VITALS_ROUTES) {
    const { session, targetId } = await openTab(cdpPort);
    try {
      await session.send("Network.enable");
      await session.send("Emulation.setCPUThrottlingRate", { rate: 4 });
      await session.send("Network.emulateNetworkConditions", { offline: false, ...FAST_4G });
      await session.send("Emulation.setDeviceMetricsOverride", { width: 375, height: 800, deviceScaleFactor: 2, mobile: true });

      const start = Date.now();
      // Budget comfortably above measureLcpViaTracing's own worst case
      // (navigate's 30000ms + 3000ms settle + 10000ms tracing-complete poll)
      // — a tighter outer timeout here would abandon the result while the
      // inner call keeps running, leaking a pending CDP command against a
      // tab this loop closes moments later.
      const lcpMs = await withTimeout(
        measureLcpViaTracing(session, `${baseUrl}${route.path}`),
        50000,
        `lcp trace ${route.path}`
      );
      const wallClockMs = Date.now() - start;

      const clsRaw = await withTimeout(
        evaluate(
          session,
          `JSON.stringify(performance.getEntriesByType("layout-shift")
            .filter((e) => !e.hadRecentInput)
            .reduce((sum, e) => sum + e.value, 0))`
        ),
        8000,
        `cls ${route.path}`
      );
      results.push({ ...route, lcpMs, cls: JSON.parse(clsRaw), wallClockMs });
    } catch (err) {
      results.push({ ...route, error: String(err.message || err) });
    } finally {
      await closeTab(cdpPort, targetId, session);
    }
  }
  return results;
}

async function main() {
  const userDataDir = mkdtempSync(path.join(tmpdir(), "af-qa-perf-"));
  const server = await startProdServer();
  const chrome = await launchChrome({ port: 9334, userDataDir });
  const report = {};
  try {
    console.error("Measuring JS bytes per route...");
    report.jsBytes = await measureJsBytes(chrome.port, QA_BASE_URL);
    console.error("Measuring LCP/CLS under throttling...");
    report.vitals = await measureVitals(chrome.port, QA_BASE_URL);
  } finally {
    chrome.kill();
    server.stop();
    rmSync(userDataDir, { recursive: true, force: true });
  }
  console.log(JSON.stringify(report, null, 2));
}

main().catch((err) => {
  console.error("Perf run failed:", err);
  process.exit(1);
});
