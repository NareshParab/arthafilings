import type { Metadata } from "next";
import { CouponsPage } from "@/components/admin/CouponsPage";

export const metadata: Metadata = { title: "Coupons" };

export default function AdminCouponsPage() {
  return <CouponsPage />;
}
