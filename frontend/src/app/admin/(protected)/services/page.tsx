import type { Metadata } from "next";
import { ServicesPage } from "@/components/admin/ServicesPage";

export const metadata: Metadata = { title: "Services" };

export default function AdminServicesPage() {
  return <ServicesPage />;
}
