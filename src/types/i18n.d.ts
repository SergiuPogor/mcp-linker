// src/types/i18n.d.ts
import "i18next";
import { TranslationSchema } from "@/i18n/schema";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation";
    resources: {
      translation: TranslationSchema;
    };
  }
}
