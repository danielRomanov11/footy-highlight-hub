import { createServiceClient } from "@/lib/supabase/server";
import { runIngestion, type IngestResult } from "@/lib/ingest/pipeline";

const DEFAULT_INTERVAL_HOURS = 0;

function getIngestIntervalHours(): number {
  const raw = process.env.INGEST_INTERVAL_HOURS;
  if (raw === undefined || raw === "") return DEFAULT_INTERVAL_HOURS;

  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return DEFAULT_INTERVAL_HOURS;
  }

  return parsed;
}

function getIngestIntervalParam(): string {
  const intervalHours = getIngestIntervalHours();
  if (intervalHours <= 0) return "0 seconds";
  return `${intervalHours} hours`;
}

export type ScheduledIngestSkipReason = "not_due" | "in_progress";

interface StartIngestionOptions {
  force?: boolean;
}

export async function tryStartScheduledIngestion(
  options: StartIngestionOptions = {},
): Promise<{ shouldRun: true } | { shouldRun: false; reason: ScheduledIngestSkipReason }> {
  const supabase = createServiceClient();
  const intervalHours = getIngestIntervalHours();
  const intervalParam = getIngestIntervalParam();

  const { data: acquired, error } = await supabase.rpc("try_acquire_ingest_lock", {
    p_interval: intervalParam,
    p_force: options.force ?? false,
  });

  if (error) throw error;
  if (acquired) return { shouldRun: true };

  const { data: state, error: stateError } = await supabase
    .from("ingest_state")
    .select("last_run_at, last_run_started_at")
    .eq("id", 1)
    .single();

  if (stateError) throw stateError;

  const thresholdMs = intervalHours * 60 * 60 * 1000;
  const lastRunAt = state.last_run_at ? new Date(state.last_run_at).getTime() : 0;
  const recentlyCompleted = intervalHours > 0 && lastRunAt > 0 && Date.now() - lastRunAt < thresholdMs;

  if (recentlyCompleted) {
    return { shouldRun: false, reason: "not_due" };
  }

  return { shouldRun: false, reason: "in_progress" };
}

async function completeScheduledIngestion(status: "success" | "error", error?: string) {
  const supabase = createServiceClient();
  const { error: rpcError } = await supabase.rpc("complete_ingest_run", {
    p_status: status,
    p_error: error ?? null,
  });

  if (rpcError) throw rpcError;
}

export async function runScheduledIngestion(): Promise<IngestResult> {
  try {
    const result = await runIngestion();
    await completeScheduledIngestion("success");
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ingestion failed";
    await completeScheduledIngestion("error", message);
    throw error;
  }
}
