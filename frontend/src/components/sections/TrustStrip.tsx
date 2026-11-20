import { getSiteEnv } from "@/lib/site-env";
import { hasPlaceholderMarker } from "@/lib/placeholder-markers";

// [VERIFY] only real numbers before launch.
const items = [
  { label: "Customer rating", value: "[TBD]" },
  { label: "Years of experience", value: "[TBD]" },
  { label: "Customers served", value: "[TBD]" },
  { label: "Live status tracking", value: "Included on every order" },
];

export default function TrustStrip() {
  const visibleItems =
    getSiteEnv() === "production" ? items.filter((item) => !hasPlaceholderMarker(item.value)) : items;

  if (visibleItems.length === 0) return null;

  return (
    <section className="border-y border-border bg-card">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-8 sm:px-6 md:grid-cols-4">
        {visibleItems.map((item) => (
          <div key={item.label} className="text-center">
            <p className="text-xl font-semibold text-navy">{item.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
