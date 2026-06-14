import Link from "next/link";
import { ChevronRight, Trophy } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { hasSupabaseConfig } from "@/lib/env";
import { getTranslations } from "@/lib/i18n";
import { interpolate } from "@/lib/i18n/format";
import { getCompetitions } from "@/lib/videos";

export const dynamic = "force-dynamic";

export default async function BrowseIndexPage() {
  const { t } = await getTranslations();

  if (!hasSupabaseConfig()) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <EmptyState message={t.browse.emptyConfig} />
      </div>
    );
  }

  const competitions = await getCompetitions();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <PageHeader
        eyebrow={t.browse.eyebrow}
        title={t.browse.title}
        description={t.browse.description}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {competitions.map((competition) => {
          const seasons = (
            (competition.seasons as Array<{ label: string; start_date: string }>) ?? []
          ).sort((a, b) => b.start_date.localeCompare(a.start_date));
          const latestSeason = seasons[0];

          return (
            <Link
              key={competition.id}
              href={
                latestSeason
                  ? `/browse/${competition.slug}/${latestSeason.label.replace("/", "-")}`
                  : "#"
              }
              className="group cursor-pointer rounded-2xl border border-border/60 bg-card/80 p-6 transition-colors duration-200 hover:border-primary/40 hover:bg-card"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                  <Trophy className="h-5 w-5" aria-hidden />
                </span>
                <ChevronRight
                  className="h-5 w-5 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-primary"
                  aria-hidden
                />
              </div>
              <h2 className="mt-4 text-lg font-semibold">{competition.name}</h2>
              {competition.country && (
                <p className="text-sm text-muted-foreground">{competition.country}</p>
              )}
              {latestSeason && (
                <p className="mt-3 text-xs font-medium text-primary">
                  {interpolate(t.browse.season, { label: latestSeason.label })}
                </p>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
