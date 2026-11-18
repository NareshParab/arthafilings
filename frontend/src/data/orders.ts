// MOCK: demo orders for the dashboard. Shown only outside production — in
// production the dashboard only shows orders created in the mock session.
import type { DeliveredDocument, Notification, Order, UploadedDocument } from "@/types";

export const demoOrders: Order[] = [
  {
    id: "AFDEMO001",
    serviceSlug: "one-person-company",
    packageId: "standard",
    customer: {
      name: "Asha Mehta",
      email: "asha.mehta@example.com",
      phone: "9876500001",
    },
    amounts: { basePaise: 499900, discountPaise: 0, gstPaise: 89982, totalPaise: 589882 },
    status: "documents_pending",
    createdAt: "2026-11-16T10:30:00.000Z",
  },
  {
    id: "AFDEMO002",
    serviceSlug: "proprietorship-registration",
    packageId: "standard",
    customer: {
      name: "Rohit Sharma",
      email: "rohit.sharma@example.com",
      phone: "9876500002",
    },
    amounts: { basePaise: 199900, discountPaise: 0, gstPaise: 35982, totalPaise: 235882 },
    status: "under_review",
    createdAt: "2026-11-10T09:15:00.000Z",
  },
  {
    id: "AFDEMO003",
    serviceSlug: "llp-registration",
    packageId: "premium",
    customer: {
      name: "Priya Nair",
      email: "priya.nair@example.com",
      phone: "9876500003",
    },
    amounts: { basePaise: 799900, discountPaise: 50000, gstPaise: 134982, totalPaise: 884882 },
    couponCode: "FLAT500",
    status: "completed",
    createdAt: "2026-10-25T14:00:00.000Z",
  },
];

// Seeded upload states for the demo orders — keyed by order id. Requirement
// ids match lib/document-requirements.ts's `${serviceSlug}-${group}-${item}` scheme.
export const demoUploadedDocuments: Record<string, UploadedDocument[]> = {
  AFDEMO002: [
    {
      id: "doc-001",
      requirementId: "proprietorship-registration-0-0",
      fileName: "identity-proof.pdf",
      sizeBytes: 482_000,
      mimeType: "application/pdf",
      status: "accepted",
      uploadedAt: "2026-11-10T09:40:00.000Z",
    },
    {
      id: "doc-002",
      requirementId: "proprietorship-registration-0-1",
      fileName: "address-proof.pdf",
      sizeBytes: 355_000,
      mimeType: "application/pdf",
      status: "uploaded",
      uploadedAt: "2026-11-10T09:42:00.000Z",
    },
    {
      id: "doc-003",
      requirementId: "proprietorship-registration-0-2",
      fileName: "photo.jpg",
      sizeBytes: 210_000,
      mimeType: "image/jpeg",
      status: "rejected",
      rejectReason: "Photo is blurry — please upload a clearer passport-size photo.",
      uploadedAt: "2026-11-10T09:45:00.000Z",
    },
    {
      id: "doc-004",
      requirementId: "proprietorship-registration-0-3",
      fileName: "bank-details.pdf",
      sizeBytes: 198_000,
      mimeType: "application/pdf",
      status: "uploaded",
      uploadedAt: "2026-11-10T09:47:00.000Z",
    },
    {
      id: "doc-005",
      requirementId: "proprietorship-registration-1-0",
      fileName: "utility-bill.pdf",
      sizeBytes: 611_000,
      mimeType: "application/pdf",
      status: "uploaded",
      uploadedAt: "2026-11-10T09:50:00.000Z",
    },
    {
      id: "doc-006",
      requirementId: "proprietorship-registration-1-2",
      fileName: "premises-photo.jpg",
      sizeBytes: 275_000,
      mimeType: "image/jpeg",
      status: "uploaded",
      uploadedAt: "2026-11-10T09:52:00.000Z",
    },
  ],
};

export const demoDeliveredDocuments: Record<string, DeliveredDocument[]> = {
  AFDEMO003: [
    {
      id: "deliv-001",
      label: "Certificate of Incorporation",
      fileName: "llp-certificate-of-incorporation.pdf",
      issuedAt: "2026-11-05T12:00:00.000Z",
    },
    {
      id: "deliv-002",
      label: "LLP PAN Card",
      fileName: "llp-pan-card.pdf",
      issuedAt: "2026-11-06T12:00:00.000Z",
    },
  ],
};

export const demoNotifications: Record<string, Notification[]> = {
  AFDEMO001: [
    {
      id: "notif-001",
      channel: "sms",
      message: "Your order AFDEMO001 has been placed. We'll text you once it's time to upload documents.",
      sentAt: "2026-11-16T10:31:00.000Z",
    },
    {
      id: "notif-002",
      channel: "email",
      message: "We need a few documents to proceed with your One Person Company registration.",
      sentAt: "2026-11-16T10:35:00.000Z",
    },
  ],
  AFDEMO002: [
    {
      id: "notif-003",
      channel: "whatsapp",
      message: "Thanks for uploading your documents for AFDEMO002. Our team is reviewing them now.",
      sentAt: "2026-11-10T09:55:00.000Z",
    },
    {
      id: "notif-004",
      channel: "email",
      message: "One document needs attention: your photo was rejected. Please upload a clearer copy.",
      sentAt: "2026-11-10T11:00:00.000Z",
    },
  ],
  AFDEMO003: [
    {
      id: "notif-005",
      channel: "email",
      message: "Great news — your LLP registration (AFDEMO003) is complete. Documents are ready to download.",
      sentAt: "2026-11-06T12:05:00.000Z",
    },
  ],
};

export function getDemoUploadedDocuments(orderId: string): UploadedDocument[] {
  return demoUploadedDocuments[orderId] ?? [];
}

export function getDemoDeliveredDocuments(orderId: string): DeliveredDocument[] {
  return demoDeliveredDocuments[orderId] ?? [];
}

export function getDemoNotifications(orderId: string): Notification[] {
  return demoNotifications[orderId] ?? [];
}

// Demo orders plus whatever this session created at checkout. Demo orders
// never show in production — there, only session orders are shown.
export function getDashboardOrders(sessionOrders: Order[]): Order[] {
  const demo = process.env.NODE_ENV !== "production" ? demoOrders : [];
  return [...demo, ...sessionOrders];
}
