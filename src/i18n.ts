import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./locales/en/translation.json";
import es from "./locales/es/translation.json";
import pt from "./locales/pt/translation.json";
import fr from "./locales/fr/translation.json";
import ru from "./locales/ru/translation.json";
import uk from "./locales/uk/translation.json";
import zh from "./locales/zh/translation.json";

// Adding another language later is just dropping in another
// `locales/<lng>/translation.json`, registering it in `resources` below,
// and adding it to LANGUAGES in languages.ts - no other code changes needed.
void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
      pt: { translation: pt },
      fr: { translation: fr },
      ru: { translation: ru },
      uk: { translation: uk },
      zh: { translation: zh },
    },
    fallbackLng: "en",
    // Only base language codes are registered above - without this, a
    // browser reporting "en-US" would detect as "en-US" and silently miss
    // the "en" resources (falling back to raw keys instead of English text).
    supportedLngs: ["en", "es", "pt", "fr", "ru", "uk", "zh"],
    nonExplicitSupportedLngs: true,
    interpolation: {
      escapeValue: false, // React already escapes interpolated values.
    },
    detection: {
      // Same storage key convention as the rest of the app's local
      // preferences (see filterStorage.ts / auth.ts) - explicit choice
      // wins, then fall back to the browser's own language.
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "fightcalendar.language",
      caches: ["localStorage"],
    },
  });

export default i18n;
