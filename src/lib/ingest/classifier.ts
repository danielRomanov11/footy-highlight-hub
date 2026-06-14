import type { ClassifiedVideo, ContentType, HighlightVariant, RawVideo } from "@/lib/types";

const HIGHLIGHT_PATTERNS = [
  /\bhighlights?\b/i,
  /\bextended highlights?\b/i,
  /\bmatch highlights?\b/i,
  /\bofficial highlights?\b/i,
  /\|\s*highlights?\b/i,
  /\bhighlights?\s*\|/i,
  /\bresumen\b/i,
  /\brésumé\b/i,
  /\bresumo\b/i,
  /\bzusammenfassung\b/i,
  /\btutti i gol\b/i,
  /\btodos os gols\b/i,
  /\balle tore\b/i,
];

const FULL_MATCH_PATTERNS = [
  /\bfull match\b/i,
  /\bfull replay\b/i,
  /\bmatch replay\b/i,
  /\b90 minutes\b/i,
  /\bentire match\b/i,
  /\bfull game\b/i,
];

const EXCLUDE_PATTERNS = [
  /\bpreview\b/i,
  /\bpress conference\b/i,
  /\binterview\b/i,
  /\bpodcast\b/i,
  /\btraining\b/i,
  /\bbehind the scenes\b/i,
  /\bdraw ceremony\b/i,
  /\bgroup stage draw\b/i,
  /\breaction\b/i,
  /\binstant reaction\b/i,
  /\breacts?\s+to\b/i,
  /\bhighlights package\b/i,
  /\btop \d+ goals\b/i,
  /\bbest goals\b/i,
  /\bevery goal\b/i,
  /\bevery premier league\b/i,
  /\blive stream\b/i,
  /\b24\/7\b/i,
  /\bfestival\b/i,
  /\bfunniest\b/i,
  /\bfunnies\b/i,
  /\bhow many\b/i,
  /\bcan you name\b/i,
  /\bdo you think\b/i,
  /\bquiz\b/i,
  /\bstory\b/i,
  /\b#shorts\b/i,
  /\bshorts\b/i,
  /\bsponsored\b/i,
  /\bzillow\b/i,
];

export function shouldExclude(title: string): boolean {
  return EXCLUDE_PATTERNS.some((pattern) => pattern.test(title));
}

export function classifyVideo(raw: RawVideo): ClassifiedVideo | null {
  if (shouldExclude(raw.title)) {
    return null;
  }

  const isFullMatch = FULL_MATCH_PATTERNS.some((pattern) => pattern.test(raw.title));
  const isHighlight = HIGHLIGHT_PATTERNS.some((pattern) => pattern.test(raw.title));

  if (!isFullMatch && !isHighlight) {
    return null;
  }

  let contentType: ContentType = isFullMatch ? "full_match" : "highlight";
  let highlightVariant: HighlightVariant | null = null;

  if (contentType === "highlight") {
    highlightVariant = /\bextended\b/i.test(raw.title) ? "extended" : "standard";
  }

  if (isFullMatch && isHighlight) {
    contentType = /\bfull\b/i.test(raw.title) ? "full_match" : "highlight";
    highlightVariant = contentType === "highlight"
      ? /\bextended\b/i.test(raw.title) ? "extended" : "standard"
      : null;
  }

  return {
    ...raw,
    contentType,
    highlightVariant,
  };
}
