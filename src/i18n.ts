import { getRequestConfig } from "next-intl/server";

export const locales = [
  "fr", "en", "es", "de", "it", "pt", "nl", "ru", "zh-CN", "ja", "ko",
  "ar", "hi", "tr", "pl", "sv", "da", "fi", "no", "el", "he",
  "th", "vi", "id", "cs", "hu", "ro"
] as const;

export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "fr";

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = (await requestLocale) || defaultLocale;
  if (!locales.includes(locale as Locale)) {
    return { locale: defaultLocale, messages: (await import(`../messages/${defaultLocale}.json`)).default };
  }
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
