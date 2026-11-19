export const siteConfig = {
  name: "Arthafilings",
  tagline: "Simple, reliable filings for Indian businesses.",
  description:
    "Arthafilings helps you register and manage your business filings online, with clear pricing and dedicated support.",
  phone: "+91 00000 00000", // [VERIFY]
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+91 00000 00000", // [VERIFY]
  whatsappMessage: "Hi Arthafilings, I'd like to know more about your services.",
  email: "contact@arthafilings.com", // [VERIFY]

  headerNav: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],

  footer: {
    company: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
    legal: [
      { label: "Terms", href: "/terms" },
      { label: "Privacy", href: "/privacy" },
      { label: "Refund Policy", href: "/refund-policy" },
      { label: "Disclaimer", href: "/disclaimer" },
    ],
    social: [
      { label: "Facebook", href: "#" }, // [VERIFY]
      { label: "Instagram", href: "#" }, // [VERIFY]
      { label: "LinkedIn", href: "#" }, // [VERIFY]
      { label: "X", href: "#" }, // [VERIFY]
    ],
  },
};
