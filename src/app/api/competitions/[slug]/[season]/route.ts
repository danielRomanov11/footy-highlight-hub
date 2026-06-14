import { NextRequest, NextResponse } from "next/server";
import { getMonthSummaries, getVideos } from "@/lib/videos";
import type { ContentType } from "@/lib/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; season: string }> },
) {
  try {
    const { slug, season } = await params;
    const { searchParams } = request.nextUrl;
    const contentType = (searchParams.get("content_type") as ContentType) ?? "highlight";

    const summaries = await getMonthSummaries(slug, season);
    const result = await getVideos({
      competition: slug,
      season,
      contentType,
    });

    return NextResponse.json({ months: summaries, ...result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch competition data" },
      { status: 500 },
    );
  }
}
