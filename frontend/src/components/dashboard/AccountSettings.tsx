"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { indiaStatesAndUts } from "@/data/india-states";
import { GSTIN_REGEX } from "@/lib/service-forms";
import { useMockAuthSession, useSessionOrders, saveAccountGstDetails, getAccountGstDetails } from "@/lib/mock-session";
import { getDashboardOrders } from "@/data/orders";

const gstSchema = z.object({
  gstin: z
    .string()
    .trim()
    .transform((value) => value.toUpperCase())
    .refine((value) => value === "" || GSTIN_REGEX.test(value), "Enter a valid 15-character GSTIN"),
  businessName: z.string().trim().optional(),
  billingAddress: z.string().trim().optional(),
  billingState: z.string().trim().optional(),
});

type GstValues = z.infer<typeof gstSchema>;

export default function AccountSettings() {
  const session = useMockAuthSession();
  const sessionOrders = useSessionOrders();
  const orders = getDashboardOrders(sessionOrders);
  const latestOrder = orders[0]; // MOCK: no real profile store yet — borrow details from the latest order.

  const [saved] = useState(() => getAccountGstDetails());

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<GstValues>({
    resolver: zodResolver(gstSchema),
    defaultValues: {
      gstin: saved?.gstin ?? "",
      businessName: saved?.businessName ?? latestOrder?.customer.businessName ?? "",
      billingAddress: saved?.billingAddress ?? "",
      billingState: saved?.billingState ?? "",
    },
  });

  async function onSubmit(values: GstValues) {
    await new Promise((resolve) => setTimeout(resolve, 400)); // MOCK: simulate a save
    saveAccountGstDetails({
      gstin: values.gstin,
      businessName: values.businessName ?? "",
      billingAddress: values.billingAddress ?? "",
      billingState: values.billingState ?? "",
    });
    toast.success("Account details saved.");
  }

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-navy">Account</h1>

      <Card className="ring-border">
        <CardContent className="space-y-3">
          <h2 className="font-semibold text-navy">Your details</h2>
          <div className="space-y-1.5">
            <Label>Name</Label>
            <p className="text-sm text-foreground">{latestOrder?.customer.name ?? "—"}</p>
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <p className="text-sm text-foreground">{latestOrder?.customer.email ?? "—"}</p>
          </div>
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <p className="text-sm text-foreground">
              {session?.phone ? `+91 ${session.phone}` : (latestOrder?.customer.phone ?? "—")}
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            These details come from your orders. Editing your profile directly isn&apos;t available yet. [TBD]
          </p>
        </CardContent>
      </Card>

      <Card className="ring-border">
        <CardContent>
          <h2 className="font-semibold text-navy">GST details (optional)</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Add this once if you&apos;d like GST invoices for future orders.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="acc-gstin">GSTIN</Label>
              <Controller
                control={control}
                name="gstin"
                render={({ field }) => (
                  <Input
                    id="acc-gstin"
                    placeholder="22AAAAA0000A1Z5"
                    value={field.value}
                    onChange={(event) => field.onChange(event.target.value.toUpperCase())}
                  />
                )}
              />
              {errors.gstin && <p className="text-sm text-destructive">{errors.gstin.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="acc-business">Business name</Label>
              <Input id="acc-business" {...register("businessName")} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="acc-address">Billing address</Label>
              <Input id="acc-address" {...register("billingAddress")} />
            </div>

            <Controller
              control={control}
              name="billingState"
              render={({ field }) => (
                <div className="space-y-1.5">
                  <Label htmlFor="acc-state">State</Label>
                  <Select value={field.value || null} onValueChange={(value) => field.onChange(value ?? "")}>
                    <SelectTrigger id="acc-state" className="w-full">
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
                </div>
              )}
            />

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : "Save"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
