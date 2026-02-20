import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
    const cookieStore = await cookies();
    const locale = cookieStore.get("NEXT_LOCALE")?.value;
    const resolvedLocale = ["ru", "en", "es", "pt", "uk", "tr"].includes(locale) ? locale : "en";
    const t = await getTranslations({ locale: resolvedLocale, namespace: "NotFound" });

    return (
        <div className="layout">
            <div className="view">
                <div className="not-found-page__dummy">{t("message")}</div>
            </div>
        </div>
    );
}