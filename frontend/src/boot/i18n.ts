import { defineBoot } from "#q-app";
import { createI18n } from "vue-i18n";

import messages from "@/i18n";

export type MessageSchema = (typeof messages)["es"];

declare module "vue-i18n" {
  export interface DefineLocaleMessage extends MessageSchema {}
}

export default defineBoot(({ app }) => {
  const i18n = createI18n({
    legacy: false,
    locale: "es",
    fallbackLocale: "es",
    messages,
    numberFormats: {
      es: {
        currency: {
          style: "currency",
          currency: "BRL",
          currencyDisplay: "symbol"
        },
        decimal: {
          style: "decimal",
          maximumFractionDigits: 2
        }
      }
    }
  });

  app.use(i18n);
});
