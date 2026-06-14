import { NextResponse } from "next/server";
import { triggerScheduledIngestIfDue } from "@/lib/ingest/trigger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handleVisitTrigger() {
  const result = await triggerScheduledIngestIfDue();

  if (result.started) {
    return NextResponse.json({ ok: true, started: true });
  }

  return NextResponse.json({ ok: true, skipped: true, reason: result.reason });
}

export async function POST() {
  return handleVisitTrigger();
}

// Backwards-compatible alias
export { POST as GET };
