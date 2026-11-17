// [VERIFY] Package inclusions and prices are placeholders and need client and legal check before launch.
import type { Package } from "@/types";

export const proprietorshipPackages: Package[] = [
  {
    id: "basic",
    name: "Basic",
    price: "₹ [TBD]",
    govtFeeNote: "Govt. fees not included — billed separately. [TBD]",
    features: [
      "Guidance on choosing a business structure",
      "Application preparation for one basic registration",
      "Document checklist and review",
      "Email support during the process",
    ],
    ctaLabel: "Continue",
  },
  {
    id: "standard",
    name: "Standard",
    price: "₹ [TBD]",
    govtFeeNote: "Govt. fees not included — billed separately. [TBD]",
    popular: true,
    features: [
      "Everything in Basic",
      "Priority document review",
      "Application tracking until approval",
      "Phone and WhatsApp support",
      "Basic compliance reminders for the first year",
    ],
    ctaLabel: "Continue",
  },
  {
    id: "premium",
    name: "Premium",
    price: "₹ [TBD]",
    govtFeeNote: "Govt. fees not included — billed separately. [TBD]",
    features: [
      "Everything in Standard",
      "Dedicated filing specialist",
      "Additional registration add-ons on request",
      "Extended compliance reminders",
      "Fastest turnaround queue",
    ],
    ctaLabel: "Continue",
  },
];
