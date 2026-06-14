import * as cheerio from "cheerio";
import type { SourceAdapter } from "@/lib/ingest/adapters/types";
import { fetchHtml, normalizeToRawVideo } from "@/lib/ingest/adapters/utils";
import type { RawVideo } from "@/lib/types";

export const uefaAdapter: SourceAdapter = {
  key: "uefa",
  async fetchRecent(listUrl) {
    const html = await fetchHtml(listUrl);
    const $ = cheerio.load(html);
    const results: RawVideo[] = [];

    $("article a, .video-card a, a[href*='/video/'], a[href*='watch?v=']").each((_, el) => {
      const href = $(el).attr("href");
      if (!href) return;

      const title =
        $(el).find("h2, h3, .title, [class*='title']").first().text().trim() ||
        $(el).attr("aria-label") ||
        $(el).text().trim();

      if (!title || title.length < 5) return;

      const sourceUrl = href.startsWith("http") ? href : `https://www.uefa.com${href}`;
      const img = $(el).find("img").attr("src") ?? $(el).find("img").attr("data-src");
      const externalId = Buffer.from(sourceUrl).toString("base64url").slice(0, 32);

      results.push(
        normalizeToRawVideo({
          externalId,
          title,
          sourceUrl,
          thumbnailUrl: img ?? undefined,
          publishedAt: new Date().toISOString(),
          embedType: sourceUrl.includes("uefa.tv") ? "link_only" : undefined,
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
