"use client";

import Link from "next/link";
import { UserPlus, CalendarClock, FileClock, ClipboardCheck, IndianRupee } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/admin/KpiCard";
import { LeadsBarChart } from "@/components/admin/LeadsBarChart";
import { LeadStatusBadge } from "@/components/admin/StatusBadge";
import { formatINR } from "@/lib/pricing";
import { getService } from "@/data/service-catalog";
import { MOCK_TODAY } from "@/data/admin-mock";
import { useAdminLeads, useAdminOrders } from "@/lib/admin-store";
import type { AdminSession } from "@/lib/admin-session";

function lastSevenDays(todayIso: string) {
  const today = new Date(`${todayIso}T00:00:00.000Z`);
  return Array.from({ length: 7 }, (_, index) => {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - (6 - index));
    return {
      date: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString("en-IN", { weekday: "short", timeZone: "UTC" }),
    };
  });
}

export function DashboardOverview({ session }: { session: AdminSession }) {
  const allLeads = useAdminLeads();
  const allOrders = useAdminOrders();

  const leads = session.role === "staff" ? allLeads.filter((l) => l.assignedTo === null || l.assignedTo === session.userId) : allLeads;
  const orders =
    session.role === "staff" ? allOrders.filter((o) => o.assignedTo === null || o.assignedTo === session.userId) : allOrders;

  const newLeadsToday = leads.filter((l) => l.createdAt.slice(0, 10) === MOCK_TODAY).length;
  const followUpsDueToday = leads.filter((l) => l.followUpDate === MOCK_TODAY).length;
  const ordersAwaitingDocuments = orders.filter((o) => o.status === "documents_pending").length;
  const ordersAwaitingReview = allOrders.filter((o) => o.status === "under_review").length;
  const revenueThisMonthPaise = allOrders
    .filter((o) => o.paymentStatus === "paid" && o.createdAt.slice(0, 7) === MOCK_TODAY.slice(0, 7))
    .reduce((sum, o) => sum + o.amounts.totalPaise, 0);

  const chartData = lastSevenDays(MOCK_TODAY).map((day) => ({
    ...day,
    count: leads.filter((l) => l.createdAt.slice(0, 10) === day.date).length,
  }));

  const attention = [
    ...leads
      .filter((l) => l.followUpDate && l.followUpDate <= MOCK_TODAY && l.status !== "converted" && l.status !== "lost")
      .map((l) => ({ id: `lead-${l.id}`, text: `Follow up with ${l.name}`, href: "/admin/leads" })),
    ...orders
      .filter((o) => o.status === "documents_pending")
      .map((o) => ({ id: `doc-${o.id}`, text: `${o.orderNo} is waiting on documents`, href: `/admin/orders/${o.id}` })),
    ...(session.role === "admin" || session.role === "reviewer"
      ? allOrders
          .filter((o) => o.status === "under_review")
          .map((o) => ({ id: `rev-${o.id}`, text: `${o.orderNo} is waiting for review`, href: `/admin/orders/${o.id}` }))
      : []),
  ].slice(0, 6);

  const recentLeads = [...leads].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard label="New leads today" value={String(newLeadsToday)} icon={UserPlus} />
        <KpiCard label="Follow-ups due today" value={String(followUpsDueToday)} icon={CalendarClock} />
        <KpiCard label="Orders awaiting documents" value={String(ordersAwaitingDocuments)} icon={FileClock} />
        <KpiCard label="Orders awaiting review" value={String(ordersAwaitingReview)} icon={ClipboardCheck} />
        <KpiCard label="Revenue this month" value={formatINR(revenueThisMonthPaise)} icon={IndianRupee} mock />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="ring-border lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-navy">Needs your attention</CardTitle>
          </CardHeader>
          <CardContent>
            {attention.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing needs attention right now.</p>
            ) : (
              <ul className="space-y-2">
                {attention.map((item) => (
                  <li key={item.id}>
                    <Link href={item.href} className="text-sm text-foreground hover:text-primary hover:underline">
                      {item.text}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="ring-border">
          <CardHeader>
            <CardTitle className="text-navy">Leads, last 7 days</CardTitle>
          </CardHeader>
          <CardContent>
            <LeadsBarChart data={chartData} />
          </CardContent>
        </Card>
      </div>

      {session.role !== "reviewer" && (
        <Card className="ring-border">
          <CardHeader>
            <CardTitle className="text-navy">Recent leads</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentLeads.length === 0 ? (
              <p className="text-sm text-muted-foreground">No leads yet.</p>
            ) : (
              recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between gap-3 text-sm">
                  <div>
                    <p className="font-medium text-foreground">{lead.name}</p>
                    <p className="text-muted-foreground">{getService(lead.serviceSlug)?.name ?? lead.serviceSlug}</p>
                  </div>
                  <LeadStatusBadge status={lead.status} />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
