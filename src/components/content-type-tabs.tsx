"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useI18n } from "@/components/i18n-provider";
import { cn } from "@/lib/utils";

interface ContentTypeTabsProps {
  showFullMatches?: boolean;
}

export function ContentTypeTabs({ showFullMatches = false }: ContentTypeTabsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useI18n();
  const current = searchParams.get("type") ?? "highlight";

  function buildHref(type: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (type === "highlight") {
      params.delete("type");
    } else {
      params.set("type", type);
    }
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  const tabs = [
    { id: "highlight", label: t.filters.highlights },
    { id: "full_match", label: t.filters.fullMatches, disabled: !showFullMatches },
  ];

  return (
    <div className="flex gap-2">
      {tabs.map((tab) => (
        <Link
          key={tab.id}
          href={tab.disabled ? "#" : buildHref(tab.id)}
          aria-disabled={tab.disabled}
          className={cn(
            "cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-200",
            current === tab.id
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground",
            tab.disabled && "pointer-events-none opacity-40",
          )}
        >
          {tab.label}
          {tab.disabled && tab.id === "full_match" && (
            <span className="ml-1 text-xs">{t.filters.soon}</span>
          )}
        </Link>
      ))}
    </div>
  );
}
