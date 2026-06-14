import { NextRequest, NextResponse } from "next/server";
import { getVideos } from "@/lib/videos";
import type { ContentType } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const contentType = searchParams.get("content_type") as ContentType | null;

    const result = await getVideos({
      contentType: contentType ?? "highlight",
      competition: searchParams.get("competition") ?? undefined,
      season: searchParams.get("season") ?? undefined,
      month: searchParams.get("month") ?? undefined,
      source: searchParams.get("source") ?? undefined,
      q: searchParams.get("q") ?? undefined,
      page: Number(searchParams.get("page") ?? "1"),
      extendedOnly: searchParams.get("extended") === "true",
    });

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch videos" },
      { status: 500 },
    );
  }
}
