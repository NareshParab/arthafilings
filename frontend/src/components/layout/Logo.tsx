import Link from "next/link";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site-config";

// [VERIFY] placeholder mark — an invented geometric shape, not a final logo.
function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <rect width="32" height="32" rx="8" fill="var(--navy)" />
      <path
        d="M16 7 L23 23 H18.5 L16 17 L13.5 23 H9 L16 7 Z"
        fill="var(--primary)"
      />
    </svg>
  );
}

export default function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("inline-flex items-center gap-2 font-bold text-navy", className)}
    >
      <LogoMark className="size-8" />
      <span className="text-xl tracking-tight text-current">{siteConfig.name}</span>
    </Link>
  );
}
