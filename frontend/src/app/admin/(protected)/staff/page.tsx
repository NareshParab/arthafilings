import type { Metadata } from "next";
import { StaffPage } from "@/components/admin/StaffPage";

export const metadata: Metadata = { title: "Staff" };

export default function AdminStaffPage() {
  return <StaffPage />;
}
