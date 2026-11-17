// [VERIFY] All legal, compliance and comparative claims in this file need legal
// review before launch. Nothing here should be treated as legal advice.

export const whatIsProprietorship = {
  heading: "What is a proprietorship?",
  paragraphs: [
    "A proprietorship is a business run and owned by one person. There is no separate legal entity apart from the owner, and the owner is personally responsible for the business.",
    // [VERIFY] Legal check needed: a sole proprietorship has no separate registration
    // under company law. What we call "registration" here usually means obtaining the
    // business registrations and licences that apply to your business, such as GST,
    // Udyam (MSME) registration and a Shop and Establishment licence, as applicable.
    "Because there is no company-law registration for a proprietorship itself, what most people mean by \"registering\" a proprietorship is obtaining the business registrations and licences that apply to it — for example GST, Udyam (MSME) registration, or a Shop and Establishment licence, depending on your business.",
  ],
};

export interface BenefitItem {
  icon: "Landmark" | "FileCheck" | "UserCheck" | "Wallet" | "Building2" | "TrendingUp";
  title: string;
  description: string;
}

// [VERIFY] Comparative claims below (cost, compliance burden, conversion ease) need
// legal and business review before launch.
export const benefits: BenefitItem[] = [
  {
    icon: "Landmark",
    title: "Simple to set up",
    description: "Fewer formalities to get started than many other business structures.",
  },
  {
    icon: "FileCheck",
    title: "Lighter compliance",
    description: "Generally fewer ongoing filings than a registered company.",
  },
  {
    icon: "UserCheck",
    title: "Full control",
    description: "You make the decisions, without needing approval from partners or a board.",
  },
  {
    icon: "Wallet",
    title: "Lower starting cost",
    description: "Often a more affordable way to start compared to other structures.",
  },
  {
    icon: "Building2",
    title: "Opens business banking",
    description: "Supports opening a current account and registering for GST where needed.",
  },
  {
    icon: "TrendingUp",
    title: "Room to grow",
    description: "You can move to a different business structure later as your needs change.",
  },
];

// [VERIFY] Document list is generic guidance and must be checked against current
// requirements before launch.
export const documentChecklist = {
  proprietor: [
    "Identity proof (such as PAN or Aadhaar)",
    "Address proof",
    "Recent passport-size photograph",
    "Bank account details",
  ],
  businessAddress: [
    "Business address proof (such as a utility bill or rent agreement)",
    "No-objection certificate from the property owner, if the premises is rented",
    "Photograph of the business premises (if available)",
  ],
};

export interface ProcessStep {
  title: string;
  description: string;
}

export const processSteps: ProcessStep[] = [
  {
    title: "Enquire",
    description: "Share a few basic details with us through the form or WhatsApp.",
  },
  {
    title: "Choose and pay",
    description: "Pick the plan that suits you and complete payment to get started.",
  },
  {
    title: "Upload documents",
    description: "Share the documents we need using the checklist we send you.",
  },
  {
    title: "We prepare and submit",
    description: "Our team prepares your application and submits it on your behalf.",
  },
  {
    title: "Track and receive",
    description: "Track progress with us and receive your documents once complete.",
  },
];

export interface CostRow {
  item: string;
  whoCharges: string;
  amount: string;
}

// [VERIFY] All amounts are placeholders and need confirmation before launch.
export const costTable: CostRow[] = [
  { item: "Our service fee", whoCharges: "Arthafilings", amount: "₹ [TBD]" },
  { item: "Government fees (varies)", whoCharges: "Government", amount: "₹ [TBD]" },
  { item: "Other costs, if any", whoCharges: "Varies", amount: "₹ [TBD]" },
];
