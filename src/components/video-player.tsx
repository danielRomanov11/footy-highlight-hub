import { ExternalLink } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { interpolate } from "@/lib/i18n/format";
import type { Messages } from "@/lib/i18n/messages/en";
import { cn } from "@/lib/utils";
import type { Video } from "@/lib/types";

interface VideoPlayerProps {
  video: Video;
  t: Messages;
}

export function VideoPlayer({ video, t }: VideoPlayerProps) {
  if (video.embed_type === "youtube" && video.embed_url) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border/60 bg-black">
        <iframe
          src={video.embed_url}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
    );
  }

  if (video.embed_type === "iframe" && video.embed_url) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border/60 bg-black">
        <iframe
          src={video.embed_url}
          title={video.title}
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
    );
  }

  const sourceName = video.sources?.name ?? t.watch.officialSite;

  return (
    <div className="flex aspect-video flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
      <p className="text-muted-foreground">{t.watch.externalMessage}</p>
      <a
        href={video.source_url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(buttonVariants(), "cursor-pointer gap-2")}
      >
        {interpolate(t.watch.watchOn, { source: sourceName })}
        <ExternalLink className="h-4 w-4" aria-hidden />
      </a>
    </div>
  );
}
