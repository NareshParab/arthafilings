import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import Logo from "@/components/layout/Logo";
import { siteConfig } from "@/lib/site-config";
import { services } from "@/data/services";

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <ul className="mt-3 space-y-2">{children}</ul>
    </div>
  );
}

async function getCurrentYear() {
  "use cache";
  return new Date().getFullYear();
}

export default async function Footer() {
  const year = await getCurrentYear();

  return (
    <footer className="bg-navy text-blue-tint">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo className="text-white" />
            <p className="mt-3 max-w-xs text-sm text-blue-tint/80">
              {siteConfig.tagline}
            </p>
          </div>

          <FooterColumn title="Services">
            {services.map((item) => (
              <li key={item.id} className="flex flex-col items-start gap-1">
                <Link
                  href={item.href}
                  className="text-sm text-blue-tint/80 hover:text-white"
                >
                  {item.name}
                </Link>
                {item.comingSoon && (
                  <Badge
                    variant="outline"
                    className="h-4 whitespace-nowrap border-blue-tint/40 px-1.5 text-[10px] text-blue-tint/70"
                  >
                    Coming soon
                  </Badge>
                )}
              </li>
            ))}
          </FooterColumn>

          <FooterColumn title="Company">
            {siteConfig.footer.company.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="text-sm text-blue-tint/80 hover:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </FooterColumn>

          <FooterColumn title="Legal">
            {siteConfig.footer.legal.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="text-sm text-blue-tint/80 hover:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </FooterColumn>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-sm text-blue-tint/70">
            © {year} {siteConfig.name}. All rights reserved.
          </p>
          <ul className="flex items-center gap-4">
            {siteConfig.footer.social.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className="text-sm text-blue-tint/70 hover:text-white"
                  aria-label={item.label}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
