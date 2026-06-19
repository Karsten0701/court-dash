import { createI18n } from "vue-i18n";
import en from "./locales/en.js";
import nl from "./locales/nl.js";

export const SUPPORTED_LOCALES = ["en", "nl"];
const STORAGE_KEY = "courtDashLocale";
const DEFAULT_LOCALE = "en";

const getStoredLocale = () => {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return SUPPORTED_LOCALES.includes(stored) ? stored : DEFAULT_LOCALE;
};

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: getStoredLocale(),
  fallbackLocale: DEFAULT_LOCALE,
  messages: { en, nl },
});

const applyLocaleSideEffects = (locale) => {
  if (typeof document !== "undefined") {
    document.documentElement.lang = locale;
  }
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, locale);
  }
};

export const currentLocale = i18n.global.locale;

export const setLocale = (locale) => {
  const nextLocale = SUPPORTED_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE;
  i18n.global.locale.value = nextLocale;
  applyLocaleSideEffects(nextLocale);
};

export const t = (...args) => i18n.global.t(...args);

applyLocaleSideEffects(currentLocale.value);

export default i18n;
