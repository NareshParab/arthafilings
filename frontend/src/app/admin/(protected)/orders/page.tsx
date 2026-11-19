import type { Metadata } from "next";
import { OrdersPage } from "@/components/admin/OrdersPage";

export const metadata: Metadata = { title: "Orders" };

export default function AdminOrdersPage() {
  return <OrdersPage />;
}
