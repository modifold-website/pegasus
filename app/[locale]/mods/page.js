import { getTranslations } from "next-intl/server";
import BrowsePage from "../../../components/pages/BrowsePage";

export async function generateMetadata({ params }) {
    const { locale } = await params;
    const resolvedLocale = ["ru", "en", "es", "pt", "uk", "tr"].includes(locale) ? locale : "en";
    const t = await getTranslations({ locale: resolvedLocale, namespace: "pageTitle" });

    return {
        title: t("mods"),
    };
}

export default function ResourcePacksPage() {
    return <BrowsePage projectType="mod" />;
}
