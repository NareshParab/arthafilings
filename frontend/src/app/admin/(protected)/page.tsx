"use client";

import { useAdminSession } from "@/lib/admin-session";
import { DashboardOverview } from "@/components/admin/DashboardOverview";

export default function AdminDashboardPage() {
  const session = useAdminSession();
  if (!session) return null;
  return <DashboardOverview session={session} />;
}
