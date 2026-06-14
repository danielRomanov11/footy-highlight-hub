"use client";

import Link from "next/link";
import { useI18n } from "@/components/i18n-provider";

export function SiteFooter() {
  const { t } = useI18n();

  return (
    <footer className="mt-auto border-t border-border/60 bg-card/30">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-xl space-y-2 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">{t.brand.full}</p>
          <p>{t.footer.disclaimer}</p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm" aria-label={t.nav.footer}>
          <Link
            href="/"
            className="cursor-pointer text-muted-foreground transition-colors duration-200 hover:text-foreground"
          >
            {t.nav.latest}
          </Link>
          <Link
            href="/browse"
            className="cursor-pointer text-muted-foreground transition-colors duration-200 hover:text-foreground"
          >
            {t.nav.browse}
          </Link>
          <Link
            href="/sources"
            className="cursor-pointer text-muted-foreground transition-colors duration-200 hover:text-foreground"
          >
            {t.nav.sources}
          </Link>
        </nav>
      </div>
      <div className="border-t border-border/40">
        <p className="mx-auto max-w-7xl px-4 py-4 text-xs text-muted-foreground sm:px-6">
          {t.footer.builtWith}
        </p>
      </div>
    </footer>
  );
}
