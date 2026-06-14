import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatMonthLabel, formatSeasonCounts } from "@/lib/i18n/format";
import type { Locale } from "@/lib/i18n/config";
import type { Messages } from "@/lib/i18n/messages/en";
import type { MonthSummary } from "@/lib/types";

interface SeasonMonthNavProps {
  competitionSlug: string;
  seasonSlug: string;
  months: MonthSummary[];
  activeMonth?: string;
  locale: Locale;
  t: Messages;
}

export function SeasonMonthNav({
  competitionSlug,
  seasonSlug,
  months,
  activeMonth,
  locale,
  t,
}: SeasonMonthNavProps) {
  if (months.length === 0) {
    return <p className="text-sm text-muted-foreground">{t.seasonNav.empty}</p>;
  }

  return (
    <nav className="space-y-1">
      <Link
        href={`/browse/${competitionSlug}/${seasonSlug}`}
        className={cn(
          "block cursor-pointer rounded-lg px-3 py-2 text-sm transition-colors duration-200",
          !activeMonth ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted",
        )}
      >
        {t.seasonNav.allMonths}
      </Link>
      {months.map((m) => (
        <Link
          key={m.month}
          href={`/browse/${competitionSlug}/${seasonSlug}/${m.month}`}
          className={cn(
            "block cursor-pointer rounded-lg px-3 py-2 text-sm transition-colors duration-200",
            activeMonth === m.month
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted",
          )}
        >
          <span className="font-medium">{formatMonthLabel(m.month, locale)}</span>
          <span className="mt-0.5 block text-xs opacity-70">
            {formatSeasonCounts(m.highlightCount, m.fullMatchCount, t.seasonNav)}
          </span>
        </Link>
      ))}
    </nav>
  );
}
