"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function IngestOnVisit() {
  const pathname = usePathname();

  useEffect(() => {
    void fetch("/api/ingest/run-on-visit", {
      method: "POST",
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}
