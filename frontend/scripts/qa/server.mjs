// Starts/stops the Next.js production server on a fixed port for the QA
// scripts — perf numbers need a real production build, and reusing one
// server across the crawl/smoke/contrast/screenshot phases avoids paying
// the build cost repeatedly.
import { spawn, execSync } from "node:child_process";
import { waitForHttp } from "./cdp.mjs";

export const QA_PORT = 3100;
export const QA_BASE_URL = `http://127.0.0.1:${QA_PORT}`;

// On Windows, `npx`/shell-spawned child processes leave the real `next
// start` node process running after proc.kill() — it only kills the shell
// wrapper, not its child. taskkill /t kills the whole tree.
function killTree(pid) {
  if (process.platform === "win32") {
    try {
      execSync(`taskkill /pid ${pid} /t /f`, { stdio: "ignore" });
    } catch {
      // already dead
    }
  } else {
    try {
      process.kill(-pid, "SIGKILL");
    } catch {
      // already dead
    }
  }
}

export async function startProdServer() {
  const proc = spawn("npx", ["next", "start", "-p", String(QA_PORT)], {
    shell: true,
    stdio: "ignore",
    detached: process.platform !== "win32",
    env: { ...process.env, NEXT_PUBLIC_SITE_URL: QA_BASE_URL },
  });
  await waitForHttp(`${QA_BASE_URL}/`, { timeoutMs: 30000, intervalMs: 500 });
  return {
    proc,
    stop: () => killTree(proc.pid),
  };
}
