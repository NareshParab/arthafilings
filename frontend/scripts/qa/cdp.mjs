// Minimal Chrome DevTools Protocol client over the platform's built-in
// fetch/WebSocket (Node 24) — no puppeteer/playwright, per the "no new npm
// packages" constraint. Launches the machine's installed Chrome headlessly
// and talks CDP directly.
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

const CHROME_PATHS = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
];

export async function findChromePath() {
  const { existsSync } = await import("node:fs");
  const found = CHROME_PATHS.find((p) => existsSync(p));
  if (!found) throw new Error("Chrome not found at any known path — update CHROME_PATHS in scripts/qa/cdp.mjs");
  return found;
}

export async function waitForHttp(url, { timeoutMs = 20000, intervalMs = 500 } = {}) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch {
      // not up yet
    }
    await delay(intervalMs);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

export async function launchChrome({ port = 9333, userDataDir } = {}) {
  const exe = await findChromePath();
  const args = [
    `--remote-debugging-port=${port}`,
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--disable-extensions",
    "--hide-scrollbars",
    "--mute-audio",
    `--user-data-dir=${userDataDir}`,
  ];
  const proc = spawn(exe, args, { stdio: "ignore" });
  await waitForHttp(`http://127.0.0.1:${port}/json/version`, { timeoutMs: 20000 });
  return {
    proc,
    port,
    kill: () => {
      try {
        proc.kill();
      } catch {
        // already dead
      }
    },
  };
}

// One CDP session = one browser tab/target, with request/response matching
// by numeric id and a pub/sub for events (Console.messageAdded etc.).
export class CdpSession {
  constructor(ws) {
    this.ws = ws;
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Map();
    ws.addEventListener("message", (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id !== undefined && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      } else if (msg.method) {
        const handlers = this.listeners.get(msg.method);
        if (handlers) handlers.forEach((h) => h(msg.params));
      }
    });
  }

  static async connect(wsUrl) {
    const ws = new WebSocket(wsUrl);
    await new Promise((resolve, reject) => {
      ws.addEventListener("open", resolve, { once: true });
      ws.addEventListener("error", reject, { once: true });
    });
    return new CdpSession(ws);
  }

  send(method, params = {}, timeoutMs = 30000) {
    const id = this.nextId++;
    const payload = JSON.stringify({ id, method, params });
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`CDP ${method} timed out after ${timeoutMs}ms`));
      }, timeoutMs);
      this.pending.set(id, {
        resolve: (v) => {
          clearTimeout(timer);
          resolve(v);
        },
        reject: (e) => {
          clearTimeout(timer);
          reject(e);
        },
      });
      this.ws.send(payload);
    });
  }

  on(method, handler) {
    if (!this.listeners.has(method)) this.listeners.set(method, []);
    this.listeners.get(method).push(handler);
  }

  off(method, handler) {
    const handlers = this.listeners.get(method);
    if (!handlers) return;
    const index = handlers.indexOf(handler);
    if (index !== -1) handlers.splice(index, 1);
  }

  close() {
    this.ws.close();
  }
}

export async function openTab(cdpPort) {
  const res = await fetch(`http://127.0.0.1:${cdpPort}/json/new`, { method: "PUT" });
  const target = await res.json();
  const session = await CdpSession.connect(target.webSocketDebuggerUrl);
  await session.send("Page.enable");
  await session.send("Runtime.enable");
  await session.send("Log.enable");
  await session.send("DOM.enable");
  return { session, targetId: target.id };
}

export async function closeTab(cdpPort, targetId, session) {
  try {
    session.close();
  } catch {
    // already closed
  }
  try {
    await fetch(`http://127.0.0.1:${cdpPort}/json/close/${targetId}`);
  } catch {
    // already closed
  }
}

// Navigate and wait for the Page.loadEventFired event (bounded) — resolves
// even if the event never fires, after timeoutMs, so one hung page never
// blocks the whole sweep.
export async function navigate(session, url, { timeoutMs = 20000 } = {}) {
  let settled = false;
  const handler = () => {
    settled = true;
  };
  session.on("Page.loadEventFired", handler);
  try {
    await session.send("Page.navigate", { url });
    const deadline = Date.now() + timeoutMs;
    while (!settled && Date.now() < deadline) {
      await delay(50);
    }
  } finally {
    // Always remove this call's listener — on 100+ navigations in one
    // session, a dangling listener from a call that hit its timeout would
    // otherwise still be registered and fire (resolving nothing, but
    // leaking) on every later page's load event.
    session.off("Page.loadEventFired", handler);
  }
}

export async function evaluate(session, expression) {
  const result = await session.send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.exception?.description ?? "Runtime.evaluate threw");
  }
  return result.result.value;
}

export function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    delay(ms).then(() => {
      throw new Error(`${label} timed out after ${ms}ms`);
    }),
  ]);
}
