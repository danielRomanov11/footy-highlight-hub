"use client";

import { useTransition } from "react";
import { localeLabels, locales, type Locale } from "@/lib/i18n/config";
import { setLocale } from "@/lib/i18n/actions";
import { useI18n } from "@/components/i18n-provider";
import { cn } from "@/lib/utils";

export function LocaleSwitcher() {
  const { locale, t } = useI18n();
  const [pending, startTransition] = useTransition();

  function handleChange(next: Locale) {
    if (next === locale) return;
    startTransition(async () => {
      await setLocale(next);
    });
  }

  return (
    <div
      className="flex items-center rounded-lg border border-border/60 bg-background/40 p-0.5"
      role="group"
      aria-label={t.locale.switch}
    >
      {locales.map((code) => {
        const isActive = locale === code;

        return (
          <button
            key={code}
            type="button"
            disabled={pending}
            aria-pressed={isActive}
            aria-label={localeLabels[code]}
            onClick={() => handleChange(code)}
            className={cn(
              "cursor-pointer rounded-md px-2 py-1 text-xs font-medium transition-colors duration-200",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
              pending && "opacity-70",
            )}
          >
            {code.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
