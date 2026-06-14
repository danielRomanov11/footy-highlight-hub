export type SourceType = "youtube" | "website";
export type EmbedType = "youtube" | "iframe" | "link_only";
export type ContentType = "highlight" | "full_match";
export type HighlightVariant = "standard" | "extended";
export type SeasonFormat = "academic_year" | "calendar_year";

export interface Source {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  source_type: SourceType;
  youtube_channel_id: string | null;
  website_list_url: string | null;
  scraper_key: string | null;
  is_active: boolean;
}

export interface Competition {
  id: string;
  name: string;
  slug: string;
  country: string | null;
  logo_url: string | null;
  season_format: SeasonFormat;
}

export interface Season {
  id: string;
  competition_id: string;
  label: string;
  start_date: string;
  end_date: string;
}

export interface Video {
  id: string;
  source_id: string;
  external_id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  source_url: string;
  embed_type: EmbedType;
  embed_url: string | null;
  content_type: ContentType;
  highlight_variant: HighlightVariant | null;
  competition_id: string | null;
  season_id: string | null;
  match_date: string | null;
  published_at: string;
  home_team: string | null;
  away_team: string | null;
  calendar_month: string | null;
  sources?: Pick<Source, "name" | "slug">;
  competitions?: Pick<Competition, "name" | "slug"> | null;
  seasons?: Pick<Season, "label"> | null;
}

export interface RawVideo {
  externalId: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  sourceUrl: string;
  embedType: EmbedType;
  embedUrl?: string;
  publishedAt: string;
}

export interface ClassifiedVideo extends RawVideo {
  contentType: ContentType;
  highlightVariant: HighlightVariant | null;
}

export interface ResolvedVideo extends ClassifiedVideo {
  competitionId: string | null;
  seasonId: string | null;
  matchDate: string | null;
  calendarMonth: string | null;
  homeTeam: string | null;
  awayTeam: string | null;
}

export interface MonthSummary {
  month: string;
  highlightCount: number;
  fullMatchCount: number;
}
