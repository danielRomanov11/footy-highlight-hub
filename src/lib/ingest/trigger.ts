import { after } from "next/server";
import { runScheduledIngestion, tryStartScheduledIngestion } from "@/lib/ingest/scheduler";

export type TriggerResult =
  | { started: true }
  | { started: false; reason: "not_due" | "in_progress" | "unavailable" };

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
