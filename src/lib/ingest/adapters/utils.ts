import type { RawVideo } from "@/lib/types";

const USER_AGENT =
  "FootyHighlightHub/1.0 (+https://github.com/danielRomanov11/footy-highlight-hub)";

export async function fetchHtml(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "text/html" },
      signal: controller.signal,
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} for ${url}`);
    }

    return response.text();
  } finally {
    clearTimeout(timeout);
  }
}

export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

export function normalizeToRawVideo(input: {
  externalId: string;
  title: string;
  sourceUrl: string;
  publishedAt: string;
  thumbnailUrl?: string;
  description?: string;
  embedUrl?: string;
  embedType?: RawVideo["embedType"];
}): RawVideo {
  const ytId = extractYouTubeId(input.sourceUrl) ?? extractYouTubeId(input.embedUrl ?? "");

  if (ytId) {
    return {
      externalId: ytId,
      title: input.title,
      description: input.description,
      thumbnailUrl: input.thumbnailUrl ?? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`,
      sourceUrl: `https://www.youtube.com/watch?v=${ytId}`,
      embedType: "youtube",
      embedUrl: `https://www.youtube.com/embed/${ytId}`,
      publishedAt: input.publishedAt,
    };
  }

  return {
    externalId: input.externalId,
    title: input.title,
    description: input.description,
    thumbnailUrl: input.thumbnailUrl,
    sourceUrl: input.sourceUrl,
    embedType: input.embedType ?? (input.embedUrl ? "iframe" : "link_only"),
    embedUrl: input.embedUrl,
    publishedAt: input.publishedAt,
  };
}
