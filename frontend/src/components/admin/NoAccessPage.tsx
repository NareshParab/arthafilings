import { ShieldAlert } from "lucide-react";

export function NoAccessPage({ message }: { message?: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-blue-tint text-primary">
        <ShieldAlert className="size-6" aria-hidden="true" />
      </span>
      <h1 className="text-lg font-semibold text-navy">You do not have access</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        {message ?? "Your role doesn't have access to this page. If you think this is wrong, ask an admin."}
      </p>
    </div>
  );
}
