// src/i18n.ts
import i18n from "i18next";
import type { InitOptions } from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./resources/en";
import zh from "./resources/zh";
import es from "./resources/es";
import ja from "./resources/ja";

i18n
  .use(LanguageDetector) // Detects user language
  .use(initReactI18next) // Passes i18n to React
  .init<InitOptions>({
    resources: {
      en: en,
      zh: zh,
      es: es,
      ja: ja,
    },
    lng: "en", // Force English as default language
    fallbackLng: "en", // Default language if detection fails
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

export default i18n;
