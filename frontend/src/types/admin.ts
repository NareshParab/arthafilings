// MOCK: admin-side types. Backend phase replaces every mock store these back.
import type { Order } from "@/types";

export type AdminRole = "admin" | "staff" | "reviewer";

export interface AdminUser {
  id: string;
  name: string;
  role: AdminRole;
}

export type LeadStatus = "new" | "contacted" | "follow_up" | "converted" | "lost";

export interface LeadNote {
  id: string;
  authorId: string;
  authorName: string;
  body: string;
  at: string;
}

export interface AdminLeadExtra {
  state?: string;
  gstin?: string;
  pan?: string;
  brandName?: string;
}

export interface AdminLead {
  id: string;
  name: string;
  phone: string;
  email: string;
  serviceSlug: string;
  status: LeadStatus;
  assignedTo: string | null;
  utmSource?: string;
  utmCampaign?: string;
  extra: AdminLeadExtra;
  followUpDate?: string;
  createdAt: string;
  notes: LeadNote[];
  activityLog: ActivityLogEntry[];
}

export type AdminDocumentStatus = "uploaded" | "accepted" | "rejected";

export interface AdminOrderDocument {
  id: string;
  label: string;
  fileName: string;
  status: AdminDocumentStatus;
  rejectReason?: string;
  uploadedAt: string;
}

export interface DeliveredDocumentMock {
  id: string;
  label: string;
  fileName: string;
  issuedAt: string;
}

export interface InternalNote {
  id: string;
  authorId: string;
  authorName: string;
  body: string;
  at: string;
}

export interface ActivityLogEntry {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  at: string;
}

export interface AdminOrder {
  id: string;
  orderNo: string;
  serviceSlug: string;
  customer: Order["customer"];
  amounts: Order["amounts"];
  status: Order["status"];
  paymentStatus: "pending" | "paid" | "failed";
  assignedTo: string | null;
  preparedBy: string | null;
  documents: AdminOrderDocument[];
  deliveredDocuments: DeliveredDocumentMock[];
  internalNotes: InternalNote[];
  activityLog: ActivityLogEntry[];
  createdAt: string;
}
