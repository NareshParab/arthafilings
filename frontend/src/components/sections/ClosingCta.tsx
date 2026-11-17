import { Button } from "@/components/ui/button";

export default function ClosingCta() {
  return (
    <section className="bg-navy">
      <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6">
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Ready to start?
        </h2>
        <p className="mt-2 text-blue-tint/80">
          Pick a plan and we&apos;ll take care of the rest.
        </p>
        <div className="mt-6">
          <Button nativeButton={false} size="lg" render={<a href="#packages">Get started</a>} />
        </div>
      </div>
    </section>
  );
}
