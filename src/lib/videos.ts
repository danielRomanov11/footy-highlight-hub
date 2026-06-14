import { cache } from "react";
import { createAnonServerClient } from "@/lib/supabase/server";
import type { ContentType, Video } from "@/lib/types";

const PAGE_SIZE = 24;

export interface VideoQueryParams {
  contentType?: ContentType;
  competition?: string;
  season?: string;
  month?: string;
  source?: string;
  q?: string;
  page?: number;
  extendedOnly?: boolean;
}

const getSupabase = cache(() => createAnonServerClient());

const resolveCompetitionId = cache(async (slug: string) => {
  const { data } = await getSupabase()
    .from("competitions")
    .select("id")
    .eq("slug", slug)
    .single();
  return data?.id ?? null;
});

const resolveSeasonId = cache(async (competitionId: string, seasonLabel: string) => {
  const normalized = seasonLabel.replace("-", "/");
  const { data } = await getSupabase()
    .from("seasons")
    .select("id")
    .eq("competition_id", competitionId)
    .eq("label", normalized)
    .single();
  return data?.id ?? null;
});

const resolveSourceId = cache(async (slug: string) => {
  const { data } = await getSupabase().from("sources").select("id").eq("slug", slug).single();
  return data?.id ?? null;
});

export async function getVideos(params: VideoQueryParams = {}) {
  const supabase = getSupabase();
  const page = params.page ?? 1;
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("videos")
    .select(
      "*, sources(name, slug), competitions(name, slug), seasons(label)",
      { count: "exact" },
    )
    .order("published_at", { ascending: false })
    .range(from, to);

  if (params.contentType) {
    query = query.eq("content_type", params.contentType);
  }

  if (params.extendedOnly) {
    query = query.eq("highlight_variant", "extended");
  }

  let competitionId: string | null = null;

  if (params.competition) {
    competitionId = await resolveCompetitionId(params.competition);
    if (competitionId) {
      query = query.eq("competition_id", competitionId);
    }
  }

  if (params.season && competitionId) {
    const seasonId = await resolveSeasonId(competitionId, params.season);
    if (seasonId) {
      query = query.eq("season_id", seasonId);
    }
  }

  if (params.month) {
    query = query.eq("calendar_month", params.month);
  }

  if (params.source) {
    const sourceId = await resolveSourceId(params.source);
    if (sourceId) {
      query = query.eq("source_id", sourceId);
    }
  }

  if (params.q) {
    query = query.ilike("title", `%${params.q}%`);
  }

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    videos: (data ?? []) as Video[],
    total: count ?? 0,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil((count ?? 0) / PAGE_SIZE),
  };
}

export const getVideoById = cache(async (id: string) => {
  const { data, error } = await getSupabase()
    .from("videos")
    .select("*, sources(name, slug), competitions(name, slug), seasons(label)")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as Video;
});

export const getCompetitions = cache(async () => {
  const { data, error } = await getSupabase()
    .from("competitions")
    .select("*, seasons(*)")
    .order("name");

  if (error) throw error;
  return data;
});

export const getSources = cache(async () => {
  const { data, error } = await getSupabase()
    .from("sources")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (error) throw error;
  return data;
});

export async function getMonthSummaries(competitionSlug: string, seasonLabel: string) {
  const competitionId = await resolveCompetitionId(competitionSlug);
  if (!competitionId) return [];

  const seasonId = await resolveSeasonId(competitionId, seasonLabel);
  if (!seasonId) return [];

  const { data, error } = await getSupabase()
    .from("videos")
    .select("calendar_month, content_type")
    .eq("competition_id", competitionId)
    .eq("season_id", seasonId)
    .not("calendar_month", "is", null);

  if (error) throw error;

  const map = new Map<string, { highlightCount: number; fullMatchCount: number }>();

  for (const row of data ?? []) {
    const month = row.calendar_month as string;
    const entry = map.get(month) ?? { highlightCount: 0, fullMatchCount: 0 };
    if (row.content_type === "full_match") {
      entry.fullMatchCount++;
    } else {
      entry.highlightCount++;
    }
    map.set(month, entry);
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([month, counts]) => ({ month, ...counts }));
}
