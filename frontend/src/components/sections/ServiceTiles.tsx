import Link from "next/link";
import {
  Building2,
  Building,
  Users,
  Receipt,
  ClipboardCheck,
  Calculator,
  Award,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { services, type ServiceTile } from "@/data/services";

const iconMap: Record<ServiceTile["icon"], React.ComponentType<{ className?: string }>> = {
  Building2,
  Building,
  Users,
  Receipt,
  ClipboardCheck,
  Calculator,
  Award,
  Wallet,
};

export default function ServiceTiles() {
  return (
    <section className="bg-card">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-center text-2xl font-bold tracking-tight text-navy sm:text-3xl">
          Our services
        </h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => {
            const Icon = iconMap[service.icon];
            const tile = (
              <Card className="h-full ring-border transition-colors hover:ring-primary/40">
                <CardContent className="flex flex-col items-start gap-3">
                  <Icon className="size-7 text-primary" aria-hidden="true" />
                  <p className="font-semibold text-navy">{service.name}</p>
                  {service.comingSoon && (
                    <Badge variant="outline" className="border-border text-muted-foreground">
                      Coming soon
                    </Badge>
                  )}
                </CardContent>
              </Card>
            );

            return service.comingSoon ? (
              <div key={service.id} aria-disabled="true">
                {tile}
              </div>
            ) : (
              <Link key={service.id} href={service.href} className="block">
                {tile}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
