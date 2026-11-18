import Link from "next/link";
import {
  Building2,
  ClipboardCheck,
  Award,
  Receipt,
  Calculator,
  Landmark,
  FileCheck,
  Users,
  Globe,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { serviceGroups, type ServiceGroup } from "@/data/service-catalog";

const iconMap: Record<ServiceGroup["slug"], React.ComponentType<{ className?: string }>> = {
  startup: Building2,
  registrations: ClipboardCheck,
  trademark: Award,
  gst: Receipt,
  "income-tax": Calculator,
  mca: Landmark,
  compliance: FileCheck,
  consultation: Users,
  global: Globe,
};

export default function ServiceTiles() {
  return (
    <section className="bg-card">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-center text-2xl font-bold tracking-tight text-navy sm:text-3xl">
          Our services
        </h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {serviceGroups.map((group) => {
            const Icon = iconMap[group.slug] ?? Building2;
            return (
              <Link key={group.slug} href={`/services/${group.slug}`} className="block">
                <Card className="h-full ring-border transition-colors hover:ring-primary/40">
                  <CardContent className="flex flex-col items-start gap-3">
                    <Icon className="size-7 text-primary" aria-hidden="true" />
                    <p className="font-semibold text-navy">{group.name}</p>
                    <p className="text-sm text-muted-foreground">{group.description}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
