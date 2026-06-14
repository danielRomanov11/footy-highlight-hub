"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const DEBOUNCE_MS = 30_000;

export function IngestOnVisit() {
  const pathname = usePathname();
  const lastTriggerAt = useRef(0);

  useEffect(() => {
    const now = Date.now();
    if (now - lastTriggerAt.current < DEBOUNCE_MS) return;
    lastTriggerAt.current = now;

    void fetch("/api/ingest/run-if-due", {
      method: "POST",
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}
