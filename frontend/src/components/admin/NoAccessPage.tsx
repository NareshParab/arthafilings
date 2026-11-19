import { ShieldAlert } from "lucide-react";

export function NoAccessPage({ message }: { message?: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-blue-tint text-primary">
        <ShieldAlert className="size-6" aria-hidden="true" />
      </span>
      {/* Not an h1 — AdminShell already renders the page's h1 from getPageTitle(pathname); a second one here would give every gated admin page two h1s. */}
      <p className="text-lg font-semibold text-navy">You do not have access</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        {message ?? "Your role doesn't have access to this page. If you think this is wrong, ask an admin."}
      </p>
    </div>
  );
}
