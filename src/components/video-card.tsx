import { memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SourceBadge } from "@/components/source-badge";
import { formatRelativeTime } from "@/lib/i18n/format";
import type { Locale } from "@/lib/i18n/config";
import type { Messages } from "@/lib/i18n/messages/en";
import type { Video } from "@/lib/types";

interface VideoCardProps {
  video: Video;
  locale: Locale;
  t: Messages;
  priority?: boolean;
}

export const VideoCard = memo(function VideoCard({
  video,
  locale,
  t,
  priority = false,
}: VideoCardProps) {
  const teams =
    video.home_team && video.away_team
      ? `${video.home_team} vs ${video.away_team}`
      : null;

  return (
    <Link href={`/watch/${video.id}`} className="group block cursor-pointer">
      <Card className="overflow-hidden border-border/60 bg-card/80 transition-colors duration-200 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10">
        <div className="relative aspect-video overflow-hidden bg-muted">
          {video.thumbnail_url ? (
            <>
              <Image
                src={video.thumbnail_url}
                alt={video.title}
                fill
                priority={priority}
                className="object-cover motion-safe:transition-transform motion-safe:duration-300 group-hover:scale-[1.03]"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-200 group-hover:bg-black/30">
                <span className="flex h-12 w-12 scale-90 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 shadow-lg shadow-primary/30 transition-all duration-200 group-hover:scale-100 group-hover:opacity-100">
                  <Play className="h-5 w-5 fill-current pl-0.5" aria-hidden />
                </span>
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              {t.video.noThumbnail}
            </div>
          )}
          {video.highlight_variant === "extended" && (
            <Badge className="absolute left-2 top-2 bg-primary/90">{t.video.extended}</Badge>
          )}
          {video.content_type === "full_match" && (
            <Badge className="absolute left-2 top-2 bg-amber-600">{t.video.fullMatch}</Badge>
          )}
        </div>
        <CardContent className="space-y-2 p-4">
          <h3 className="line-clamp-2 text-sm font-medium leading-snug transition-colors duration-200 group-hover:text-primary">
            {video.title}
          </h3>
          {teams && (
            <p className="line-clamp-1 text-xs text-muted-foreground">{teams}</p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            {video.sources?.name && <SourceBadge name={video.sources.name} />}
            {video.competitions?.name && (
              <Badge variant="outline" className="text-xs font-normal">
                {video.competitions.name}
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(video.published_at, locale, t.time)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
});
