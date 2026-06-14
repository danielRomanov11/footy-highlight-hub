import { after, NextRequest, NextResponse } from "next/server";
import { verifyIngestSecret } from "@/lib/ingest/auth";
import { runScheduledIngestion, tryStartScheduledIngestion } from "@/lib/ingest/scheduler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const authError = verifyIngestSecret(request);
  if (authError) return authError;

  try {
    const decision = await tryStartScheduledIngestion();
    if (!decision.shouldRun) {
      return NextResponse.json({ ok: true, skipped: true, reason: decision.reason });
    }

    after(async () => {
      try {
        await runScheduledIngestion();
      } catch {
        // Status is persisted in ingest_state by runScheduledIngestion.
      }
    });

    return NextResponse.json({ ok: true, started: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Scheduler failed" },
      { status: 500 },
    );
  }
}
