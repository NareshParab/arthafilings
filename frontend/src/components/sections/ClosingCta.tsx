import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ClosingCta({
  description = "Pick a plan and we'll take care of the rest.",
  ctaHref = "#packages",
}: {
  description?: string;
  ctaHref?: string;
}) {
  const isAnchor = ctaHref.startsWith("#");

  return (
    <section className="bg-navy">
      <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6">
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Ready to start?
        </h2>
        <p className="mt-2 text-blue-tint/80">{description}</p>
        <div className="mt-6">
          <Button
            nativeButton={false}
            size="lg"
            render={
              isAnchor ? (
                <a href={ctaHref}>Get started</a>
              ) : (
                <Link href={ctaHref}>Get started</Link>
              )
            }
          />
        </div>
      </div>
    </section>
  );
}
