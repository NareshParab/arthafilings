export interface Package {
  id: string;
  name: string;
  price: string;
  govtFeeNote: string;
  features: string[];
  popular?: boolean;
  ctaLabel: string;
}

export interface Lead {
  name: string;
  email: string;
  phone: string;
  serviceSlug: string;
  extra: Record<string, string>;
  utm?: Record<string, string>;
}

export type OrderStatus =
  | "placed"
  | "documents_pending"
  | "documents_received"
  | "under_review"
  | "submitted"
  | "completed";

export interface OrderCustomer {
  name: string;
  email: string;
  phone: string;
  businessName?: string;
  gstin?: string;
  billingAddress?: string;
  billingState?: string;
}

export interface OrderAmounts {
  basePaise: number;
  discountPaise: number;
  gstPaise: number;
  totalPaise: number;
}

export interface Order {
  id: string;
  serviceSlug: string;
  packageId: string;
  customer: OrderCustomer;
  amounts: OrderAmounts;
  couponCode?: string;
  status: OrderStatus;
  createdAt: string;
  utm?: Record<string, string>;
}

export type PaymentStatus = "pending" | "paid" | "failed";
export type PaymentMethod = "upi" | "card" | "netbanking";

export interface Payment {
  id: string;
  orderId: string;
  status: PaymentStatus;
  method: PaymentMethod;
}

export interface Coupon {
  code: string;
  type: "percent" | "flat";
  value: number; // percent: 1-100. flat: paise.
}

export interface DocumentRequirement {
  id: string;
  label: string;
  hint: string;
  required: boolean;
}

export type UploadedDocumentStatus = "uploaded" | "accepted" | "rejected";

export interface UploadedDocument {
  id: string;
  requirementId: string;
  fileName: string;
  sizeBytes: number;
  mimeType: string;
  status: UploadedDocumentStatus;
  rejectReason?: string;
  uploadedAt: string;
}

export interface DeliveredDocument {
  id: string;
  label: string;
  fileName: string;
  issuedAt: string;
}

export type TimelineStepState = "done" | "current" | "upcoming";

export interface TimelineStep {
  key: string;
  label: string;
  state: TimelineStepState;
  at?: string;
}

export type NotificationChannel = "email" | "sms" | "whatsapp";

export interface Notification {
  id: string;
  channel: NotificationChannel;
  message: string;
  sentAt: string;
}
