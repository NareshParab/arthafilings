"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { indiaStatesAndUts } from "@/data/india-states";
import { findCoupon } from "@/data/coupons";
import { GSTIN_REGEX } from "@/lib/service-forms";
import { applyCoupon, calcGst, calcTotal } from "@/lib/pricing";
import { getLeadDraft, saveOrderDraft } from "@/lib/mock-session";
import type { MockPackagePrice } from "@/data/packages";
import type { ServiceItem } from "@/data/service-catalog";
import type { Coupon, Order, PaymentMethod } from "@/types";
import OrderSummary from "./OrderSummary";

const STEP_LABELS = ["Your details", "Review", "Payment"] as const;

const detailsSchema = z
  .object({
    name: z.string().trim().min(2, "Please enter your full name"),
    email: z.email("Please enter a valid email address"),
    phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
    businessName: z.string().trim().optional(),
    wantsGstInvoice: z.boolean(),
    gstin: z.string().trim().optional(),
    billingAddress: z.string().trim().optional(),
    billingState: z.string().trim().optional(),
  })
  .superRefine((values, ctx) => {
    if (!values.wantsGstInvoice) return;
    if (!values.gstin || !GSTIN_REGEX.test(values.gstin.toUpperCase())) {
      ctx.addIssue({ code: "custom", path: ["gstin"], message: "Enter a valid 15-character GSTIN" });
    }
    if (!values.billingAddress) {
      ctx.addIssue({ code: "custom", path: ["billingAddress"], message: "Billing address is required" });
    }
    if (!values.billingState) {
      ctx.addIssue({ code: "custom", path: ["billingState"], message: "Please select a billing state" });
    }
  });

type DetailsValues = z.infer<typeof detailsSchema>;

function generateOrderId() {
  return `AF${Date.now().toString(36).toUpperCase()}`;
}

export default function CheckoutFlow({
  service,
  packagePrice,
}: {
  service: ServiceItem;
  packagePrice: MockPackagePrice;
}) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [details, setDetails] = useState<DetailsValues | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi");
  const [submitting, setSubmitting] = useState(false);
  const [wantsGstInvoice, setWantsGstInvoice] = useState(false);
  const submittedRef = useRef(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DetailsValues>({
    resolver: zodResolver(detailsSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      businessName: "",
      wantsGstInvoice: false,
      gstin: "",
      billingAddress: "",
      billingState: "",
    },
  });

  // Prefill from a lead saved earlier on a service page, if one exists —
  // read client-side only, after mount, to avoid an SSR/client mismatch.
  useEffect(() => {
    const lead = getLeadDraft();
    if (!lead) return;
    reset((current) => ({ ...current, name: lead.name, email: lead.email, phone: lead.phone }));
  }, [reset]);

  const discountPaise = applyCoupon(packagePrice.amountPaise, appliedCoupon);
  const taxablePaise = packagePrice.amountPaise - discountPaise;
  const gstPaise = calcGst(taxablePaise);
  const totalPaise = calcTotal(taxablePaise, gstPaise);

  function handleApplyCoupon() {
    if (!couponCode.trim()) return;
    const coupon = findCoupon(couponCode);
    if (!coupon) {
      setCouponError("That coupon code isn't valid.");
      setAppliedCoupon(null);
      return;
    }
    setAppliedCoupon(coupon);
    setCouponError(null);
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError(null);
  }

  function onSubmitDetails(values: DetailsValues) {
    setDetails(values);
    setStep(2);
  }

  function handlePaySecurely() {
    if (submittedRef.current || !details) return;
    submittedRef.current = true;
    setSubmitting(true);

    const order: Order = {
      id: generateOrderId(),
      serviceSlug: service.slug,
      packageId: packagePrice.packageId,
      customer: {
        name: details.name,
        email: details.email,
        phone: details.phone,
        businessName: details.businessName || undefined,
        gstin: details.wantsGstInvoice ? details.gstin?.toUpperCase() : undefined,
        billingAddress: details.wantsGstInvoice ? details.billingAddress : undefined,
        billingState: details.wantsGstInvoice ? details.billingState : undefined,
      },
      amounts: {
        basePaise: packagePrice.amountPaise,
        discountPaise,
        gstPaise,
        totalPaise,
      },
      couponCode: appliedCoupon?.code,
      status: "placed",
      createdAt: new Date().toISOString(),
    };

    saveOrderDraft(order);
    router.push(`/checkout/payment-mock?order=${order.id}&method=${paymentMethod}`);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start" data-track={`begin_checkout:${service.slug}`}>
      <div>
        <ol className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
          {STEP_LABELS.map((label, index) => {
            const stepNumber = index + 1;
            const active = stepNumber === step;
            const done = stepNumber < step;
            return (
              <li key={label} className="flex items-center gap-2">
                <span
                  className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    active || done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {stepNumber}
                </span>
                <span className={active ? "text-navy" : ""}>{label}</span>
              </li>
            );
          })}
        </ol>

        <Card className="mt-6 ring-border">
          <CardContent>
            {step === 1 && (
              <form onSubmit={handleSubmit(onSubmitDetails)} className="space-y-4" noValidate>
                <h2 className="text-lg font-semibold text-navy">Your details</h2>

                <div className="space-y-1.5">
                  <Label htmlFor="co-name">Full name</Label>
                  <Input id="co-name" {...register("name")} />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="co-email">Email</Label>
                  <Input id="co-email" type="email" {...register("email")} />
                  {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="co-phone">Mobile number</Label>
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 items-center rounded-lg border border-input px-2.5 text-sm text-muted-foreground">
                      +91
                    </span>
                    <Input id="co-phone" inputMode="numeric" maxLength={10} {...register("phone")} />
                  </div>
                  {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="co-business">Business name (optional)</Label>
                  <Input id="co-business" {...register("businessName")} />
                </div>

                <Controller
                  control={control}
                  name="wantsGstInvoice"
                  render={({ field }) => (
                    <label className="flex items-start gap-2 text-sm text-foreground">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          const value = checked === true;
                          field.onChange(value);
                          setWantsGstInvoice(value);
                        }}
                      />
                      I need a GST invoice
                    </label>
                  )}
                />

                {wantsGstInvoice && (
                  <div className="space-y-4 rounded-lg border border-border p-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="co-gstin">GSTIN</Label>
                      <Controller
                        control={control}
                        name="gstin"
                        render={({ field }) => (
                          <Input
                            id="co-gstin"
                            placeholder="22AAAAA0000A1Z5"
                            value={field.value ?? ""}
                            onChange={(event) => field.onChange(event.target.value.toUpperCase())}
                          />
                        )}
                      />
                      {errors.gstin && <p className="text-sm text-destructive">{errors.gstin.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="co-address">Billing address</Label>
                      <Input id="co-address" {...register("billingAddress")} />
                      {errors.billingAddress && (
                        <p className="text-sm text-destructive">{errors.billingAddress.message}</p>
                      )}
                    </div>

                    <Controller
                      control={control}
                      name="billingState"
                      render={({ field }) => (
                        <div className="space-y-1.5">
                          <Label htmlFor="co-state">State</Label>
                          <Select
                            value={field.value || null}
                            onValueChange={(value) => field.onChange(value ?? "")}
                          >
                            <SelectTrigger id="co-state" className="w-full">
                              <SelectValue placeholder="Select your state" />
                            </SelectTrigger>
                            <SelectContent>
                              {indiaStatesAndUts.map((stateName) => (
                                <SelectItem key={stateName} value={stateName}>
                                  {stateName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.billingState && (
                            <p className="text-sm text-destructive">{errors.billingState.message}</p>
                          )}
                        </div>
                      )}
                    />
                  </div>
                )}

                <Button type="submit" className="w-full">
                  Continue
                </Button>
              </form>
            )}

            {step === 2 && details && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold text-navy">Review your order</h2>

                <div className="rounded-lg border border-border p-4 text-sm">
                  <p className="font-medium text-navy">{service.name}</p>
                  <p className="text-muted-foreground">{packagePrice.name} plan</p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="co-coupon">Coupon code</Label>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                      <span className="font-medium text-navy">{appliedCoupon.code} applied</span>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-sm font-medium text-primary hover:text-primary-hover"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        id="co-coupon"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(event) => setCouponCode(event.target.value)}
                      />
                      <Button type="button" variant="outline" onClick={handleApplyCoupon} data-track="coupon_apply">
                        Apply
                      </Button>
                    </div>
                  )}
                  {couponError && <p className="text-sm text-destructive">{couponError}</p>}
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button type="button" className="flex-1" onClick={() => setStep(3)}>
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold text-navy">Payment</h2>

                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                  className="gap-3"
                >
                  {[
                    { value: "upi", label: "UPI" },
                    { value: "card", label: "Card" },
                    { value: "netbanking", label: "Net banking" },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm font-medium text-foreground"
                    >
                      <RadioGroupItem value={option.value} />
                      {option.label}
                    </label>
                  ))}
                </RadioGroup>

                <p className="text-sm text-muted-foreground">You will be taken to our secure payment partner.</p>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(2)}>
                    Back
                  </Button>
                  <Button
                    type="button"
                    className="flex-1"
                    onClick={handlePaySecurely}
                    disabled={submitting}
                    data-track={`payment_start:${service.slug}`}
                  >
                    {submitting ? "Please wait…" : "Pay securely"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="lg:sticky lg:top-24">
        <OrderSummary
          packageName={packagePrice.name}
          basePaise={packagePrice.amountPaise}
          discountPaise={discountPaise}
          gstPaise={gstPaise}
          totalPaise={totalPaise}
          showTbdNote
        />
      </div>
    </div>
  );
}
