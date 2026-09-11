import { enUS, es, fr, ptBR, ru, uk, zhCN } from "date-fns/locale";
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
};

export function getDateLocale(language: string): Locale {
  // The detector can report a region-tagged code like "en-US" - fall back
  // to the base language before giving up, so e.g. a "ru-RU" browser still
  // gets Russian date formatting instead of silently staying English.
  return DATE_LOCALES[language] ?? DATE_LOCALES[language.split("-")[0]] ?? enUS;
}
