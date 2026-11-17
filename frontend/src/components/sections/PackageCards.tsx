import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { proprietorshipPackages } from "@/data/packages";

export default function PackageCards() {
  return (
    <section id="packages" className="bg-cream">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-navy sm:text-3xl">
            Choose the plan that fits your registration
          </h2>
          <p className="mt-2 text-muted-foreground">
            Every plan includes application preparation and support until your registration is
            complete.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {proprietorshipPackages.map((pkg) => (
            <Card
              key={pkg.id}
              className={cn(
                "relative",
                pkg.popular ? "ring-2 ring-primary" : "ring-border"
              )}
            >
              {pkg.popular && (
                <Badge className="absolute -top-3 right-4 bg-gold text-white">Popular</Badge>
              )}
              <CardHeader>
                <CardTitle className="text-lg">{pkg.name}</CardTitle>
                <p className="text-2xl font-bold text-navy">{pkg.price}</p>
                <p className="text-xs text-muted-foreground">{pkg.govtFeeNote}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {pkg.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="bg-transparent">
                <Button
                  nativeButton={false}
                  className="w-full"
                  variant={pkg.popular ? "default" : "outline"}
                  render={<Link href={`/checkout?package=${pkg.id}`}>{pkg.ctaLabel}</Link>}
                />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
