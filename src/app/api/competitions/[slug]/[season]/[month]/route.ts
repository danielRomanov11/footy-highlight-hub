import { NextRequest, NextResponse } from "next/server";
import { getVideos } from "@/lib/videos";
import type { ContentType } from "@/lib/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; season: string; month: string }> },
) {
  try {
    const { slug, season, month } = await params;
    const { searchParams } = request.nextUrl;
    const contentType = (searchParams.get("content_type") as ContentType) ?? "highlight";

    const result = await getVideos({
      competition: slug,
      season,
      month,
      contentType,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch month videos" },
      { status: 500 },
    );
  }
}
