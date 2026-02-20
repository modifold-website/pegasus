import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import NotificationsPage from "../../../components/pages/NotificationsPage";

export async function generateMetadata({ params }) {
    const { locale } = await params;
    const resolvedLocale = ["ru", "en", "es", "pt", "uk", "tr"].includes(locale) ? locale : "en";
    const t = await getTranslations({ locale: resolvedLocale, namespace: "NotificationsPage" });

    return {
        title: `${t("title")} — Modifold`,
    };
}

export default async function Page() {
    const cookieStore = await cookies();
    const authToken = cookieStore.get("authToken")?.value;

    if(!authToken) {
        redirect("/403");
    }

    return <NotificationsPage authToken={authToken} />;
}