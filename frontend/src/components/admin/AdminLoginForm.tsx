"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { signInAs } from "@/lib/admin-session";
import type { AdminRole } from "@/types/admin";
import { ADMIN_USERS } from "@/data/admin-mock";

const ROLE_OPTIONS: { role: AdminRole; label: string }[] = [
  { role: "admin", label: "Sign in as Admin (mock)" },
  { role: "staff", label: "Sign in as Staff (mock)" },
  { role: "reviewer", label: "Sign in as Reviewer (mock)" },
];

function LoginButtons() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/admin";

  function handleSignIn(role: AdminRole) {
    signInAs(role);
    router.replace(next);
  }

  return (
    <div className="space-y-2">
      {ROLE_OPTIONS.map(({ role, label }) => {
        const user = ADMIN_USERS.find((candidate) => candidate.role === role);
        return (
          <Button key={role} className="w-full" variant="outline" onClick={() => handleSignIn(role)}>
            {label}
            {user && <span className="ml-auto text-muted-foreground">{user.name}</span>}
          </Button>
        );
      })}
    </div>
  );
}

export default function AdminLoginForm() {
  return (
    <Card className="w-full max-w-sm ring-border">
      <CardHeader>
        <CardTitle className="text-navy">Arthafilings admin</CardTitle>
        <CardDescription>
          Development-only mock sign-in. Pick a role to see what that role can do — real auth arrives in the
          backend phase.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={null}>
          <LoginButtons />
        </Suspense>
      </CardContent>
    </Card>
  );
}
