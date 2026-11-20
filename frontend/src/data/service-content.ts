// [VERIFY] All legal, compliance, pricing and comparative claims in this file need
// legal and business review before launch. Nothing here is legal advice.
import type { ServiceGroup, ServiceItem } from "./service-catalog";
import type { Package } from "@/types";

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ProcessStep {
  title: string;
  description: string;
}

export interface DocumentGroup {
  heading: string;
  items: string[];
}

export interface ServiceContent {
  intro: string;
  whatYouGet: string[];
  whatIsIt: { heading: string; paragraphs: string[] };
  whoNeedsIt: string[];
  documentsNeeded: DocumentGroup[];
  faqs: FAQItem[];
  packages?: Package[];
  // "draft" = not reviewed for public launch — production shows a minimal
  // page instead of this content. Only "ready" with a real legalReviewedBy
  // and legalReviewDate may show the full page in production.
  contentStatus: "draft" | "ready";
  legalReviewedBy?: string;
  legalReviewDate?: string;
}

// Shared across every service page — the same 5-step flow we use everywhere.
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

// [VERIFY] Package inclusions and prices are placeholders and need client and legal check before launch.
const proprietorshipPackages: Package[] = [
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

// Real, hand-written content. Add an entry here when a service page needs more
// than the generic fallback below.
export const serviceContent: Record<string, ServiceContent> = {
  "proprietorship-registration": {
    intro:
      "Register the business registrations and licences your proprietorship needs, with an application our team prepares and reviews.",
    whatYouGet: [
      "Guidance on choosing a business structure",
      "Application prepared and reviewed by our team",
      "Status updates as your application moves forward",
      "Support over phone, email and WhatsApp",
    ],
    whatIsIt: {
      heading: "What is a proprietorship?",
      paragraphs: [
        "A proprietorship is a business run and owned by one person. There is no separate legal entity apart from the owner, and the owner is personally responsible for the business.",
        // [VERIFY] Legal check needed: a sole proprietorship has no separate registration
        // under company law. What we call "registration" here usually means obtaining the
        // business registrations and licences that apply to your business, such as GST,
        // Udyam (MSME) registration and a Shop and Establishment licence, as applicable.
        "Because there is no company-law registration for a proprietorship itself, what most people mean by \"registering\" a proprietorship is obtaining the business registrations and licences that apply to it — for example GST, Udyam (MSME) registration, or a Shop and Establishment licence, depending on your business.",
      ],
    },
    whoNeedsIt: [
      "Individuals starting a small or single-owner business who want the simplest way to begin.",
      "Freelancers and consultants who need GST or other registrations in their own name.",
      "Business owners who want full control without bringing in partners or a board.",
    ],
    documentsNeeded: [
      {
        heading: "Proprietor",
        items: [
          "Identity proof (such as PAN or Aadhaar)",
          "Address proof",
          "Recent passport-size photograph",
          "Bank account details",
        ],
      },
      {
        heading: "Business address",
        items: [
          "Business address proof (such as a utility bill or rent agreement)",
          "No-objection certificate from the property owner, if the premises is rented",
          "Photograph of the business premises (if available)",
        ],
      },
    ],
    faqs: [
      {
        question: "What is a proprietorship?",
        answer:
          "A proprietorship is a business owned and run by a single person, with no separate legal entity apart from the owner. \"Registering\" one usually means getting the business registrations and licences that apply, such as GST or Udyam (MSME) registration.",
      },
      {
        question: "Who can start a proprietorship?",
        answer:
          "Generally, any individual who is eligible to carry on business in India can start a proprietorship, subject to the rules for the specific registrations or licences the business needs.",
      },
      {
        question: "What documents will I need?",
        answer:
          "Typically identity proof, address proof, a photograph, bank account details, and proof of your business address. The exact list depends on which registrations your business needs.",
      },
      {
        question: "How long does the process take?",
        answer: "Timelines depend on the registrations involved and how quickly documents are provided. [TBD]",
      },
      {
        question: "How much does it cost?",
        answer:
          "Our service fee depends on the plan you choose. Government fees are separate and vary by registration. [TBD]",
      },
      {
        question: "Do I need GST registration?",
        answer:
          "It depends on your turnover, the nature of your business, and the state you operate in. We can guide you on whether GST registration applies to you.",
      },
      {
        question: "Can I convert to a Private Limited company later?",
        answer:
          "Many businesses that start as a proprietorship move to a different structure, such as a Private Limited company, as they grow. This involves a separate process, which we can help with when you're ready.",
      },
      {
        question: "How can I track my application?",
        answer:
          "Once your application is submitted, you can track its status with our team, and we will update you as it progresses.",
      },
      {
        question: "What is your refund policy?",
        answer: "Please see our Refund Policy page for full details on cancellations and refunds.",
      },
      {
        question: "How can I contact you?",
        answer:
          "You can reach us by phone, email or WhatsApp — see the Contact page or use the WhatsApp button on this page.",
      },
    ],
    packages: proprietorshipPackages,
    // Not yet legally reviewed — keep as "draft" until a real reviewer name
    // and date are confirmed, even though this is our most complete content.
    contentStatus: "draft",
  },
};

function buildGenericContent(service: ServiceItem, group: ServiceGroup): ServiceContent {
  return {
    contentStatus: "draft",
    intro: `${service.name} support from Arthafilings, as part of our ${group.name} services. [TBD]`,
    whatYouGet: [
      "Guidance on what this service involves for your business. [TBD]",
      "Application or filing prepared and reviewed by our team. [TBD]",
      "Status updates until the service is complete. [TBD]",
    ],
    whatIsIt: {
      heading: `What is ${service.name}?`,
      paragraphs: [
        `${service.name} is a ${group.name.toLowerCase()} service. [VERIFY] A plain-language explanation of what this covers for your business will be added here. [TBD]`,
      ],
    },
    whoNeedsIt: [`Businesses or individuals that need ${service.name.toLowerCase()}. [VERIFY]`],
    documentsNeeded: [
      {
        heading: "Documents needed",
        items: ["Document checklist for this service. [TBD]"],
      },
    ],
    faqs: [
      {
        question: `What is ${service.name}?`,
        answer: "[TBD] Details for this service will be added here.",
      },
      {
        question: "How much does this cost?",
        answer: "Our fee depends on your requirements. [TBD]",
      },
      {
        question: "How long does this take?",
        answer: "Timelines depend on the specifics of your case. [TBD]",
      },
    ],
  };
}

export function getServiceContent(service: ServiceItem, group: ServiceGroup): ServiceContent {
  return serviceContent[service.slug] ?? buildGenericContent(service, group);
}
