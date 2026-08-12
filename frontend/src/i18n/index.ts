import en from "./en";
import es from "./es";
import ptBR from "./pt-BR";

export type AppLocale = "en" | "es" | "pt-BR";

type WidenMessageValues<Value> = Value extends string
  ? string
  : Value extends Record<string, unknown>
    ? { [Key in keyof Value]: WidenMessageValues<Value[Key]> }
    : Value;

export type MessageSchema = WidenMessageValues<typeof es>;

const messages = { en, es, "pt-BR": ptBR } satisfies Record<
  AppLocale,
  MessageSchema
>;

export default messages;
