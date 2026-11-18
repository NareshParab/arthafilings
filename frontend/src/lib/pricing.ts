import type { Coupon } from "@/types";

// [VERIFY] with accountant before launch.
export const GST_RATE = 18;

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatINR(amountPaise: number): string {
  return inrFormatter.format(Math.round(amountPaise) / 100);
}

export function applyCoupon(amountPaise: number, coupon: Coupon | null): number {
  if (!coupon) return 0;
  const discount =
    coupon.type === "percent"
      ? Math.round((amountPaise * coupon.value) / 100)
      : coupon.value;
  return Math.min(discount, amountPaise);
}

// GST is calculated on the taxable value after any discount.
export function calcGst(taxableAmountPaise: number): number {
  return Math.round((taxableAmountPaise * GST_RATE) / 100);
}

export function calcTotal(taxableAmountPaise: number, gstPaise: number): number {
  return taxableAmountPaise + gstPaise;
}
