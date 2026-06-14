import type { Locale } from "./config";
import type { Messages } from "./messages/en";

function interpolate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ""));
}

export function formatRelativeTime(
  dateStr: string,
  locale: Locale,
  time: Messages["time"],
): string {
  const date = new Date(dateStr);
  const diff = Date.now() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return time.today;
  if (days === 1) return time.yesterday;
  if (days < 7) return interpolate(time.daysAgo, { count: days });
  if (days < 30) return interpolate(time.weeksAgo, { count: Math.floor(days / 7) });

  return date.toLocaleDateString(locale === "ru" ? "ru-RU" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatMonthLabel(month: string, locale: Locale): string {
  const [year, m] = month.split("-");
  const date = new Date(Number(year), Number(m) - 1, 1);
  return date.toLocaleDateString(locale === "ru" ? "ru-RU" : "en-US", {
    month: "long",
    year: "numeric",
  });
}

export function formatSeasonCounts(
  highlightCount: number,
  fullMatchCount: number,
  seasonNav: Messages["seasonNav"],
): string {
  const highlights = interpolate(seasonNav.highlights, { count: highlightCount });
  if (fullMatchCount <= 0) return highlights;
  const fullMatches = interpolate(seasonNav.fullMatches, { count: fullMatchCount });
  return interpolate(seasonNav.highlightsAndMatches, { highlights, fullMatches });
}

export { interpolate };
