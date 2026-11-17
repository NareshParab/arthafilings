export const homeHero = {
  heading: "Simple online business registration and compliance in India",
  subheading:
    "Start a new registration or stay on top of ongoing compliance — guided by our team and tracked online, from one place.",
};

export interface HomeStep {
  title: string;
  description: string;
}

export const homeHowItWorks: HomeStep[] = [
  {
    title: "Tell us what you need",
    description: "Share a few details about the registration or filing you're looking for.",
  },
  {
    title: "Choose a package",
    description: "Pick the plan that matches your requirement and budget.",
  },
  {
    title: "Upload documents online",
    description: "Send us your documents securely through our platform.",
  },
  {
    title: "Track and receive",
    description: "Follow progress until your registration or filing is complete.",
  },
];

export interface WhyItem {
  icon: "Users" | "Tag" | "ListChecks" | "MessageCircle";
  title: string;
  description: string;
}

// [VERIFY] These are general claims about how we work, not measurable statistics.
// They must be reviewed so we only say things we can stand behind.
export const whyArthafilings: WhyItem[] = [
  {
    icon: "Users",
    title: "Guided by our team",
    description: "A real person reviews your application, not just a form.",
  },
  {
    icon: "Tag",
    title: "Clear, upfront pricing",
    description: "You know what you're paying for before you start.",
  },
  {
    icon: "ListChecks",
    title: "Online tracking",
    description: "Check the status of your application whenever you want.",
  },
  {
    icon: "MessageCircle",
    title: "Support when you need it",
    description: "Reach us by phone, email or WhatsApp with your questions.",
  },
];
