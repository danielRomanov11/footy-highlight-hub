import type { RawVideo } from "@/lib/types";

const YOUTUBE_API = "https://www.googleapis.com/youtube/v3";

interface PlaylistItem {
  snippet: {
    title: string;
    description: string;
    publishedAt: string;
    thumbnails: { high?: { url: string }; medium?: { url: string } };
    resourceId: { videoId: string };
  };
}

interface PlaylistResponse {
  items?: PlaylistItem[];
  nextPageToken?: string;
}

interface ChannelResponse {
  items?: Array<{
    contentDetails: {
      relatedPlaylists: { uploads: string };
    };
  }>;
}

async function resolveUploadsPlaylistId(
  channelId: string,
  apiKey: string,
): Promise<string> {
  const url = new URL(`${YOUTUBE_API}/channels`);
  url.searchParams.set("part", "contentDetails");
  url.searchParams.set("id", channelId);
  url.searchParams.set("key", apiKey);

  const response = await fetch(url.toString());
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`YouTube channels.list error: ${response.status} ${body}`);
  }

  const data = (await response.json()) as ChannelResponse;
  const uploads = data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

  if (!uploads) {
    throw new Error(`No uploads playlist found for channel ${channelId}`);
  }

  return uploads;
}

function mapPlaylistItem(item: PlaylistItem): RawVideo {
  const videoId = item.snippet.resourceId.videoId;
  const thumb =
    item.snippet.thumbnails.high?.url ??
    item.snippet.thumbnails.medium?.url;

  return {
    externalId: videoId,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnailUrl: thumb,
    sourceUrl: `https://www.youtube.com/watch?v=${videoId}`,
    embedType: "youtube",
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
    publishedAt: item.snippet.publishedAt,
  };
}

export async function fetchYouTubeUploads(
  channelId: string,
  apiKey: string,
  maxResults = 50,
): Promise<RawVideo[]> {
  const playlistId = await resolveUploadsPlaylistId(channelId, apiKey);
  const videos: RawVideo[] = [];
  let pageToken: string | undefined;

  while (videos.length < maxResults) {
    const batchSize = Math.min(50, maxResults - videos.length);
    const url = new URL(`${YOUTUBE_API}/playlistItems`);
    url.searchParams.set("part", "snippet");
    url.searchParams.set("playlistId", playlistId);
    url.searchParams.set("maxResults", String(batchSize));
    url.searchParams.set("key", apiKey);
    if (pageToken) {
      url.searchParams.set("pageToken", pageToken);
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`YouTube playlistItems error: ${response.status} ${body}`);
    }

    const data = (await response.json()) as PlaylistResponse;
    const items = data.items ?? [];

    for (const item of items) {
      videos.push(mapPlaylistItem(item));
    }

    pageToken = data.nextPageToken;
    if (!pageToken || items.length === 0) {
      break;
    }
  }

  return videos;
}
