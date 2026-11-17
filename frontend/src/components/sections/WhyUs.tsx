import { Users, Tag, ListChecks, MessageCircle } from "lucide-react";
import { whyArthafilings, type WhyItem } from "@/data/home-content";

const iconMap: Record<WhyItem["icon"], React.ComponentType<{ className?: string }>> = {
  Users,
  Tag,
  ListChecks,
  MessageCircle,
};

export default function WhyUs() {
  return (
    <section className="bg-card">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-center text-2xl font-bold tracking-tight text-navy sm:text-3xl">
          Why Arthafilings
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {whyArthafilings.map((item) => {
            const Icon = iconMap[item.icon];
            return (
              <div key={item.title} className="rounded-xl border border-border p-5">
                <Icon className="size-6 text-primary" aria-hidden="true" />
                <p className="mt-3 font-semibold text-navy">{item.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
