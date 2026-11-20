// MOCK: seed coupons for the admin demo. Separate from data/coupons.ts,
// which the public checkout reads — the two aren't wired together yet.
// Replace with real API data in the backend phase.
import type { AdminCoupon } from "@/types/admin";
import { isMockAllowed } from "@/lib/site-env";

const isDev = isMockAllowed();

const adminCouponsSeed: AdminCoupon[] = [
  {
    id: "cpn-welcome10",
    code: "WELCOME10",
    type: "percent",
    value: 10,
    minOrderPaise: 0,
    validFrom: "2026-10-01",
    validTo: "2026-12-31",
    usageLimit: 500,
    appliesTo: "all",
    active: true,
    createdAt: "2026-10-01T09:00:00.000Z",
  },
  {
    id: "cpn-flat500",
    code: "FLAT500",
    type: "flat",
    value: 500,
    minOrderPaise: 500000,
    validFrom: "2026-11-01",
    validTo: "2026-11-30",
    usageLimit: 200,
    appliesTo: ["proprietorship-registration", "llp-registration", "private-limited-company-registration"],
    active: true,
    createdAt: "2026-11-01T09:00:00.000Z",
  },
  {
    id: "cpn-gst-launch",
    code: "GSTLAUNCH",
    type: "percent",
    value: 15,
    minOrderPaise: 0,
    validFrom: "2026-09-01",
    validTo: "2026-10-15",
    usageLimit: 100,
    appliesTo: ["gst-registration"],
    active: false,
    createdAt: "2026-09-01T09:00:00.000Z",
  },
];

export const ADMIN_COUPONS: AdminCoupon[] = isDev ? adminCouponsSeed : [];
