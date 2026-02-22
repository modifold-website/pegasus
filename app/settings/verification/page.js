import { getLocale, getTranslations } from "next-intl/server";
import SettingsVerificationPage from "@/components/pages/SettingsVerificationPage";

export async function generateMetadata() {
    const resolvedLocale = await getLocale();
    const t = await getTranslations({ locale: resolvedLocale, namespace: "SettingsVerificationPage" });

    return {
        title: t("metadata.title"),
    };
}

export default async function Page() {
    return <SettingsVerificationPage />;
}