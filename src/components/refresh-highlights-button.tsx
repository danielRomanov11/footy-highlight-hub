"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/i18n-provider";
import { interpolate } from "@/lib/i18n/format";
import { cn } from "@/lib/utils";

type RefreshState = "idle" | "loading" | "success" | "error" | "in_progress";

export function RefreshHighlightsButton() {
  const router = useRouter();
  const { t } = useI18n();
  const [state, setState] = useState<RefreshState>("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleRefresh() {
    if (state === "loading") return;

    setState("loading");
    setMessage(null);

    try {
      const response = await fetch("/api/ingest/refresh", { method: "POST" });
      const data = (await response.json()) as {
        ok?: boolean;
        reason?: string;
        message?: string;
        inserted?: number;
      };

      if (response.status === 409 || data.reason === "in_progress") {
        setState("in_progress");
        setMessage(t.home.refreshInProgress);
        return;
      }

      if (!response.ok || !data.ok) {
        setState("error");
        setMessage(data.message ?? t.home.refreshError);
        return;
      }

      router.refresh();
      setState("success");
      setMessage(
        data.inserted && data.inserted > 0
          ? interpolate(t.home.refreshSuccessNew, { count: String(data.inserted) })
          : t.home.refreshSuccess,
      );

      window.setTimeout(() => {
        setState("idle");
        setMessage(null);
      }, 4000);
    } catch {
      setState("error");
      setMessage(t.home.refreshError);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2 sm:items-end">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleRefresh}
        disabled={state === "loading"}
        aria-busy={state === "loading"}
      >
        <RefreshCw className={cn(state === "loading" && "animate-spin")} />
        {state === "loading" ? t.home.refreshing : t.home.refresh}
      </Button>
      {message && (
        <p
          className={cn(
            "text-xs",
            state === "error" ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {message}
        </p>
      )}
    </div>
  );
}
