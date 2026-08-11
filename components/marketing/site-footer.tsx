import Link from "next/link";

import { VibeflowLogo } from "@/components/dashboard/vibeflow-logo";

const FOOTER_LINKS = [
  { href: "#funcionalidades", label: "Funcionalidades" },
  { href: "#precos", label: "Preços" },
  { href: "/login", label: "Entrar" },
  { href: "/signup", label: "Criar conta" },
];

function SiteFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-10 text-foreground md:flex-row md:items-center md:justify-between md:px-8">
        <VibeflowLogo href="/" />

        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {FOOTER_LINKS.map((link) =>
            link.href.startsWith("#") ? (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ),
          )}
        </nav>

        <p className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
          © {new Date().getFullYear()} VibeFlow
        </p>
      </div>
    </footer>
  );
}

export { SiteFooter };
