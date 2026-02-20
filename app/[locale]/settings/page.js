import { getTranslations } from "next-intl/server";
import SettingsBlogPage from "../../../components/pages/SettingsBlogPage";

export async function generateMetadata({ params }) {
    const { locale } = await params;
    const resolvedLocale = ["ru", "en", "es", "pt", "uk", "tr"].includes(locale) ? locale : "en";
    const t = await getTranslations({ locale: resolvedLocale, namespace: "SettingsBlogPage" });

    return {
        title: t("metadata.title"),
    };
}

export default async function Page() {
    return <SettingsBlogPage />;
}