import type { Competition, Season, SeasonFormat } from "@/lib/types";

const COMPETITION_KEYWORDS: Array<{ slug: string; patterns: RegExp[] }> = [
  { slug: "champions-league", patterns: [/champions league/i, /\bucl\b/i] },
  { slug: "europa-league", patterns: [/europa league/i, /\buel\b/i] },
  { slug: "premier-league", patterns: [/premier league/i, /\bepl\b/i] },
  { slug: "laliga", patterns: [/laliga/i, /la liga/i] },
  { slug: "bundesliga", patterns: [/bundesliga/i] },
  { slug: "serie-a", patterns: [/serie a/i] },
  { slug: "ligue-1", patterns: [/ligue 1/i, /ligue un/i] },
  { slug: "mls", patterns: [/\bmls\b/i, /major league soccer/i] },
  { slug: "world-cup", patterns: [/world cup/i, /\bfifa\b/i] },
  { slug: "euro", patterns: [/euro 20\d{2}/i, /european championship/i] },
];

const SOURCE_COMPETITION_MAP: Record<string, string> = {
  fifa: "world-cup",
  uefa: "champions-league",
  "fox-soccer": "international",
  "fox-sports": "world-cup",
  "premier-league": "premier-league",
  laliga: "laliga",
  bundesliga: "bundesliga",
  "serie-a": "serie-a",
  "ligue-1": "ligue-1",
  mls: "mls",
};

export function parseTeamsFromTitle(title: string): { homeTeam: string | null; awayTeam: string | null } {
  const vsMatch = title.match(/(.+?)\s+(?:vs\.?|v)\s+(.+?)(?:\s*[|\-–:]|$)/i);
  if (vsMatch) {
    return {
      homeTeam: vsMatch[1].trim().replace(/^.*\|\s*/, ""),
      awayTeam: vsMatch[2].trim().replace(/\s*(highlights?|extended).*$/i, ""),
    };
  }
  return { homeTeam: null, awayTeam: null };
}

export function inferCompetitionSlug(title: string, sourceSlug?: string): string | null {
  for (const { slug, patterns } of COMPETITION_KEYWORDS) {
    if (patterns.some((p) => p.test(title))) {
      return slug;
    }
  }

  if (sourceSlug && SOURCE_COMPETITION_MAP[sourceSlug]) {
    return SOURCE_COMPETITION_MAP[sourceSlug];
  }

  return null;
}

export function deriveSeasonLabel(
  date: Date,
  seasonFormat: SeasonFormat,
): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  if (seasonFormat === "calendar_year") {
    return String(year);
  }

  if (month >= 8) {
    return `${year}/${String(year + 1).slice(-2)}`;
  }

  return `${year - 1}/${String(year).slice(-2)}`;
}

export function getSeasonDateRange(label: string, seasonFormat: SeasonFormat): { start: string; end: string } {
  if (seasonFormat === "calendar_year") {
    const year = parseInt(label, 10);
    return {
      start: `${year}-01-01`,
      end: `${year}-12-31`,
    };
  }

  const [startYear] = label.split("/");
  const y = parseInt(startYear, 10);
  return {
    start: `${y}-08-01`,
    end: `${y + 1}-05-31`,
  };
}

export function toCalendarMonth(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function resolveSeason(
  competitions: Competition[],
  seasons: Season[],
  competitionSlug: string | null,
  matchDate: Date,
): { competitionId: string | null; seasonId: string | null } {
  if (!competitionSlug) {
    return { competitionId: null, seasonId: null };
  }

  const competition = competitions.find((c) => c.slug === competitionSlug);
  if (!competition) {
    return { competitionId: null, seasonId: null };
  }

  const label = deriveSeasonLabel(matchDate, competition.season_format);
  const season = seasons.find(
    (s) => s.competition_id === competition.id && s.label === label,
  );

  return {
    competitionId: competition.id,
    seasonId: season?.id ?? null,
  };
}

export interface SeasonResolverInput {
  title: string;
  publishedAt: string;
  sourceSlug?: string;
  competitions: Competition[];
  seasons: Season[];
}

export function resolveVideoMetadata(input: SeasonResolverInput) {
  const publishedDate = new Date(input.publishedAt);
  const competitionSlug = inferCompetitionSlug(input.title, input.sourceSlug);
  const { homeTeam, awayTeam } = parseTeamsFromTitle(input.title);
  const matchDate = publishedDate;
  const { competitionId, seasonId } = resolveSeason(
    input.competitions,
    input.seasons,
    competitionSlug,
    matchDate,
  );

  return {
    competitionId,
    seasonId,
    matchDate: matchDate.toISOString().slice(0, 10),
    calendarMonth: toCalendarMonth(matchDate),
    homeTeam,
    awayTeam,
  };
}
