"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Play, Tv } from "lucide-react";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { useI18n } from "@/components/i18n-provider";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", key: "latest" as const },
  { href: "/browse", key: "browse" as const },
  { href: "/sources", key: "sources" as const },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between rounded-2xl border border-border/60 bg-card/70 px-4 py-3 shadow-lg shadow-black/20 backdrop-blur-md">
        <Link
          href="/"
          className="flex cursor-pointer items-center gap-2.5 font-semibold tracking-tight transition-opacity hover:opacity-90"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/25">
            <Tv className="h-5 w-5" aria-hidden />
          </span>
          <span className="hidden text-lg sm:inline">{t.brand.full}</span>
          <span className="text-lg sm:hidden">{t.brand.short}</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <nav className="flex items-center gap-1 sm:gap-2" aria-label={t.nav.main}>
            {navItems.map(({ href, key }) => {
              const isActive =
                href === "/"
                  ? pathname === "/"
                  : pathname === href || pathname.startsWith(`${href}/`);

              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "cursor-pointer rounded-lg px-3 py-1.5 text-sm transition-colors duration-200",
                    isActive
                      ? "bg-primary/15 font-medium text-primary"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  {t.nav[key]}
                </Link>
              );
            })}
            <Link
              href="/browse"
              className="ml-1 hidden cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors duration-200 hover:bg-primary/90 sm:inline-flex"
            >
              <Play className="h-3.5 w-3.5" aria-hidden />
              {t.nav.watch}
            </Link>
          </nav>
          <LocaleSwitcher />
        </div>
      </div>
    </header>
  );
}
