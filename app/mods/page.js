import { getLocale, getTranslations } from "next-intl/server";
import BrowsePage from "@/components/pages/BrowsePage";

export async function generateMetadata() {
    const resolvedLocale = await getLocale();
    const t = await getTranslations({ locale: resolvedLocale, namespace: "pageTitle" });

    return {
        title: t("mods"),
    };
}

export default function ResourcePacksPage() {
    return <BrowsePage projectType="mod" />;
}