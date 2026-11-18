"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useMockAuthSession } from "@/lib/mock-session";

// MOCK: real auth in backend phase. Client-only guard — no session means no
// dashboard access, redirecting back to login with a return path.
export default function DashboardGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const session = useMockAuthSession();

  useEffect(() => {
    if (!session) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [session, pathname, router]);

  if (!session) return null;
  return <>{children}</>;
}
