import Link from "next/link";
import { ExternalLink, Radio } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { hasSupabaseConfig } from "@/lib/env";
import { getTranslations } from "@/lib/i18n";
import { getSources } from "@/lib/videos";

export const dynamic = "force-dynamic";

export default async function SourcesPage() {
  const { t } = await getTranslations();

  if (!hasSupabaseConfig()) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <EmptyState message={t.sources.emptyConfig} />
      </div>
    );
  }

  const sources = await getSources();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <PageHeader
        eyebrow={t.sources.eyebrow}
        title={t.sources.title}
        description={t.sources.description}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sources.map((source) => (
          <article
            key={source.id}
            className="rounded-2xl border border-border/60 bg-card/80 p-6 transition-colors duration-200 hover:border-primary/30"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                <Radio className="h-5 w-5 text-primary" aria-hidden />
              </span>
              <Badge variant="outline" className="capitalize">
                {source.source_type}
              </Badge>
            </div>
            <h2 className="mt-4 text-lg font-semibold">{source.name}</h2>
            <div className="mt-5 flex flex-wrap gap-4">
              <Link
                href={`/?source=${source.slug}`}
                className="cursor-pointer text-sm font-medium text-primary transition-colors duration-200 hover:text-primary/80"
              >
                {t.sources.viewVideos}
              </Link>
              {(source.youtube_channel_id || source.website_list_url) && (
                <a
                  href={
                    source.youtube_channel_id
                      ? `https://www.youtube.com/channel/${source.youtube_channel_id}`
                      : (source.website_list_url ?? "#")
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex cursor-pointer items-center text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                >
                  {t.sources.officialPage}
                  <ExternalLink className="ml-1 h-3 w-3" aria-hidden />
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
