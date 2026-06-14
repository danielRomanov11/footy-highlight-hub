import { NextResponse } from "next/server";
import { getCompetitions } from "@/lib/videos";

const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
};

export async function GET() {
  try {
    const competitions = await getCompetitions();
    return NextResponse.json(competitions, { headers: CACHE_HEADERS });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch competitions" },
      { status: 500 },
    );
  }
}
