import { getTranslations } from "next-intl/server";
import SettingsAPIPage from "../../../../components/pages/SettingsAPIPage";

export async function generateMetadata({ params }) {
    const { locale } = await params;
    const resolvedLocale = ["ru", "en", "es", "pt", "uk", "tr"].includes(locale) ? locale : "en";
    const t = await getTranslations({ locale: resolvedLocale, namespace: "SettingsAPIPage" });

    return {
        title: t("metadata.title"),
    };
}

export default async function Page() {
    return <SettingsAPIPage />;
}