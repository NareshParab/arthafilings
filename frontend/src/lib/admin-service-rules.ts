// Validation rules for the service editor. Pure functions so the editor can
// show inline messages before the user even tries to save.
import type { AdminServiceContent } from "@/types/admin";

export function canMarkContentReady(content: AdminServiceContent): { ok: boolean; reasons: string[] } {
  const reasons: string[] = [];
  if (!content.intro.trim()) reasons.push("Intro line is empty.");
  if (content.faqs.length < 3) reasons.push(`Needs at least 3 FAQs (has ${content.faqs.length}).`);
  if (!content.legalReviewedBy.trim()) reasons.push("Legal review: \"Reviewed by\" is empty.");
  if (!content.legalReviewDate.trim()) reasons.push("Legal review: \"Review date\" is empty.");
  return { ok: reasons.length === 0, reasons };
}

export function canGoLive(content: AdminServiceContent): { ok: boolean; reasons: string[] } {
  const reasons: string[] = [];
  if (content.contentStatus !== "ready") reasons.push("Content status must be \"Ready\" first.");
  if (!content.packages.some((pkg) => pkg.pricePaise > 0)) {
    reasons.push("Needs at least one package with a real price above ₹0.");
  }
  return { ok: reasons.length === 0, reasons };
}

export function isValidRupeePrice(value: string): boolean {
  if (!/^\d+$/.test(value.trim())) return false;
  return Number(value.trim()) > 0;
}

export function rupeesToPaise(value: string): number {
  const n = Number(value.trim());
  return Number.isFinite(n) ? Math.round(n) * 100 : 0;
}

export function paiseToRupeesInput(paise: number): string {
  return paise > 0 ? String(Math.round(paise / 100)) : "";
}
