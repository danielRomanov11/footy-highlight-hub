import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { VideoPlayer } from "@/components/video-player";
import { cn } from "@/lib/utils";
import { hasSupabaseConfig } from "@/lib/env";
import { getTranslations } from "@/lib/i18n";
import { formatMonthLabel, formatRelativeTime, interpolate } from "@/lib/i18n/format";
import { getVideoById } from "@/lib/videos";

export const dynamic = "force-dynamic";

interface WatchPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: WatchPageProps) {
  if (!hasSupabaseConfig()) {
    const { t } = await getTranslations();
    return { title: t.nav.watch };
  }

  try {
    const { id } = await params;
    const video = await getVideoById(id);
    return {
      title: video.title,
      description: video.description ?? video.title,
      openGraph: {
        images: video.thumbnail_url ? [{ url: video.thumbnail_url }] : [],
      },
    };
  } catch {
    const { t } = await getTranslations();
    return { title: t.nav.watch };
  }
}

export default async function WatchPage({ params }: WatchPageProps) {
  if (!hasSupabaseConfig()) notFound();

  const { id } = await params;
  const { locale, t } = await getTranslations();

  let video;
  try {
    video = await getVideoById(id);
  } catch {
    notFound();
  }

  const teams =
    video.home_team && video.away_team
      ? `${video.home_team} vs ${video.away_team}`
      : null;

  const sourceName = video.sources?.name ?? t.watch.officialSite;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <VideoPlayer video={video} t={t} />

      <div className="mt-8 space-y-5 rounded-2xl border border-border/60 bg-card/50 p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          {video.highlight_variant === "extended" && <Badge>{t.watch.extended}</Badge>}
          {video.content_type === "full_match" && (
            <Badge variant="secondary">{t.watch.fullMatch}</Badge>
          )}
          {video.competitions?.name && <Badge variant="outline">{video.competitions.name}</Badge>}
          {video.seasons?.label && <Badge variant="outline">{video.seasons.label}</Badge>}
        </div>

        <h1 className="text-2xl font-bold sm:text-3xl">{video.title}</h1>

        {teams && <p className="text-lg text-muted-foreground">{teams}</p>}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span>{video.sources?.name}</span>
          <span>{formatRelativeTime(video.published_at, locale, t.time)}</span>
          {video.calendar_month && (
            <span>{formatMonthLabel(video.calendar_month, locale)}</span>
          )}
        </div>

        {video.description && (
          <p className="line-clamp-4 text-sm leading-relaxed text-muted-foreground">
            {video.description}
          </p>
        )}

        <div className="flex flex-wrap gap-3 pt-2">
          <a
            href={video.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: "default" }), "cursor-pointer gap-2")}
          >
            {interpolate(t.watch.watchOn, { source: sourceName })}
            <ExternalLink className="h-4 w-4" aria-hidden />
          </a>
          {video.competitions?.slug && video.seasons?.label && (
            <Link
              href={`/browse/${video.competitions.slug}/${video.seasons.label.replace("/", "-")}`}
              className={cn(buttonVariants({ variant: "outline" }), "cursor-pointer")}
            >
              {t.watch.browseSeason}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
