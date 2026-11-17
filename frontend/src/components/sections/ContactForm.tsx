"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { mockSubmitContactForm } from "@/lib/mock-api";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name"),
  email: z.email("Please enter a valid email address"),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  message: z.string().trim().min(10, "Please add a short message"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", phone: "", message: "" },
  });

  async function onSubmit(values: ContactFormValues) {
    const result = await mockSubmitContactForm(values);
    if (result.success) {
      toast.success("Thanks for reaching out. We'll get back to you shortly.");
      reset();
    } else {
      toast.error("Something went wrong. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="contact-name">Full name</Label>
        <Input id="contact-name" placeholder="Your full name" {...register("name")} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="contact-email">Email</Label>
        <Input id="contact-email" type="email" placeholder="you@example.com" {...register("email")} />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="contact-phone">Mobile number</Label>
        <div className="flex items-center gap-2">
          <span className="flex h-8 items-center rounded-lg border border-input px-2.5 text-sm text-muted-foreground">
            +91
          </span>
          <Input
            id="contact-phone"
            inputMode="numeric"
            maxLength={10}
            placeholder="98765 43210"
            {...register("phone")}
          />
        </div>
        {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="contact-message">Message</Label>
        <Textarea id="contact-message" placeholder="How can we help?" {...register("message")} />
        {errors.message && <p className="text-sm text-destructive">{errors.message.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting} data-track="contact_form_submit">
        {isSubmitting ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
