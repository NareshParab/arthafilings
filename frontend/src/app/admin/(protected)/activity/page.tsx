import type { Metadata } from "next";
import { ActivityPage } from "@/components/admin/ActivityPage";

export const metadata: Metadata = { title: "Activity" };

export default function AdminActivityPage() {
  return <ActivityPage />;
}
