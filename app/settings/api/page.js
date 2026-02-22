import { getLocale, getTranslations } from "next-intl/server";
import SettingsAPIPage from "@/components/pages/SettingsAPIPage";

export async function generateMetadata() {
    const resolvedLocale = await getLocale();
    const t = await getTranslations({ locale: resolvedLocale, namespace: "SettingsAPIPage" });

    return {
        title: t("metadata.title"),
    };
}

export default async function Page() {
    return <SettingsAPIPage />;
}