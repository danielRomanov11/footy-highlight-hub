import { cache } from "react";
import { cookies } from "next/headers";
import { defaultLocale, isLocale, type Locale } from "./config";
import en, { type Messages } from "./messages/en";
import ru from "./messages/ru";

const dictionaries: Record<Locale, Messages> = { en, ru };

export const getLocale = cache(async (): Promise<Locale> => {
  const cookieStore = await cookies();
  const value = cookieStore.get("locale")?.value;
  if (value && isLocale(value)) return value;
  return defaultLocale;
});

export const getTranslations = cache(async () => {
  const locale = await getLocale();
  return { locale, t: dictionaries[locale] };
});

export function getDictionary(locale: Locale): Messages {
  return dictionaries[locale];
}

export type { Locale, Messages };
export { defaultLocale, isLocale, localeLabels, locales } from "./config";
export { formatMonthLabel, formatRelativeTime, formatSeasonCounts, interpolate } from "./format";
