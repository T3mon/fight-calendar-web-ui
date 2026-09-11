// Native-script names, not translated per current UI language - the point
// of a language picker is that you can find your language regardless of
// what language is currently selected.
export const LANGUAGES: { code: string; nativeName: string }[] = [
  { code: "en", nativeName: "English" },
  { code: "es", nativeName: "Español" },
  { code: "pt", nativeName: "Português" },
  { code: "fr", nativeName: "Français" },
  { code: "ru", nativeName: "Русский" },
  { code: "uk", nativeName: "Українська" },
  { code: "zh", nativeName: "中文" },
];

// The detector can report a region-tagged code like "en-US" - normalize to
// the base code before matching against LANGUAGES above.
export function baseLanguageCode(language: string): string {
  return language.split("-")[0].toLowerCase();
}
