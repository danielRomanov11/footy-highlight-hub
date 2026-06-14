import { NextResponse } from "next/server";
import { triggerScheduledIngestIfDue } from "@/lib/ingest/trigger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const result = await triggerScheduledIngestIfDue();

  if (result.started) {
    return NextResponse.json({ ok: true, started: true });
  }

  return NextResponse.json({ ok: true, skipped: true, reason: result.reason });
}
