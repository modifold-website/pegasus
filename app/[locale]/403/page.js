import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }) {
    const { locale } = await params;
    const resolvedLocale = ["ru", "en", "es", "pt", "uk", "tr"].includes(locale) ? locale : "en";
    const t = await getTranslations({ locale: resolvedLocale, namespace: "AccessDenied" });

    return {
        title: t("metadata.title"),
    };
}

export default async function Page({ params }) {
    const { locale } = await params;
    const resolvedLocale = ["ru", "en", "es", "pt", "uk", "tr"].includes(locale) ? locale : "en";
    const t = await getTranslations({ locale: resolvedLocale, namespace: "AccessDenied" });

    return (
        <div className="layout">
            <div className="view">
                <div className="not-found-page__dummy">{t("message")}</div>
            </div>
        </div>
    );
}