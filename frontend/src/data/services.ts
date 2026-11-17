export interface ServiceTile {
  id: string;
  name: string;
  icon:
    | "Building2"
    | "Building"
    | "Users"
    | "Receipt"
    | "ClipboardCheck"
    | "Calculator"
    | "Award"
    | "Wallet";
  href: string;
  comingSoon: boolean;
}

export const services: ServiceTile[] = [
  {
    id: "proprietorship",
    name: "Proprietorship Registration",
    icon: "Building2",
    href: "/proprietorship-registration",
    comingSoon: false,
  },
  {
    id: "private-limited",
    name: "Private Limited Company",
    icon: "Building",
    href: "#",
    comingSoon: true,
  },
  {
    id: "llp",
    name: "LLP Registration",
    icon: "Users",
    href: "#",
    comingSoon: true,
  },
  {
    id: "gst",
    name: "GST Registration",
    icon: "Receipt",
    href: "#",
    comingSoon: true,
  },
  {
    id: "roc-compliance",
    name: "ROC Compliance",
    icon: "ClipboardCheck",
    href: "#",
    comingSoon: true,
  },
  {
    id: "income-tax",
    name: "Income Tax Filing",
    icon: "Calculator",
    href: "#",
    comingSoon: true,
  },
  {
    id: "trademark",
    name: "Trademark Registration",
    icon: "Award",
    href: "#",
    comingSoon: true,
  },
  {
    id: "payroll",
    name: "Payroll Services",
    icon: "Wallet",
    href: "#",
    comingSoon: true,
  },
];
