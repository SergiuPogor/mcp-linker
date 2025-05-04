// src/i18n.ts
import type { InitOptions } from "i18next";
import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import en from "./resources/en";
import ja from "./resources/ja";
import zh from "./resources/zh";

i18n
  .use(LanguageDetector) // Detects user language
  .use(initReactI18next) // Passes i18n to React
  .init<InitOptions>({
    resources: {
      en,
      zh,
      ja,
    },
    lng: "en", // Force English as default language
    fallbackLng: "en", // Default language if detection fails
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

export default i18n;
