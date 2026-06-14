import { after } from "next/server";
import {
  runScheduledIngestion,
  tryStartScheduledIngestion,
  type ScheduledIngestSkipReason,
} from "@/lib/ingest/scheduler";
import type { IngestResult as PipelineResult } from "@/lib/ingest/pipeline";

export type TriggerResult =
  | { started: true }
  | { started: false; reason: "not_due" | "in_progress" | "unavailable" };

export type RefreshResult =
  | { ok: true; result: PipelineResult }
  | { ok: false; reason: ScheduledIngestSkipReason | "unavailable"; message?: string };

export async function triggerScheduledIngestIfDue(): Promise<TriggerResult> {
  try {
    const decision = await tryStartScheduledIngestion();
    if (!decision.shouldRun) {
      return { started: false, reason: decision.reason };
    }

    after(async () => {
      try {
        await runScheduledIngestion();
      } catch {
        // Status is persisted in ingest_state by runScheduledIngestion.
      }
    });

    return { started: true };
  } catch {
    return { started: false, reason: "unavailable" };
  }
}

export async function runManualIngestRefresh(): Promise<RefreshResult> {
  try {
    const decision = await tryStartScheduledIngestion({ force: true });
    if (!decision.shouldRun) {
      return { ok: false, reason: decision.reason };
    }

    const result = await runScheduledIngestion();
    return { ok: true, result };
  } catch (error) {
    return {
      ok: false,
      reason: "unavailable",
      message: error instanceof Error ? error.message : "Ingestion failed",
    };
  }
}
