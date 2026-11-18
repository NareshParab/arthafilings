export default function PageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <section className="bg-blue-tint">
      <div className="mx-auto max-w-3xl px-4 py-12 text-center sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight text-navy sm:text-4xl">{title}</h1>
        {description && <p className="mt-3 text-foreground">{description}</p>}
      </div>
    </section>
  );
}
