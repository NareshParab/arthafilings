"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { siteConfig } from "@/lib/site-config";
import { mockVerifyOtp } from "@/lib/mock-api";
import type { Lead } from "@/types";

const leadSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name"),
  email: z.email("Please enter a valid email address"),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  consent: z
    .boolean()
    .refine((value) => value === true, "Please agree to be contacted"),
});

type LeadFormValues = z.infer<typeof leadSchema>;

const RESEND_SECONDS = 30;

function buildWhatsAppHref() {
  const digits = siteConfig.whatsappNumber.replace(/[^\d]/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(siteConfig.whatsappMessage)}`;
}

function scrollToPackages() {
  document.getElementById("packages")?.scrollIntoView({ behavior: "smooth" });
}

const bullets = [
  "Application prepared and reviewed by our team",
  "Guidance on the documents you need to provide",
  "Status updates as your application moves forward",
  "Support over phone, email and WhatsApp",
];

export default function Hero() {
  return (
    <Suspense fallback={<HeroShell />}>
      <HeroContent />
    </Suspense>
  );
}

function HeroShell() {
  return (
    <section className="bg-blue-tint">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-20" />
    </section>
  );
}

function HeroContent() {
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

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: { name: "", email: "", phone: "", consent: false },
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
    setLead({ name: values.name, email: values.email, phone: values.phone, utm });
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

  return (
    <section className="bg-blue-tint">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-20">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-navy sm:text-4xl">
            Register your proprietorship business, without the paperwork headache
          </h1>
          <ul className="mt-6 space-y-3">
            {bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-2 text-foreground">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button
              nativeButton={false}
              size="lg"
              render={
                <a
                  href="#packages"
                  onClick={(event) => {
                    event.preventDefault();
                    scrollToPackages();
                  }}
                >
                  Get started
                </a>
              }
            />
          </div>
        </div>

        <Card className="ring-border">
          <CardContent>
            {step === "form" && (
              <form onSubmit={handleSubmit(onSubmitLead)} className="space-y-4" noValidate>
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" placeholder="Your full name" {...register("name")} />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
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
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone.message}</p>
                  )}
                </div>

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
                        <p className="text-sm text-destructive">{errors.consent.message}</p>
                      )}
                    </div>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                  data-track="lead_form_submit"
                >
                  {isSubmitting ? "Please wait…" : "Submit"}
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
                  <p className="font-medium text-foreground">
                    Enter the 6-digit OTP sent to your phone
                  </p>
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
                  data-track="otp_verify"
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
                  Thanks for reaching out. Our team will contact you shortly to continue your
                  registration.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
