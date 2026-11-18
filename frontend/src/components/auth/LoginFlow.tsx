"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { mockVerifyOtp } from "@/lib/mock-api";
import { saveAuthSession } from "@/lib/mock-session";

const RESEND_SECONDS = 30;
const MAX_WRONG_ATTEMPTS = 5;
const LOCK_SECONDS = 120;

const phoneSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
});

type PhoneValues = z.infer<typeof phoneSchema>;

export default function LoginFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [lockSecondsLeft, setLockSecondsLeft] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PhoneValues>({ resolver: zodResolver(phoneSchema), defaultValues: { phone: "" } });

  const resendTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lockTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (step !== "otp") return;
    resendTimerRef.current = setInterval(() => {
      setSecondsLeft((current) => (current > 0 ? current - 1 : 0));
    }, 1000);
    return () => {
      if (resendTimerRef.current) clearInterval(resendTimerRef.current);
    };
  }, [step]);

  useEffect(() => {
    if (lockSecondsLeft <= 0) return;
    lockTimerRef.current = setInterval(() => {
      setLockSecondsLeft((current) => {
        if (current <= 1) {
          setWrongAttempts(0);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => {
      if (lockTimerRef.current) clearInterval(lockTimerRef.current);
    };
  }, [lockSecondsLeft]);

  function onSubmitPhone(values: PhoneValues) {
    setPhone(values.phone);
    setOtp("");
    setOtpError(null);
    setWrongAttempts(0);
    setLockSecondsLeft(0);
    setSecondsLeft(RESEND_SECONDS);
    setStep("otp");
  }

  function handleChangeNumber() {
    setStep("phone");
    setOtp("");
    setOtpError(null);
    setWrongAttempts(0);
    setLockSecondsLeft(0);
  }

  function handleResend() {
    if (secondsLeft > 0) return;
    setSecondsLeft(RESEND_SECONDS);
    toast.info("A new OTP has been sent.");
  }

  async function handleVerify() {
    if (lockSecondsLeft > 0) return;
    setOtpError(null);

    if (!/^\d{6}$/.test(otp)) {
      const attempts = wrongAttempts + 1;
      setWrongAttempts(attempts);
      if (attempts >= MAX_WRONG_ATTEMPTS) {
        setLockSecondsLeft(LOCK_SECONDS);
        setOtpError("Too many attempts. Please try again in a few minutes.");
      } else {
        setOtpError("Enter the 6-digit code sent to your phone");
      }
      return;
    }

    setVerifying(true);
    const result = await mockVerifyOtp(otp);
    setVerifying(false);

    if (result.success) {
      saveAuthSession({ phone, loggedInAt: new Date().toISOString() });
      toast.success("Logged in successfully.");
      router.replace(next);
    } else {
      const attempts = wrongAttempts + 1;
      setWrongAttempts(attempts);
      if (attempts >= MAX_WRONG_ATTEMPTS) {
        setLockSecondsLeft(LOCK_SECONDS);
        setOtpError("Too many attempts. Please try again in a few minutes.");
      } else {
        setOtpError("That code didn't work. Please try again.");
      }
    }
  }

  const locked = lockSecondsLeft > 0;

  return (
    <Card className="ring-border">
      <CardContent>
        {step === "phone" && (
          <form onSubmit={handleSubmit(onSubmitPhone)} className="space-y-4" noValidate>
            <div>
              <h1 className="text-lg font-semibold text-navy">Log in</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                We&apos;ll send a one-time code to your phone. No password needed.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="login-phone">Mobile number</Label>
              <div className="flex items-center gap-2">
                <span className="flex h-8 items-center rounded-lg border border-input px-2.5 text-sm text-muted-foreground">
                  +91
                </span>
                <Input
                  id="login-phone"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="98765 43210"
                  {...register("phone")}
                />
              </div>
              {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
            </div>

            <Button type="submit" className="w-full">
              Send OTP
            </Button>
          </form>
        )}

        {step === "otp" && (
          <div className="space-y-4">
            <div>
              <h1 className="text-lg font-semibold text-navy">Enter the OTP</h1>
              <p className="mt-1 text-sm text-muted-foreground">6-digit code sent to +91 {phone}</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="login-otp">OTP</Label>
              <Input
                id="login-otp"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="123456"
                disabled={locked}
                value={otp}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))}
              />
              {otpError && <p className="text-sm text-destructive">{otpError}</p>}
            </div>

            <Button className="w-full" onClick={handleVerify} disabled={verifying || locked}>
              {locked
                ? `Try again in ${Math.ceil(lockSecondsLeft / 60)} min`
                : verifying
                  ? "Verifying…"
                  : "Verify"}
            </Button>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
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
              <button type="button" onClick={handleChangeNumber} className="font-medium text-primary hover:text-primary-hover">
                Change number
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
