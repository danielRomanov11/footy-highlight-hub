import { NextResponse } from "next/server";
import { runManualIngestRefresh } from "@/lib/ingest/trigger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST() {
  const result = await runManualIngestRefresh();

  if (!result.ok) {
    if (result.reason === "in_progress") {
      return NextResponse.json(
        { ok: false, reason: result.reason, message: "An update is already running." },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        ok: false,
        reason: result.reason,
        message: result.message ?? "Could not refresh highlights.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, ...result.result });
}
