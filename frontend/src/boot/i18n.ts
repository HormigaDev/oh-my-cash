import { defineBoot } from "#q-app";
import { createI18n } from "vue-i18n";

import messages, { type AppLocale, type MessageSchema } from "@/i18n";

declare module "vue-i18n" {
  export interface DefineLocaleMessage extends MessageSchema {}
}

export default defineBoot(({ app }) => {
  const i18n = createI18n<MessageSchema, AppLocale, false>({
    legacy: false,
    locale: "es",
    fallbackLocale: "es",
    messages,
    numberFormats: {
      en: {
        decimal: { style: "decimal", maximumFractionDigits: 2 }
      },
      es: {
        decimal: {
          style: "decimal",
          maximumFractionDigits: 2
        }
      },
      "pt-BR": {
        decimal: { style: "decimal", maximumFractionDigits: 2 }
      }
    }
  });

  app.use(i18n);
});
