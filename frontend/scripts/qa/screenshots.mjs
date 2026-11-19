// QA item 6: mobile (375px) review screenshots, saved to
// frontend/qa-screenshots/ with a qa-sweep- prefix so they're distinct from
// the existing admin-panel QA set already in that directory.
import { writeFileSync, mkdtempSync, rmSync } from "node:fs";
import path from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { setTimeout as delay } from "node:timers/promises";
import { launchChrome, openTab, closeTab, navigate, evaluate } from "./cdp.mjs";
import { startProdServer, QA_BASE_URL } from "./server.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, "../../qa-screenshots");

const AUTH_SEED_SCRIPT = `
  window.localStorage.setItem("af_mock_auth", JSON.stringify({ phone: "9876500000", loggedInAt: new Date().toISOString() }));
  "seeded"
`;

async function capture(session, name) {
  const { data } = await session.send("Page.captureScreenshot", { format: "png" });
  const filePath = path.join(OUT_DIR, `qa-sweep-${name}.png`);
  writeFileSync(filePath, Buffer.from(data, "base64"));
  return filePath;
}

async function main() {
  const userDataDir = mkdtempSync(path.join(tmpdir(), "af-qa-shots-"));
  const server = await startProdServer();
  const chrome = await launchChrome({ port: 9335, userDataDir });
  const saved = [];
  try {
    const { session, targetId } = await openTab(chrome.port);
    await session.send("Emulation.setDeviceMetricsOverride", { width: 375, height: 812, deviceScaleFactor: 2, mobile: true });

    await navigate(session, QA_BASE_URL, { timeoutMs: 15000 });
    await delay(500);
    saved.push(await capture(session, "01-home-375"));

    // Mega menu / hamburger: open the mobile nav sheet via its trigger button.
    await evaluate(
      session,
      `(() => {
        const trigger = document.querySelector('[aria-label="Open menu"], [aria-label="Menu"], button[data-slot="sheet-trigger"]');
        if (trigger) trigger.click();
        return !!trigger;
      })()`
    );
    await delay(500);
    saved.push(await capture(session, "02-mobile-menu-open-375"));

    await navigate(session, `${QA_BASE_URL}/income-tax-e-filing`, { timeoutMs: 15000 });
    await delay(500);
    saved.push(await capture(session, "03-service-page-lead-form-375"));

    await navigate(session, `${QA_BASE_URL}/checkout`, { timeoutMs: 15000 });
    await delay(500);
    saved.push(await capture(session, "04-checkout-step1-375"));

    await navigate(session, `${QA_BASE_URL}/login`, { timeoutMs: 15000 });
    await delay(500);
    saved.push(await capture(session, "05-login-375"));

    await navigate(session, QA_BASE_URL, { timeoutMs: 15000 });
    await evaluate(session, AUTH_SEED_SCRIPT);
    await navigate(session, `${QA_BASE_URL}/dashboard`, { timeoutMs: 15000 });
    await delay(500);
    saved.push(await capture(session, "06-dashboard-overview-375"));

    await closeTab(chrome.port, targetId, session);
  } finally {
    chrome.kill();
    server.stop();
    rmSync(userDataDir, { recursive: true, force: true });
  }
  console.log(JSON.stringify({ saved }, null, 2));
}

main().catch((err) => {
  console.error("Screenshot run failed:", err);
  process.exit(1);
});
