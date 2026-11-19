import type { Coupon } from "@/types";

// MOCK: replace in backend phase. 2 placeholder coupons for checkout QA —
// never usable in production.
const mockCoupons: Coupon[] = [
  { code: "WELCOME10", type: "percent", value: 10 },
  { code: "FLAT500", type: "flat", value: 50000 }, // ₹500 in paise
];

export const coupons: Coupon[] = process.env.NODE_ENV !== "production" ? mockCoupons : [];

export function findCoupon(code: string): Coupon | null {
  const normalized = code.trim().toUpperCase();
  return coupons.find((coupon) => coupon.code === normalized) ?? null;
}
