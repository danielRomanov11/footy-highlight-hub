import { Suspense } from "react";
import { ContentTypeTabs } from "@/components/content-type-tabs";
import { EmptyState } from "@/components/empty-state";
import { FilterBar } from "@/components/filter-bar";
import { HomeHero } from "@/components/home-hero";
import { PageHeader } from "@/components/page-header";
import { VideoCard } from "@/components/video-card";
import { VideoGridSkeleton } from "@/components/video-grid-skeleton";
import { hasSupabaseConfig } from "@/lib/env";
import { getTranslations } from "@/lib/i18n";
import type { ContentType } from "@/lib/types";
import { getCompetitions, getSources, getVideos } from "@/lib/videos";

export const dynamic = "force-dynamic";

interface HomePageProps {
  searchParams: Promise<{
    type?: string;
    source?: string;
    competition?: string;
    extended?: string;
  }>;
}

async function HomeContent({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const { locale, t } = await getTranslations();

  if (!hasSupabaseConfig()) {
    return <EmptyState message={t.home.emptyConfig} />;
  }

  const contentType = (params.type as ContentType) ?? "highlight";
  const showFullMatches = process.env.NEXT_PUBLIC_ENABLE_FULL_MATCHES === "true";

  const [{ videos }, sources, competitions] = await Promise.all([
    getVideos({
      contentType: showFullMatches ? contentType : "highlight",
      source: params.source,
      competition: params.competition,
      extendedOnly: params.extended === "true",
    }),
    getSources(),
    getCompetitions(),
  ]);

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Suspense>
          <ContentTypeTabs showFullMatches={showFullMatches} />
        </Suspense>
        <Suspense>
          <FilterBar sources={sources} competitions={competitions} />
        </Suspense>
      </div>

      {videos.length === 0 ? (
        <EmptyState message={t.home.emptyVideos} />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video, index) => (
            <VideoCard
              key={video.id}
              video={video}
              locale={locale}
              t={t}
              priority={index < 3}
            />
          ))}
        </div>
      )}
    </>
  );
}

export default async function HomePage(props: HomePageProps) {
  const { t } = await getTranslations();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-10">
        <HomeHero />
      </div>

      <PageHeader
        eyebrow={t.home.eyebrow}
        title={t.home.title}
        description={t.home.description}
      />

      <Suspense fallback={<VideoGridSkeleton count={6} />}>
        <HomeContent {...props} />
      </Suspense>
    </div>
  );
}
