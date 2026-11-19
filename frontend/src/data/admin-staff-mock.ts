// MOCK: staff directory seed. Mirrors data/admin-mock.ts's ADMIN_USERS
// (same 4 people) with the extra fields the staff page needs. Replace with
// a real staff/user API in the backend phase.
import type { StaffMember } from "@/types/admin";

const isDev = process.env.NODE_ENV !== "production";

const adminStaffSeed: StaffMember[] = [
  { id: "u-meera", name: "Meera Iyer", email: "meera.iyer@arthafilings.example", role: "admin", status: "active", lastActiveAt: "2026-11-18T09:40:00.000Z", invitedAt: "2026-01-05T09:00:00.000Z" },
  { id: "u-devika", name: "Devika Rao", email: "devika.rao@arthafilings.example", role: "staff", status: "active", lastActiveAt: "2026-11-18T08:30:00.000Z", invitedAt: "2026-02-10T09:00:00.000Z" },
  { id: "u-arjun", name: "Arjun Nair", email: "arjun.nair@arthafilings.example", role: "staff", status: "active", lastActiveAt: "2026-11-17T17:10:00.000Z", invitedAt: "2026-03-01T09:00:00.000Z" },
  { id: "u-kabir", name: "Kabir Shah", email: "kabir.shah@arthafilings.example", role: "reviewer", status: "active", lastActiveAt: "2026-11-17T12:00:00.000Z", invitedAt: "2026-02-20T09:00:00.000Z" },
];

export const ADMIN_STAFF: StaffMember[] = isDev ? adminStaffSeed : [];
