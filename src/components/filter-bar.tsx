"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useI18n } from "@/components/i18n-provider";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  sources?: Array<{ slug: string; name: string }>;
  competitions?: Array<{ slug: string; name: string }>;
}

export function FilterBar({ sources = [], competitions = [] }: FilterBarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useI18n();
  const activeSource = searchParams.get("source");
  const activeCompetition = searchParams.get("competition");
  const extended = searchParams.get("extended") === "true";

  function buildHref(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null) params.delete(key);
      else params.set(key, value);
    }
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href={buildHref({ extended: extended ? null : "true" })}
        className={cn(
          "cursor-pointer rounded-full border px-3 py-1 text-xs transition-colors duration-200",
          extended
            ? "border-primary bg-primary/10 text-primary"
            : "border-border text-muted-foreground hover:border-primary/50",
        )}
      >
        {t.filters.extendedOnly}
      </Link>
      {competitions.slice(0, 6).map((c) => (
        <Link
          key={c.slug}
          href={buildHref({
            competition: activeCompetition === c.slug ? null : c.slug,
          })}
          className={cn(
            "cursor-pointer rounded-full border px-3 py-1 text-xs transition-colors duration-200",
            activeCompetition === c.slug
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-muted-foreground hover:border-primary/50",
          )}
        >
          {c.name}
        </Link>
      ))}
      {sources.slice(0, 5).map((s) => (
        <Link
          key={s.slug}
          href={buildHref({ source: activeSource === s.slug ? null : s.slug })}
          className={cn(
            "cursor-pointer rounded-full border px-3 py-1 text-xs transition-colors duration-200",
            activeSource === s.slug
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-muted-foreground hover:border-primary/50",
          )}
        >
          {s.name}
        </Link>
      ))}
    </div>
  );
}
