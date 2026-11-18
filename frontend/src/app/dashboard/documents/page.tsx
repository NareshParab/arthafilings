import type { Metadata } from "next";
import DocumentsOverview from "@/components/dashboard/DocumentsOverview";

export const metadata: Metadata = {
  title: "Documents",
};

export default function DashboardDocumentsPage() {
  return <DocumentsOverview />;
}
