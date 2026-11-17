import {
  Landmark,
  FileCheck,
  UserCheck,
  Wallet,
  Building2,
  TrendingUp,
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  whatIsProprietorship,
  benefits,
  documentChecklist,
  processSteps,
  costTable,
  type BenefitItem,
} from "@/data/proprietorship-content";

const iconMap: Record<BenefitItem["icon"], React.ComponentType<{ className?: string }>> = {
  Landmark,
  FileCheck,
  UserCheck,
  Wallet,
  Building2,
  TrendingUp,
};

export default function Explainer() {
  return (
    <>
      <section className="bg-card">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
          <h2 className="text-2xl font-bold tracking-tight text-navy sm:text-3xl">
            {whatIsProprietorship.heading}
          </h2>
          <div className="mt-4 space-y-4 text-foreground">
            {whatIsProprietorship.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cream">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="text-center text-2xl font-bold tracking-tight text-navy sm:text-3xl">
            Benefits of a proprietorship
          </h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit) => {
              const Icon = iconMap[benefit.icon];
              return (
                <div key={benefit.title} className="flex gap-3">
                  <Icon className="size-6 shrink-0 text-primary" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-navy">{benefit.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{benefit.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-card">
        <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
          <h2 className="text-center text-2xl font-bold tracking-tight text-navy sm:text-3xl">
            Documents you will need
          </h2>
          <div className="mt-10 grid gap-10 sm:grid-cols-2">
            <div>
              <h3 className="font-semibold text-navy">Proprietor</h3>
              <ul className="mt-3 space-y-2 text-sm text-foreground">
                {documentChecklist.proprietor.map((doc) => (
                  <li key={doc} className="flex items-start gap-2">
                    <FileCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-navy">Business address</h3>
              <ul className="mt-3 space-y-2 text-sm text-foreground">
                {documentChecklist.businessAddress.map((doc) => (
                  <li key={doc} className="flex items-start gap-2">
                    <FileCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-cream">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
          <h2 className="text-center text-2xl font-bold tracking-tight text-navy sm:text-3xl">
            How it works
          </h2>
          <ol className="mt-10 space-y-8">
            {processSteps.map((step, index) => (
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

      <section className="bg-card">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
          <h2 className="text-center text-2xl font-bold tracking-tight text-navy sm:text-3xl">
            Cost breakdown
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Final amounts will be confirmed before you pay. [TBD]
          </p>
          <div className="mt-8 overflow-hidden rounded-xl border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Who charges</TableHead>
                  <TableHead>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {costTable.map((row) => (
                  <TableRow key={row.item}>
                    <TableCell>{row.item}</TableCell>
                    <TableCell>{row.whoCharges}</TableCell>
                    <TableCell>{row.amount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </section>
    </>
  );
}
