import { notFound } from "next/navigation";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { SeasonMonthNav } from "@/components/season-month-nav";
import { VideoCard } from "@/components/video-card";
import { hasSupabaseConfig } from "@/lib/env";
import { getTranslations } from "@/lib/i18n";
import { formatMonthLabel, interpolate } from "@/lib/i18n/format";
import type { ContentType } from "@/lib/types";
import { getCompetitions, getMonthSummaries, getVideos } from "@/lib/videos";

export const dynamic = "force-dynamic";

interface MonthPageProps {
  params: Promise<{ competition: string; season: string; month: string }>;
  searchParams: Promise<{ type?: string }>;
}

export default async function MonthBrowsePage({ params, searchParams }: MonthPageProps) {
  if (!hasSupabaseConfig()) notFound();

  const { competition: competitionSlug, season: seasonSlug, month } = await params;
  const { type } = await searchParams;
  const { locale, t } = await getTranslations();
  const showFullMatches = process.env.NEXT_PUBLIC_ENABLE_FULL_MATCHES === "true";
  const contentType = (type as ContentType) ?? "highlight";

  const competitions = await getCompetitions();
  const competition = competitions.find((c) => c.slug === competitionSlug);
  if (!competition) notFound();

  const [months, { videos }] = await Promise.all([
    getMonthSummaries(competitionSlug, seasonSlug),
    getVideos({
      competition: competitionSlug,
      season: seasonSlug,
      month,
      contentType: showFullMatches ? contentType : "highlight",
    }),
  ]);

  const seasonLabel = seasonSlug.replace("-", "/");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <PageHeader
        eyebrow={`${competition.name} · ${interpolate(t.browse.season, { label: seasonLabel })}`}
        title={formatMonthLabel(month, locale)}
      />

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside>
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">{t.browse.months}</h2>
          <SeasonMonthNav
            competitionSlug={competitionSlug}
            seasonSlug={seasonSlug}
            months={months}
            activeMonth={month}
            locale={locale}
            t={t}
          />
        </aside>

        <section>
          {videos.length === 0 ? (
            <EmptyState message={t.browse.emptyMonth} />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {videos.map((video) => (
                <VideoCard key={video.id} video={video} locale={locale} t={t} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
