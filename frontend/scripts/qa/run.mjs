// QA sweep orchestrator — items 1, 2, 4, 5, 6. Run with:
//   npx tsx scripts/qa/run.mjs
// Builds the production server once, launches one headless Chrome, and
// reuses both across phases. Writes a JSON results blob to stdout at the
// end (redirect to a file to feed docs/QA_REPORT.md).
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { launchChrome, openTab, closeTab, navigate, evaluate, withTimeout } from "./cdp.mjs";
import { startProdServer, QA_BASE_URL } from "./server.mjs";
import { crawl } from "./crawl.mjs";
import { AUDIT_SCRIPT } from "./page-checks.mjs";

const WIDTHS = [375, 768, 1280, 1440];

const SMOKE_PAGES = [
  { label: "home", path: "/" },
  { label: "service: no extra fields", path: "/proprietorship-registration" },
  { label: "service: state", path: "/partnership" },
  { label: "service: brandName", path: "/trademark-registration" },
  { label: "service: pan", path: "/gst-registration" },
  { label: "service: gstin", path: "/gst-return-filing-by-accountant" },
  { label: "service: country", path: "/gst-registration-for-foreigners" },
  { label: "service: productCatalogOptional", path: "/bis-registration" },
  { label: "service: askBox", path: "/food-testing" },
  { label: "service: stateUt+pan", path: "/income-tax-e-filing" },
  { label: "service: state (startup breadth)", path: "/llp-registration" },
  { label: "service: MCA, no extra", path: "/company-compliance" },
  { label: "service: global, no extra", path: "/uae-company-registration" },
  { label: "group: startup", path: "/services/startup" },
  { label: "group: registrations", path: "/services/registrations" },
  { label: "group: trademark", path: "/services/trademark" },
  { label: "about", path: "/about" },
  { label: "contact", path: "/contact" },
  { label: "terms", path: "/terms" },
  { label: "privacy", path: "/privacy" },
  { label: "checkout", path: "/checkout" },
  { label: "login", path: "/login" },
];

const AUTH_SEED_SCRIPT = `
  window.localStorage.setItem("af_mock_auth", JSON.stringify({ phone: "9876500000", loggedInAt: new Date().toISOString() }));
  window.localStorage.setItem("af_admin_mock_session", JSON.stringify({ userId: "staff-1", name: "QA Staff", role: "staff" }));
  "seeded"
`;

async function runSmokeAndDashboardAdmin(cdpPort, baseUrl) {
  const { session, targetId } = await openTab(cdpPort);
  const consoleBuffer = [];
  session.on("Runtime.consoleAPICalled", (p) => {
    if (p.type === "error" || p.type === "warning") {
      consoleBuffer.push({ type: p.type, text: (p.args || []).map((a) => a.description || a.value).join(" ") });
    }
  });
  session.on("Runtime.exceptionThrown", (p) => {
    consoleBuffer.push({ type: "exception", text: p.exceptionDetails?.text || "uncaught exception" });
  });

  // Seed auth once on the origin, then it's available for /dashboard and
  // /admin/* navigations within this same tab/session for the rest of the run.
  await navigate(session, baseUrl, { timeoutMs: 15000 });
  await evaluate(session, AUTH_SEED_SCRIPT);

  const pageResults = [];
  const allPages = [...SMOKE_PAGES, { label: "dashboard (authed)", path: "/dashboard" }, { label: "admin services (authed)", path: "/admin/services" }];

  for (const page of allPages) {
    for (const width of WIDTHS) {
      const key = `${page.label} @ ${width}px`;
      try {
        await session.send("Emulation.setDeviceMetricsOverride", {
          width,
          height: 900,
          deviceScaleFactor: 1,
          mobile: width < 768,
        });
        consoleBuffer.length = 0;
        await navigate(session, `${baseUrl}${page.path}`, { timeoutMs: 15000 });
        await delay(400); // settle hydration
        const raw = await withTimeout(evaluate(session, AUDIT_SCRIPT), 10000, `audit ${key}`);
        const audit = JSON.parse(raw);
        pageResults.push({ page: page.label, path: page.path, width, ...audit, consoleIssues: [...consoleBuffer] });
      } catch (err) {
        pageResults.push({ page: page.label, path: page.path, width, error: String(err.message || err) });
      }
    }
  }

  await closeTab(cdpPort, targetId, session);
  return pageResults;
}

async function runRedirectCheck(cdpPort, baseUrl) {
  const { session, targetId } = await openTab(cdpPort);
  const out = {};
  for (const path of ["/dashboard", "/admin/services"]) {
    try {
      await navigate(session, `${baseUrl}${path}`, { timeoutMs: 10000 });
      await delay(600);
      const url = await evaluate(session, "window.location.pathname");
      out[path] = { landedOn: url, expectedLoginRedirect: path === "/dashboard" ? "/login" : "/admin/login" };
    } catch (err) {
      out[path] = { error: String(err.message || err) };
    }
  }
  await closeTab(cdpPort, targetId, session);
  return out;
}

async function runKeyboardCheck(cdpPort, baseUrl) {
  const KB_PAGES = [
    { label: "home", path: "/" },
    { label: "service with lead form", path: "/income-tax-e-filing" },
    { label: "checkout", path: "/checkout" },
    { label: "login", path: "/login" },
  ];
  const { session, targetId } = await openTab(cdpPort);
  const out = [];
  for (const page of KB_PAGES) {
    try {
      await session.send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
      await navigate(session, `${baseUrl}${page.path}`, { timeoutMs: 15000 });
      await delay(400);
      await evaluate(session, "document.body.focus(); document.activeElement && document.activeElement.blur && document.activeElement.blur();");
      const stops = [];
      const MAX_TABS = 40;
      for (let i = 0; i < MAX_TABS; i++) {
        await session.send("Input.dispatchKeyEvent", { type: "keyDown", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
        await session.send("Input.dispatchKeyEvent", { type: "keyUp", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
        await delay(40);
        const info = await withTimeout(
          evaluate(
            session,
            `(() => {
              const el = document.activeElement;
              if (!el || el === document.body) return JSON.stringify({ end: true });
              const style = getComputedStyle(el);
              const hasRing = style.outlineStyle !== "none" && style.outlineWidth !== "0px";
              const hasShadowRing = style.boxShadow && style.boxShadow !== "none";
              return JSON.stringify({
                tag: el.tagName,
                text: (el.textContent || el.getAttribute("aria-label") || el.getAttribute("placeholder") || "").trim().slice(0, 40),
                hasVisibleFocus: hasRing || hasShadowRing,
              });
            })()`
          ),
          5000,
          `tab-stop ${i}`
        );
        const parsed = JSON.parse(info);
        if (parsed.end) break;
        stops.push(parsed);
      }
      const noFocusRing = stops.filter((s) => !s.hasVisibleFocus);
      out.push({ page: page.label, totalStops: stops.length, noFocusRingCount: noFocusRing.length, noFocusRingSample: noFocusRing.slice(0, 5), stops });
    } catch (err) {
      out.push({ page: page.label, error: String(err.message || err) });
    }
  }
  await closeTab(cdpPort, targetId, session);
  return out;
}

async function main() {
  const userDataDir = mkdtempSync(path.join(tmpdir(), "af-qa-chrome-"));
  console.error("Building production server...");
  const server = await startProdServer();
  console.error("Launching headless Chrome...");
  const chrome = await launchChrome({ port: 9333, userDataDir });

  const report = {};
  try {
    console.error("Phase 1: link crawl");
    report.crawl = await crawl(QA_BASE_URL);

    console.error("Phase 1b: /admin & /dashboard redirect check");
    report.redirects = await runRedirectCheck(chrome.port, QA_BASE_URL);

    console.error("Phase 2: page smoke test (24 pages x 4 widths)");
    report.smoke = await runSmokeAndDashboardAdmin(chrome.port, QA_BASE_URL);

    console.error("Phase 4: keyboard/focus check");
    report.keyboard = await runKeyboardCheck(chrome.port, QA_BASE_URL);
  } finally {
    chrome.kill();
    server.stop();
    rmSync(userDataDir, { recursive: true, force: true });
  }

  console.log(JSON.stringify(report, null, 2));
}

main().catch((err) => {
  console.error("QA run failed:", err);
  process.exit(1);
});
