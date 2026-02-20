import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async ({ locale }) => {
    const supportedLocales = ["ru", "en", "es", "pt", "uk", "tr"];
    const validLocale = supportedLocales.includes(locale) ? locale : "en";
    
    return {
        locale: validLocale,
        messages: (await import(`../i18n/messages/${validLocale}.json`)).default,
    };
});