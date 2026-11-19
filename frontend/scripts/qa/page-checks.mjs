// Shared in-page audit snippet for the smoke test (item 2) — evaluated via
// Runtime.evaluate on an already-loaded page. Kept as a single string (not
// a real module) because CDP only runs code we hand it as source text in
// the browser context.
export const AUDIT_SCRIPT = `
(() => {
  const title = document.title;
  const h1s = document.querySelectorAll("h1");
  const overflow = document.documentElement.scrollWidth > window.innerWidth + 1;
  const scrollWidth = document.documentElement.scrollWidth;
  const innerWidth = window.innerWidth;

  // alt="" is a deliberate, valid way to mark an image decorative (screen
  // readers skip it) — only a genuinely *missing* alt attribute is a
  // violation, not an intentionally empty one.
  const imgsMissingAlt = Array.from(document.querySelectorAll("img"))
    .filter((img) => !img.hasAttribute("alt"))
    .map((img) => img.getAttribute("src") || img.outerHTML.slice(0, 80));

  function hasAccessibleName(el) {
    if (el.getAttribute("aria-label")?.trim()) return true;
    if (el.getAttribute("aria-labelledby")) return true;
    if (el.textContent?.trim()) return true;
    if (["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName)) {
      const id = el.getAttribute("id");
      if (id && document.querySelector('label[for="' + id + '"]')) return true;
      if (el.closest("label")) return true;
      if (el.getAttribute("placeholder")?.trim() && el.getAttribute("type") !== "hidden") return true;
      if (el.getAttribute("type") === "hidden") return true;
    }
    return false;
  }

  // Exclude elements intentionally pulled out of the accessibility tree and
  // tab order (e.g. a UI library's hidden shadow <input> that mirrors a
  // custom Select for native form submission) — they aren't user-facing
  // controls, so "no accessible name" doesn't apply to them.
  const unnamedControls = Array.from(document.querySelectorAll("button, input:not([type=hidden]), textarea, select"))
    .filter((el) => !el.disabled)
    .filter((el) => el.getAttribute("aria-hidden") !== "true" && el.getAttribute("tabindex") !== "-1")
    .filter((el) => !hasAccessibleName(el))
    .map((el) => el.outerHTML.slice(0, 100));

  return JSON.stringify({
    title,
    h1Count: h1s.length,
    h1Texts: Array.from(h1s).map((h) => h.textContent?.trim().slice(0, 60)),
    overflow,
    scrollWidth,
    innerWidth,
    imgsMissingAlt,
    unnamedControls,
  });
})()
`;
