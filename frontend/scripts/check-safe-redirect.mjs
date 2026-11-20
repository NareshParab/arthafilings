#!/usr/bin/env node
// Unit-style checks for lib/safe-redirect.ts — no test framework is set up
// in this project yet, so this is a small standalone script. Run with
// `npm run check:safe-redirect`.
import { getSafeNextPath } from "../src/lib/safe-redirect.ts";

const FALLBACK = "/dashboard";

const cases = [
  { value: "/", expectSafe: true },
  { value: "/a?b=1", expectSafe: true },
  { value: "//evil.com", expectSafe: false },
  { value: "/\\evil.com", expectSafe: false },
  { value: "/\t/evil.com", expectSafe: false },
  { value: "https://evil.com", expectSafe: false },
  { value: "javascript:alert(1)", expectSafe: false },
];

let failures = 0;

for (const { value, expectSafe } of cases) {
  const result = getSafeNextPath(value, FALLBACK);
  const isSafe = result === value;
  const ok = isSafe === expectSafe;
  const status = ok ? "PASS" : "FAIL";
  console.log(`${status}: getSafeNextPath(${JSON.stringify(value)}) -> ${JSON.stringify(result)}`);
  if (!ok) failures++;
}

if (failures > 0) {
  console.error(`\n${failures} case(s) failed.`);
  process.exit(1);
}

console.log("\nAll safe-redirect checks passed.");
