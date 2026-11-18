import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function KpiCard({
  label,
  value,
  icon: Icon,
  mock,
  className,
}: {
  label: string;
  value: string;
  icon?: LucideIcon;
  mock?: boolean;
  className?: string;
}) {
  return (
    <Card className={cn("ring-border", className)}>
      <CardContent className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-navy">{value}</p>
          {mock && (
            <Badge variant="outline" className="mt-2 text-muted-foreground">
              [MOCK]
            </Badge>
          )}
        </div>
        {Icon && (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-tint text-primary">
            <Icon className="size-4.5" aria-hidden="true" />
          </span>
        )}
      </CardContent>
    </Card>
  );
}
