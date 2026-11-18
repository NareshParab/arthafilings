import { notFound } from "next/navigation";
import AdminLoginForm from "@/components/admin/AdminLoginForm";

// MOCK: this mock role-picker login only exists outside production. Once
// real admin auth ships in the backend phase, this page goes away — until
// then, production has no way into /admin, which is the point.
export default function AdminLoginPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <AdminLoginForm />
    </div>
  );
}
