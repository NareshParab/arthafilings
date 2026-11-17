import { homeHowItWorks } from "@/data/home-content";

export default function HowItWorks() {
  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <h2 className="text-center text-2xl font-bold tracking-tight text-navy sm:text-3xl">
          How it works
        </h2>
        <ol className="mt-10 space-y-8">
          {homeHowItWorks.map((step, index) => (
            <li key={step.title} className="flex gap-4">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {index + 1}
              </span>
              <div>
                <p className="font-semibold text-navy">{step.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
