import { formatINR, GST_RATE } from "@/lib/pricing";

export default function OrderSummary({
  packageName,
  basePaise,
  discountPaise,
  gstPaise,
  totalPaise,
  showTbdNote,
}: {
  packageName: string;
  basePaise: number;
  discountPaise: number;
  gstPaise: number;
  totalPaise: number;
  showTbdNote?: boolean;
}) {
  return (
    <div className="rounded-xl bg-blue-tint p-5 text-sm">
      <h3 className="font-semibold text-navy">Order summary</h3>
      <p className="mt-1 text-muted-foreground">{packageName} plan</p>

      {showTbdNote && process.env.NODE_ENV !== "production" && (
        <p className="mt-2 text-xs font-medium text-destructive">[TBD] placeholder price</p>
      )}

      <dl className="mt-4 space-y-2">
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Package price</dt>
          <dd className="text-foreground">{formatINR(basePaise)}</dd>
        </div>
        {discountPaise > 0 && (
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Coupon discount</dt>
            <dd className="text-foreground">-{formatINR(discountPaise)}</dd>
          </div>
        )}
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">GST ({GST_RATE}%)</dt>
          <dd className="text-foreground">{formatINR(gstPaise)}</dd>
        </div>
      </dl>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-base font-semibold text-navy">
        <span>Total</span>
        <span>{formatINR(totalPaise)}</span>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Government fees, if any, are billed separately. [TBD]
      </p>
    </div>
  );
}
