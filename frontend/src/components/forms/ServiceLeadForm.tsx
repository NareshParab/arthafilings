"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { siteConfig } from "@/lib/site-config";
import { mockVerifyOtp } from "@/lib/mock-api";
import { saveLeadDraft } from "@/lib/mock-session";
import { extraFieldConfigs, extraFieldsZodShape, defaultValuesForExtraFields } from "@/lib/service-forms";
import { indiaStatesAndUts } from "@/data/india-states";
import { countries } from "@/data/countries";
import type { ExtraField, ServiceItem } from "@/data/service-catalog";
import type { Lead } from "@/types";

const baseLeadShape = {
  name: z.string().trim().min(2, "Please enter your full name"),
  email: z.email("Please enter a valid email address"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  consent: z.boolean().refine((value) => value === true, "Please agree to be contacted"),
};

// The schema is built at runtime from a service's extra fields, so the type is
// declared by hand: base fields plus every possible ExtraField, all optional
// since only the subset in `service.extra` is actually rendered and required.
type LeadFormValues = {
  name: string;
  email: string;
  phone: string;
  consent: boolean;
} & Partial<Record<ExtraField, string>>;

const RESEND_SECONDS = 30;

function buildWhatsAppHref() {
  const digits = siteConfig.whatsappNumber.replace(/[^\d]/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(siteConfig.whatsappMessage)}`;
}

function ctaLabelForService(service: ServiceItem) {
  if (service.cta === "quote") return "Get a quote";
  if (service.mode === "live") return "Continue";
  return "Request a callback";
}

const selectOptionsByField: Partial<Record<string, string[]>> = {
  state: indiaStatesAndUts,
  stateUt: indiaStatesAndUts,
  country: countries,
};

export default function ServiceLeadForm({ service }: { service: ServiceItem }) {
  return (
    <Card id="lead-form" className="ring-border">
      <CardContent>
        <Suspense fallback={null}>
          <ServiceLeadFormContent service={service} />
        </Suspense>
      </CardContent>
    </Card>
  );
}

function ServiceLeadFormContent({ service }: { service: ServiceItem }) {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<"form" | "otp" | "verified">("form");
  const [lead, setLead] = useState<(Lead & { utm: Record<string, string> }) | null>(null);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  const utm = useMemo(
    () => ({
      utm_source: searchParams.get("utm_source") ?? "",
      utm_medium: searchParams.get("utm_medium") ?? "",
      utm_campaign: searchParams.get("utm_campaign") ?? "",
    }),
    [searchParams]
  );

  const leadSchema = useMemo(
    () => z.object({ ...baseLeadShape, ...extraFieldsZodShape(service.extra) }),
    [service.extra]
  );

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema) as unknown as Resolver<LeadFormValues>,
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      consent: false,
      ...defaultValuesForExtraFields(service.extra),
    } as LeadFormValues,
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (step !== "otp") return;
    timerRef.current = setInterval(() => {
      setSecondsLeft((current) => (current > 0 ? current - 1 : 0));
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step]);

  function onSubmitLead(values: LeadFormValues) {
    const { name, email, phone, ...rest } = values;
    const extra: Record<string, string> = {};
    for (const field of service.extra) {
      extra[field] = rest[field] ?? "";
    }
    setLead({ name, email, phone, serviceSlug: service.slug, extra, utm });
    saveLeadDraft({ name, email, phone });
    setSecondsLeft(RESEND_SECONDS);
    setStep("otp");
  }

  function handleResend() {
    if (secondsLeft > 0) return;
    setSecondsLeft(RESEND_SECONDS);
    toast.info("A new OTP has been sent.");
  }

  async function handleVerify() {
    setOtpError(null);
    if (!/^\d{6}$/.test(otp)) {
      setOtpError("Enter the 6-digit code sent to your phone");
      return;
    }
    setVerifying(true);
    const result = await mockVerifyOtp(otp);
    setVerifying(false);
    if (result.success) {
      setStep("verified");
      toast.success("Phone number verified. We'll be in touch shortly.");
    } else {
      setOtpError("That code didn't work. Please try again.");
    }
  }

  const ctaLabel = ctaLabelForService(service);

  return (
    <>
      {step === "form" && (
        <form onSubmit={handleSubmit(onSubmitLead)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" placeholder="Your full name" {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message as string}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message as string}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">Mobile number</Label>
            <div className="flex items-center gap-2">
              <span className="flex h-8 items-center rounded-lg border border-input px-2.5 text-sm text-muted-foreground">
                +91
              </span>
              <Input
                id="phone"
                inputMode="numeric"
                maxLength={10}
                placeholder="98765 43210"
                {...register("phone")}
              />
            </div>
            {errors.phone && <p className="text-sm text-destructive">{errors.phone.message as string}</p>}
          </div>

          {service.extra.map((field) => {
            const config = extraFieldConfigs[field];
            const fieldError = errors[field];

            if (config.type === "select") {
              const options = selectOptionsByField[field] ?? [];
              return (
                <Controller
                  key={field}
                  control={control}
                  name={field}
                  render={({ field: controllerField }) => (
                    <div className="space-y-1.5">
                      <Label htmlFor={field}>{config.label}</Label>
                      <Select
                        value={(controllerField.value as string) || null}
                        onValueChange={(value) => controllerField.onChange(value ?? "")}
                      >
                        <SelectTrigger id={field} className="w-full">
                          <SelectValue placeholder={config.placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                          {options.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldError && (
                        <p className="text-sm text-destructive">{fieldError.message as string}</p>
                      )}
                    </div>
                  )}
                />
              );
            }

            if (config.type === "textarea") {
              return (
                <div key={field} className="space-y-1.5">
                  <Label htmlFor={field}>{config.label}</Label>
                  <Textarea id={field} placeholder={config.placeholder} {...register(field)} />
                  {fieldError && (
                    <p className="text-sm text-destructive">{fieldError.message as string}</p>
                  )}
                </div>
              );
            }

            return (
              <Controller
                key={field}
                control={control}
                name={field}
                render={({ field: controllerField }) => (
                  <div className="space-y-1.5">
                    <Label htmlFor={field}>{config.label}</Label>
                    <Input
                      id={field}
                      placeholder={config.placeholder}
                      value={(controllerField.value as string) ?? ""}
                      onChange={(event) => {
                        const value = field === "pan" ? event.target.value.toUpperCase() : event.target.value;
                        controllerField.onChange(value);
                      }}
                    />
                    {fieldError && (
                      <p className="text-sm text-destructive">{fieldError.message as string}</p>
                    )}
                  </div>
                )}
              />
            );
          })}

          <Controller
            control={control}
            name="consent"
            render={({ field }) => (
              <div className="space-y-1.5">
                <label className="flex items-start gap-2 text-sm text-foreground">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(checked === true)}
                  />
                  I agree to be contacted about my enquiry.
                </label>
                {errors.consent && (
                  <p className="text-sm text-destructive">{errors.consent.message as string}</p>
                )}
              </div>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
            data-track={`lead_form_submit:${service.slug}`}
          >
            {isSubmitting ? "Please wait…" : ctaLabel}
          </Button>

          <Button
            nativeButton={false}
            variant="outline"
            className="w-full"
            data-track="whatsapp_click"
            render={
              <a href={buildWhatsAppHref()} target="_blank" rel="noopener noreferrer">
                Chat on WhatsApp
              </a>
            }
          />
        </form>
      )}

      {step === "otp" && lead && (
        <div className="space-y-4">
          <div>
            <p className="font-medium text-foreground">Enter the 6-digit OTP sent to your phone</p>
            <p className="text-sm text-muted-foreground">+91 {lead.phone}</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="otp">OTP</Label>
            <Input
              id="otp"
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))}
            />
            {otpError && <p className="text-sm text-destructive">{otpError}</p>}
          </div>

          <Button
            className="w-full"
            onClick={handleVerify}
            disabled={verifying}
            data-track={`otp_verify:${service.slug}`}
          >
            {verifying ? "Verifying…" : "Verify"}
          </Button>

          <div className="text-sm text-muted-foreground">
            {secondsLeft > 0 ? (
              <span>Resend OTP in {secondsLeft}s</span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="font-medium text-primary hover:text-primary-hover"
              >
                Resend OTP
              </button>
            )}
          </div>
        </div>
      )}

      {step === "verified" && (
        <div className="space-y-2 text-center">
          <p className="text-lg font-semibold text-navy">You&apos;re all set!</p>
          <p className="text-sm text-muted-foreground">
            Thanks for reaching out. Our team will contact you shortly to continue your registration.
          </p>
        </div>
      )}
    </>
  );
}
