import { ar, enUS, es, fr, ptBR, ru, uk, zhCN } from "date-fns/locale";
import { format } from "date-fns";
import type { Locale } from "date-fns";

// Single lookup point so adding another date-fns locale is a one-line
// addition here, instead of a hunt through every format() call site.
const DATE_LOCALES: Record<string, Locale> = {
  en: enUS,
  es,
  fr,
  pt: ptBR,
  ru,
  uk,
  zh: zhCN,
  ar,
};

export function getDateLocale(language: string): Locale {
  // The detector can report a region-tagged code like "en-US" - fall back
  // to the base language before giving up, so e.g. a "ru-RU" browser still
  // gets Russian date formatting instead of silently staying English.
  return DATE_LOCALES[language] ?? DATE_LOCALES[language.split("-")[0]] ?? enUS;
}

// Jan 2, 2000 was a Sunday - only used to walk through the 7 weekdays.
// Most locales give a genuinely short "EEEEEE" form (e.g. "Su", "вс"), but
// some (Arabic's date-fns data, notably) don't define one and return the
// full weekday name instead, which overflows the narrow weekday headers -
// fall back to the single-letter "EEEEE" form when that happens.
export function getWeekdayLabels(locale: Locale): string[] {
  const short = Array.from({ length: 7 }, (_, d) => format(new Date(2000, 0, 2 + d), "EEEEEE", { locale }));
  if (short.some((label) => label.length > 3)) {
    return Array.from({ length: 7 }, (_, d) => format(new Date(2000, 0, 2 + d), "EEEEE", { locale }));
  }
  return short;
}
