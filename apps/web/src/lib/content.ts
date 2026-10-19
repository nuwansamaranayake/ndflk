import "server-only";
import en from "@/content/en.json";
import si from "@/content/si.json";
import type { Locale } from "./i18n";

export type Content = typeof en;
const all: Record<Locale, Content> = { en, si: si as unknown as Content };
export function getContent(locale: Locale): Content {
  return all[locale] ?? en;
}
export { en as enContent };
