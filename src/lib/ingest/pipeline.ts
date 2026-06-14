import { classifyVideo } from "@/lib/ingest/classifier";
import { fetchYouTubeDurations, meetsMinimumDuration } from "@/lib/ingest/duration";
import { fetchYouTubeUploads } from "@/lib/ingest/adapters/youtube";
import { fifaAdapter } from "@/lib/ingest/adapters/fifa";
import { uefaAdapter } from "@/lib/ingest/adapters/uefa";
import { genericAdapter } from "@/lib/ingest/adapters/generic";
import type { SourceAdapter } from "@/lib/ingest/adapters/types";
import { resolveVideoMetadata } from "@/lib/ingest/season-resolver";
import { createServiceClient } from "@/lib/supabase/server";
import type { Competition, Season, Source, RawVideo } from "@/lib/types";

const ADAPTERS: Record<string, SourceAdapter> = {
  fifa: fifaAdapter,
  uefa: uefaAdapter,
  generic: genericAdapter,
};

export interface IngestResult {
  processed: number;
  inserted: number;
  skipped: number;
  skippedExisting: number;
  errors: string[];
}

interface IngestedVideoIndex {
  bySource: Map<string, Set<string>>;
  youtubeExternalIds: Set<string>;
}

async function loadIngestedVideoIndex(): Promise<IngestedVideoIndex> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("videos")
    .select("source_id, external_id, embed_type");

  if (error) throw error;

  const bySource = new Map<string, Set<string>>();
  const youtubeExternalIds = new Set<string>();

  for (const row of data ?? []) {
    if (!bySource.has(row.source_id)) {
      bySource.set(row.source_id, new Set());
    }
    bySource.get(row.source_id)!.add(row.external_id);

    if (row.embed_type === "youtube") {
      youtubeExternalIds.add(row.external_id);
    }
  }

  return { bySource, youtubeExternalIds };
}

function isAlreadyIngested(
  sourceId: string,
  externalId: string,
  embedType: RawVideo["embedType"],
  index: IngestedVideoIndex,
): boolean {
  const forSource = index.bySource.get(sourceId);
  if (forSource?.has(externalId)) {
    return true;
  }

  if (embedType === "youtube" && index.youtubeExternalIds.has(externalId)) {
    return true;
  }

  return false;
}

async function loadReferenceData() {
  const supabase = createServiceClient();

  const [sourcesRes, competitionsRes, seasonsRes] = await Promise.all([
    supabase.from("sources").select("*").eq("is_active", true),
    supabase.from("competitions").select("*"),
    supabase.from("seasons").select("*"),
  ]);

  if (sourcesRes.error) throw sourcesRes.error;
  if (competitionsRes.error) throw competitionsRes.error;
  if (seasonsRes.error) throw seasonsRes.error;

  return {
    sources: sourcesRes.data as Source[],
    competitions: competitionsRes.data as Competition[],
    seasons: seasonsRes.data as Season[],
  };
}

async function insertVideo(
  sourceId: string,
  classified: ReturnType<typeof classifyVideo> & object,
  metadata: ReturnType<typeof resolveVideoMetadata>,
  index: IngestedVideoIndex,
) {
  const supabase = createServiceClient();

  const row = {
    source_id: sourceId,
    external_id: classified.externalId,
    title: classified.title,
    description: classified.description ?? null,
    thumbnail_url: classified.thumbnailUrl ?? null,
    source_url: classified.sourceUrl,
    embed_type: classified.embedType,
    embed_url: classified.embedUrl ?? null,
    content_type: classified.contentType,
    highlight_variant: classified.highlightVariant,
    competition_id: metadata.competitionId,
    season_id: metadata.seasonId,
    match_date: metadata.matchDate,
    published_at: classified.publishedAt,
    home_team: metadata.homeTeam,
    away_team: metadata.awayTeam,
    calendar_month: metadata.calendarMonth,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("videos").insert(row);

  if (error) {
    if (error.code === "23505") {
      return "existing" as const;
    }
    throw error;
  }

  if (!index.bySource.has(sourceId)) {
    index.bySource.set(sourceId, new Set());
  }
  index.bySource.get(sourceId)!.add(classified.externalId);
  if (classified.embedType === "youtube") {
    index.youtubeExternalIds.add(classified.externalId);
  }

  return "inserted" as const;
}

const WORLD_CUP_SOURCE_SLUGS = new Set(["fox-sports", "fifa", "fifa-website"]);
const UPLOADS_FETCH_LIMIT = 50;
const WORLD_CUP_UPLOADS_FETCH_LIMIT = 150;

async function processSource(
  source: Source,
  competitions: Competition[],
  seasons: Season[],
  apiKey: string | undefined,
  index: IngestedVideoIndex,
  result: IngestResult,
) {
  let rawVideos: RawVideo[] = [];

  try {
    if (source.source_type === "youtube" && source.youtube_channel_id) {
      if (!apiKey) {
        result.errors.push(`YouTube API key missing for ${source.name}`);
        return;
      }
      const fetchLimit = WORLD_CUP_SOURCE_SLUGS.has(source.slug)
        ? WORLD_CUP_UPLOADS_FETCH_LIMIT
        : UPLOADS_FETCH_LIMIT;
      rawVideos = await fetchYouTubeUploads(source.youtube_channel_id, apiKey, fetchLimit);
    } else if (source.source_type === "website" && source.website_list_url) {
      const adapter = ADAPTERS[source.scraper_key ?? "generic"] ?? genericAdapter;
      rawVideos = await adapter.fetchRecent(source.website_list_url);
    }
  } catch (err) {
    result.errors.push(`${source.name}: ${err instanceof Error ? err.message : String(err)}`);
    return;
  }

  const classifiedVideos: Array<{
    classified: ReturnType<typeof classifyVideo> & object;
    metadata: ReturnType<typeof resolveVideoMetadata>;
  }> = [];

  for (const raw of rawVideos) {
    result.processed++;

    if (isAlreadyIngested(source.id, raw.externalId, raw.embedType, index)) {
      result.skippedExisting++;
      continue;
    }

    const classified = classifyVideo(raw);
    if (!classified) {
      result.skipped++;
      continue;
    }

    classifiedVideos.push({
      classified,
      metadata: resolveVideoMetadata({
        title: classified.title,
        publishedAt: classified.publishedAt,
        sourceSlug: source.slug,
        competitions,
        seasons,
      }),
    });
  }

  let durationMap = new Map<string, number>();
  if (apiKey) {
    const youtubeIds = classifiedVideos
      .filter(({ classified }) => classified.embedType === "youtube")
      .map(({ classified }) => classified.externalId);

    try {
      durationMap = await fetchYouTubeDurations(youtubeIds, apiKey);
    } catch (err) {
      result.errors.push(
        `${source.name} durations: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  for (const { classified, metadata } of classifiedVideos) {
    if (classified.embedType === "youtube") {
      const durationSeconds = durationMap.get(classified.externalId);
      if (!meetsMinimumDuration(durationSeconds)) {
        result.skipped++;
        continue;
      }
    }

    try {
      const outcome = await insertVideo(source.id, classified, metadata, index);
      if (outcome === "existing") {
        result.skippedExisting++;
      } else {
        result.inserted++;
      }
    } catch (err) {
      result.errors.push(`${source.name}/${classified.externalId}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
}

export async function runIngestion(): Promise<IngestResult> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const [{ sources, competitions, seasons }, index] = await Promise.all([
    loadReferenceData(),
    loadIngestedVideoIndex(),
  ]);

  const result: IngestResult = {
    processed: 0,
    inserted: 0,
    skipped: 0,
    skippedExisting: 0,
    errors: [],
  };

  for (const source of sources) {
    await processSource(source, competitions, seasons, apiKey, index, result);
  }

  return result;
}

export function normalizeExternalId(externalId: string, embedType: string): string {
  if (embedType === "youtube") return externalId;
  return externalId;
}
