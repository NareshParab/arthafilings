import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TimelineStep } from "@/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function Timeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <ol className="space-y-6">
      {steps.map((step, index) => (
        <li key={step.key} className="relative flex gap-4 pb-1">
          {index < steps.length - 1 && (
            <span
              aria-hidden="true"
              className={cn(
                "absolute top-7 left-3.5 h-[calc(100%-0.25rem)] w-px -translate-x-1/2",
                step.state === "done" ? "bg-primary" : "bg-border"
              )}
            />
          )}
          <span
            className={cn(
              "relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
              step.state === "done" && "bg-primary text-primary-foreground",
              step.state === "current" && "bg-primary/15 text-primary ring-2 ring-primary",
              step.state === "upcoming" && "bg-muted text-muted-foreground"
            )}
          >
            {step.state === "done" ? <Check className="size-4" aria-hidden="true" /> : index + 1}
          </span>
          <div className="pt-0.5">
            <p
              className={cn(
                "font-medium",
                step.state === "upcoming" ? "text-muted-foreground" : "text-navy"
              )}
            >
              {step.label}
              {step.state === "current" && (
                <span className="ml-2 text-xs font-normal text-primary">In progress</span>
              )}
            </p>
            {step.at && <p className="text-sm text-muted-foreground">{formatDate(step.at)}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
