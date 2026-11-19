// QA item 5: performance. Measures real transferred JS bytes per route (our
// stand-in for Turbopack's old "First Load JS" column, which this build's
// output format no longer prints — see docs/QA_REPORT.md for why) across a
// broader route sample, then LCP/CLS on 5 representative pages under
// simulated CPU + Fast-4G throttling.
import { setTimeout as delay } from "node:timers/promises";
import { launchChrome, openTab, closeTab, navigate, evaluate, withTimeout } from "./cdp.mjs";
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

async function measureVitals(cdpPort, baseUrl) {
  const results = [];
  for (const route of VITALS_ROUTES) {
    const { session, targetId } = await openTab(cdpPort);
    try {
      await session.send("Network.enable");
      // LCP only gets recorded while the page is "visible" per the Page
      // Visibility spec — a background tab opened via /json/new never
      // becomes the focused/active target on its own, so without this the
      // browser never emits an LCP candidate at all (confirmed: every
      // route came back lcpMs: null before adding this).
      await session.send("Page.bringToFront");
      await session.send("Emulation.setFocusEmulationEnabled", { enabled: true });
      await session.send("Emulation.setCPUThrottlingRate", { rate: 4 });
      await session.send("Network.emulateNetworkConditions", { offline: false, ...FAST_4G });
      await session.send("Emulation.setDeviceMetricsOverride", { width: 375, height: 800, deviceScaleFactor: 2, mobile: true });

      const start = Date.now();
      await navigate(session, `${baseUrl}${route.path}`, { timeoutMs: 30000 });
      await delay(2500); // let LCP/CLS entries settle under throttling

      const raw = await withTimeout(
        evaluate(
          session,
          `(() => {
            const lcp = performance.getEntriesByType("largest-contentful-paint").pop();
            const cls = performance.getEntriesByType("layout-shift")
              .filter((e) => !e.hadRecentInput)
              .reduce((sum, e) => sum + e.value, 0);
            return JSON.stringify({
              lcpMs: lcp ? lcp.startTime : null,
              cls,
            });
          })()`
        ),
        8000,
        `vitals ${route.path}`
      );
      const parsed = JSON.parse(raw);
      results.push({ ...route, ...parsed, wallClockMs: Date.now() - start });
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
