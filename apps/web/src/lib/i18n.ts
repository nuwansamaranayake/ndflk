export const locales = ["en", "si"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";
export function isLocale(x: string | undefined): x is Locale {
  return !!x && (locales as readonly string[]).includes(x);
}
export const localeNames: Record<Locale, string> = { en: "English", si: "සිංහල" };
export const htmlLang: Record<Locale, string> = { en: "en", si: "si-LK" };
