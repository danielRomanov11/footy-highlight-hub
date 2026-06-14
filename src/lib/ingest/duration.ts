const YOUTUBE_API = "https://www.googleapis.com/youtube/v3";

/** Minimum video length to ingest (2 minutes). */
export const MIN_DURATION_SECONDS = 120;

/** Parse YouTube ISO 8601 duration (e.g. PT2M30S) to seconds. */
export function parseIso8601Duration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1] ?? "0", 10);
  const minutes = parseInt(match[2] ?? "0", 10);
  const seconds = parseInt(match[3] ?? "0", 10);

  return hours * 3600 + minutes * 60 + seconds;
}

export function meetsMinimumDuration(durationSeconds: number | undefined): boolean {
  if (durationSeconds === undefined) {
    return false;
  }
  return durationSeconds >= MIN_DURATION_SECONDS;
}

interface VideosListResponse {
  items?: Array<{
    id: string;
    contentDetails: { duration: string };
  }>;
}

export async function fetchYouTubeDurations(
  videoIds: string[],
  apiKey: string,
): Promise<Map<string, number>> {
  const durations = new Map<string, number>();
  if (videoIds.length === 0) return durations;

  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50);
    const url = new URL(`${YOUTUBE_API}/videos`);
    url.searchParams.set("part", "contentDetails");
    url.searchParams.set("id", batch.join(","));
    url.searchParams.set("key", apiKey);

    const response = await fetch(url.toString());
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`YouTube videos.list error: ${response.status} ${body}`);
    }

    const data = (await response.json()) as VideosListResponse;
    for (const item of data.items ?? []) {
      durations.set(item.id, parseIso8601Duration(item.contentDetails.duration));
    }
  }

  return durations;
}
