"use client";

// MOCK: localStorage-backed "database" for admin-edited service content and
// pricing — same pattern as lib/admin-store.ts. Saving here never touches
// the public site's data/service-catalog.ts or data/service-content.ts;
// the real public pages keep reading those files until the backend phase
// wires this up to a real content API. A small note in the editor's
// "Preview public page" link says as much.
import { useSyncExternalStore } from "react";
import type { AdminServiceContent } from "@/types/admin";
import { getDefaultAdminServiceContent } from "@/data/admin-services-mock";
import { logActivity } from "@/lib/admin-activity-store";

const SERVICES_KEY = "af_admin_mock_services_store";
const SERVICES_EVENT = "af_admin_mock_services_store_change";

function notify() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(SERVICES_EVENT));
}

function subscribe(callback: () => void) {
  window.addEventListener(SERVICES_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(SERVICES_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

let cache: { raw: string | null; parsed: Record<string, AdminServiceContent> } | null = null;

function readAll(): Record<string, AdminServiceContent> {
  if (typeof window === "undefined") return getDefaultAdminServiceContent();
  const raw = window.localStorage.getItem(SERVICES_KEY);
  if (cache && cache.raw === raw) return cache.parsed;
  let parsed = getDefaultAdminServiceContent();
  if (raw) {
    try {
      parsed = { ...getDefaultAdminServiceContent(), ...(JSON.parse(raw) as Record<string, AdminServiceContent>) };
    } catch {
      parsed = getDefaultAdminServiceContent();
    }
  }
  cache = { raw, parsed };
  return parsed;
}

function writeAll(next: Record<string, AdminServiceContent>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SERVICES_KEY, JSON.stringify(next));
  notify();
}

function getServerSnapshot(): Record<string, AdminServiceContent> {
  return getDefaultAdminServiceContent();
}

export function useAdminServiceContentMap(): Record<string, AdminServiceContent> {
  return useSyncExternalStore(subscribe, readAll, getServerSnapshot);
}

export function getAdminServiceContent(slug: string): AdminServiceContent | undefined {
  return readAll()[slug];
}

function summarizeChanges(before: AdminServiceContent, after: AdminServiceContent): string {
  const changes: string[] = [];
  if (before.mode !== after.mode) changes.push(`mode ${before.mode} → ${after.mode}`);
  if (before.contentStatus !== after.contentStatus) changes.push(`status ${before.contentStatus} → ${after.contentStatus}`);
  if (JSON.stringify(before.packages) !== JSON.stringify(after.packages)) changes.push("packages/prices updated");
  if (before.intro !== after.intro) changes.push("intro updated");
  if (before.whatIsIt !== after.whatIsIt) changes.push("content updated");
  if (JSON.stringify(before.faqs) !== JSON.stringify(after.faqs)) changes.push("FAQs updated");
  if (JSON.stringify(before.documents) !== JSON.stringify(after.documents)) changes.push("documents updated");
  if (before.seoTitle !== after.seoTitle || before.seoDescription !== after.seoDescription) changes.push("SEO updated");
  if (before.legalReviewedBy !== after.legalReviewedBy || before.legalReviewDate !== after.legalReviewDate) {
    changes.push("legal review updated");
  }
  return changes.length > 0 ? changes.join(", ") : "No fields changed";
}

export function saveServiceContent(
  slug: string,
  patch: Partial<AdminServiceContent>,
  actor: { id: string; name: string; role: "admin" | "staff" | "reviewer" },
  serviceLabel: string
): AdminServiceContent {
  const all = readAll();
  const before = all[slug];
  const after: AdminServiceContent = {
    ...before,
    ...patch,
    lastEditedAt: new Date().toISOString(),
    lastEditedBy: actor.name,
  };
  writeAll({ ...all, [slug]: after });

  logActivity({
    actor,
    action: summarizeChanges(before, after),
    entityType: "service",
    entityId: slug,
    entityLabel: serviceLabel,
    before: before as unknown as Record<string, unknown>,
    after: after as unknown as Record<string, unknown>,
  });

  return after;
}
