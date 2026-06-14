import { NextRequest, NextResponse } from "next/server";
import { getVideoById } from "@/lib/videos";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const video = await getVideoById(id);
    return NextResponse.json(video);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Video not found" },
      { status: 404 },
    );
  }
}
