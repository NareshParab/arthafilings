// [VERIFY] Every clause in this file is a generic draft and needs legal review
// before launch. None of this is legal advice.

export interface LegalSection {
  id: string;
  heading: string;
  paragraphs: string[];
}

export interface LegalDoc {
  title: string;
  lastUpdated: string;
  intro: string;
  sections: LegalSection[];
}

export const termsContent: LegalDoc = {
  title: "Terms of Service",
  lastUpdated: "[TBD]",
  intro:
    "These terms explain how you can use the Arthafilings website and services. By using our services, you agree to these terms.",
  sections: [
    {
      id: "our-services",
      heading: "Our services",
      paragraphs: [
        "Arthafilings helps you prepare and submit business registration and compliance applications. We are a facilitator, not a government body, and we do not act as a law firm.",
      ],
    },
    {
      id: "accuracy",
      heading: "Accuracy of information",
      paragraphs: [
        "You are responsible for providing accurate and complete information and documents. Delays or rejections caused by incorrect information are not our responsibility.",
      ],
    },
    {
      id: "fees",
      heading: "Fees and payment",
      paragraphs: [
        "Our service fees are shown at checkout. Government fees, where applicable, are separate and are charged in addition to our service fees. [TBD]",
      ],
    },
    {
      id: "our-responsibilities",
      heading: "Our responsibilities",
      paragraphs: [
        "We will make reasonable efforts to prepare and submit your application correctly and on time. We do not control, and cannot guarantee, decisions made by government authorities.",
      ],
    },
    {
      id: "your-responsibilities",
      heading: "Your responsibilities",
      paragraphs: [
        "You agree to provide documents promptly and respond to our requests so we can complete your application without delay.",
      ],
    },
    {
      id: "liability",
      heading: "Limitation of liability",
      paragraphs: [
        "To the extent permitted by law, our liability for any claim relating to our services is limited to the fees you paid us for that service.",
      ],
    },
    {
      id: "changes",
      heading: "Changes to these terms",
      paragraphs: [
        "We may update these terms from time to time. Continued use of our services after an update means you accept the revised terms.",
      ],
    },
    {
      id: "governing-law",
      heading: "Governing law",
      paragraphs: ["These terms are governed by the laws of India."],
    },
    {
      id: "contact",
      heading: "Contact us",
      paragraphs: ["If you have questions about these terms, please contact us using the details on our Contact page."],
    },
  ],
};

export const privacyContent: LegalDoc = {
  title: "Privacy Policy",
  lastUpdated: "[TBD]",
  intro:
    "This policy explains what personal information we collect, why we collect it, and how we handle it.",
  sections: [
    {
      id: "information-we-collect",
      heading: "Information we collect",
      paragraphs: [
        "We collect information you give us directly, including your name, email address, phone number, and the documents you upload for your application.",
      ],
    },
    {
      id: "why-we-collect-it",
      heading: "Why we collect it",
      paragraphs: [
        "We use this information to process your registration or filing, verify your identity where required, contact you about your application, and provide support.",
      ],
    },
    {
      id: "who-we-share-with",
      heading: "Who we share it with",
      paragraphs: [
        "We share information with service providers who help us run our business, including payment gateway providers to process payments, and SMS or email providers to send you updates. We may also share information with government portals where a submission requires it. [VERIFY]",
      ],
    },
    {
      id: "retention",
      heading: "Data retention",
      paragraphs: [
        "We retain your information for as long as needed to provide our services and to meet legal or regulatory requirements. [TBD]",
      ],
    },
    {
      id: "your-rights",
      heading: "Your rights",
      paragraphs: [
        "You can ask us to access, correct, or delete the personal information we hold about you by contacting us.",
      ],
    },
    {
      id: "security",
      heading: "Security",
      paragraphs: [
        "We take reasonable measures to protect your information, though no method of storage or transmission is completely secure.",
      ],
    },
    {
      id: "compliance",
      heading: "Compliance",
      paragraphs: [
        "This policy is intended to align with India's Digital Personal Data Protection Act, 2023, and will be reviewed for compliance before launch. [VERIFY]",
      ],
    },
    {
      id: "changes",
      heading: "Changes to this policy",
      paragraphs: ["We may update this policy from time to time. We will post any changes here."],
    },
    {
      id: "contact",
      heading: "Contact us",
      paragraphs: ["If you have questions about this policy, please contact us using the details on our Contact page."],
    },
  ],
};

export const refundPolicyContent: LegalDoc = {
  title: "Refund Policy",
  lastUpdated: "[TBD]",
  intro:
    "This page explains our approach to cancellations and refunds. The specific rules below are still being finalised. [TBD]",
  sections: [
    {
      id: "cancellations",
      heading: "Cancellations",
      paragraphs: ["Our cancellation rules are still being finalised. [TBD]"],
    },
    {
      id: "refund-eligibility",
      heading: "Refund eligibility",
      paragraphs: ["Our refund eligibility criteria are still being finalised. [TBD]"],
    },
    {
      id: "refund-timelines",
      heading: "Refund timelines",
      paragraphs: ["Our refund timelines are still being finalised. [TBD]"],
    },
    {
      id: "government-fees",
      heading: "Government fees",
      paragraphs: [
        "Government fees already paid to a government authority are generally non-refundable once an application has been submitted. [VERIFY]",
      ],
    },
    {
      id: "how-to-request",
      heading: "How to request a refund",
      paragraphs: ["To request a refund, please contact us using the details on our Contact page."],
    },
    {
      id: "contact",
      heading: "Contact us",
      paragraphs: ["If you have questions about this policy, please contact us using the details on our Contact page."],
    },
  ],
};

export const disclaimerContent: LegalDoc = {
  title: "Disclaimer",
  lastUpdated: "[TBD]",
  intro: "Please read this disclaimer carefully before using our website or services.",
  sections: [
    {
      id: "general-information",
      heading: "General information only",
      paragraphs: [
        "The content on this website is for general information purposes only and may not reflect the most current legal or regulatory requirements.",
      ],
    },
    {
      id: "not-advice",
      heading: "Not legal or financial advice",
      paragraphs: [
        "Nothing on this website is legal, tax, or financial advice. You should consult a qualified professional for advice specific to your situation. [VERIFY]",
      ],
    },
    {
      id: "no-guarantee",
      heading: "No guarantee of approval",
      paragraphs: [
        "We help prepare and submit applications, but the relevant government authority makes the final decision. We cannot guarantee approval or any particular timeline. [VERIFY]",
      ],
    },
    {
      id: "third-party-links",
      heading: "Third-party links",
      paragraphs: [
        "Our website may link to third-party websites. We are not responsible for the content or practices of those websites.",
      ],
    },
    {
      id: "accuracy",
      heading: "Accuracy of information",
      paragraphs: [
        "While we try to keep our content accurate and up to date, we make no guarantees about its completeness or accuracy. [VERIFY]",
      ],
    },
    {
      id: "liability",
      heading: "Limitation of liability",
      paragraphs: [
        "To the extent permitted by law, we are not liable for any loss arising from your use of this website or our services.",
      ],
    },
    {
      id: "contact",
      heading: "Contact us",
      paragraphs: ["If you have questions about this disclaimer, please contact us using the details on our Contact page."],
    },
  ],
};
