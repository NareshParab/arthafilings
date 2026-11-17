import { reviews } from "@/data/reviews";

export default function Reviews() {
  if (reviews.length === 0) {
    if (process.env.NODE_ENV === "production") {
      return null;
    }

    return (
      <section className="bg-card">
        <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6">
          <h2 className="text-2xl font-bold tracking-tight text-navy sm:text-3xl">
            Customer reviews
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Reviews will appear here after launch.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-card">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h2 className="text-center text-2xl font-bold tracking-tight text-navy sm:text-3xl">
          Customer reviews
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <div key={`${review.name}-${review.date}`} className="rounded-xl border border-border p-5">
              <p className="text-sm text-foreground">&ldquo;{review.text}&rdquo;</p>
              <p className="mt-3 text-sm font-semibold text-navy">{review.name}</p>
              <p className="text-xs text-muted-foreground">{review.city}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
