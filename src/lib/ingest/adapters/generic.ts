import * as cheerio from "cheerio";
import type { SourceAdapter } from "@/lib/ingest/adapters/types";
import { extractYouTubeId, fetchHtml, normalizeToRawVideo } from "@/lib/ingest/adapters/utils";
import type { RawVideo } from "@/lib/types";

export const genericAdapter: SourceAdapter = {
  key: "generic",
  async fetchRecent(listUrl) {
    const html = await fetchHtml(listUrl);
    const $ = cheerio.load(html);
    const results: RawVideo[] = [];

    $("a[href]").each((_, el) => {
      const href = $(el).attr("href");
      if (!href) return;

      const ytId = extractYouTubeId(href);
      if (!ytId) return;

      const title = $(el).text().trim() || $(el).attr("title") || "Untitled video";
      if (title.length < 5) return;

      results.push(
        normalizeToRawVideo({
          externalId: ytId,
          title,
          sourceUrl: href.startsWith("http") ? href : `https://www.youtube.com/watch?v=${ytId}`,
          publishedAt: new Date().toISOString(),
        }),
      );
    });

    $("iframe[src*='youtube']").each((_, el) => {
      const src = $(el).attr("src");
      if (!src) return;
      const ytId = extractYouTubeId(src);
      if (!ytId) return;

      results.push(
        normalizeToRawVideo({
          externalId: ytId,
          title: $(el).attr("title") || "Embedded video",
          sourceUrl: `https://www.youtube.com/watch?v=${ytId}`,
          publishedAt: new Date().toISOString(),
        }),
      );
    });

    const seen = new Set<string>();
    return results.filter((v) => {
      if (seen.has(v.externalId)) return false;
      seen.add(v.externalId);
      return true;
    }).slice(0, 20);
  },
};
