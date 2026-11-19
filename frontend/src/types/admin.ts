// MOCK: admin-side types. Backend phase replaces every mock store these back.
import type { Order } from "@/types";
import type { ServiceMode } from "@/data/service-catalog";

export type AdminRole = "admin" | "staff" | "reviewer";

export interface AdminUser {
  id: string;
  name: string;
  role: AdminRole;
}

export type StaffStatus = "active" | "inactive";

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: StaffStatus;
  lastActiveAt: string | null;
  invitedAt: string;
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

// --- Services and prices (admin-editable catalog content) ---------------

export type ContentStatus = "draft" | "ready";

export interface AdminServicePackage {
  id: string;
  name: string;
  pricePaise: number;
  govtFeeNote: string;
  popular: boolean;
  features: string[];
  buttonLabel: string;
}

export interface AdminServiceDocument {
  id: string;
  label: string;
  required: boolean;
}

export interface AdminServiceFaq {
  id: string;
  question: string;
  answer: string;
}

export interface AdminServiceContent {
  slug: string;
  mode: ServiceMode;
  contentStatus: ContentStatus;
  intro: string;
  priceChipText: string;
  packages: AdminServicePackage[];
  whatIsIt: string;
  whoNeedsIt: string[];
  benefits: string[];
  documents: AdminServiceDocument[];
  faqs: AdminServiceFaq[];
  seoTitle: string;
  seoDescription: string;
  legalReviewedBy: string;
  legalReviewDate: string;
  lastEditedAt: string | null;
  lastEditedBy: string | null;
}

// --- Coupons --------------------------------------------------------------

export type CouponType = "percent" | "flat";

export interface AdminCoupon {
  id: string;
  code: string;
  type: CouponType;
  value: number; // percent: 1-100. flat: rupees (whole number).
  minOrderPaise: number;
  validFrom: string; // yyyy-mm-dd
  validTo: string; // yyyy-mm-dd
  usageLimit: number;
  appliesTo: "all" | string[]; // service slugs when not "all"
  active: boolean;
  createdAt: string;
}

// --- Global activity log ---------------------------------------------------

export type GlobalActivityEntityType = "lead" | "order" | "service" | "coupon" | "staff";

export interface GlobalActivityEntry {
  id: string;
  at: string;
  actorId: string;
  actorName: string;
  actorRole: AdminRole | null;
  action: string;
  entityType: GlobalActivityEntityType;
  entityId: string;
  entityLabel: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
}
