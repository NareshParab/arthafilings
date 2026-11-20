import type { LegalDoc } from "@/data/legal-content";
import { getSiteEnv } from "@/lib/site-env";
import { hasPlaceholderMarker } from "@/lib/placeholder-markers";

export default function LegalPage({ doc }: { doc: LegalDoc }) {
  const inProduction = getSiteEnv() === "production";
  const hideLastUpdated = inProduction && hasPlaceholderMarker(doc.lastUpdated);

  return (
    <div className="bg-card">
      {!inProduction && (
        <div className="bg-destructive/10 px-4 py-3 text-center text-sm font-medium text-destructive">
          DRAFT: must be reviewed by a lawyer before launch.
        </div>
      )}

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight text-navy sm:text-4xl">{doc.title}</h1>
        {!hideLastUpdated && (
          <p className="mt-2 text-sm text-muted-foreground">Last updated: {doc.lastUpdated}</p>
        )}

        <div className="mt-10 grid gap-10 lg:grid-cols-[220px_1fr]">
          <nav aria-label="Table of contents" className="hidden lg:block">
            <div className="sticky top-24">
              <p className="text-sm font-semibold text-navy">On this page</p>
              <ul className="mt-3 space-y-2 border-l border-border pl-3">
                {doc.sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="text-sm text-muted-foreground hover:text-primary-hover"
                    >
                      {section.heading}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          <div className="max-w-2xl space-y-10 text-foreground">
            <p>{doc.intro}</p>
            {doc.sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-24">
                <h2 className="text-xl font-semibold text-navy">{section.heading}</h2>
                <div className="mt-3 space-y-3 text-sm">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
