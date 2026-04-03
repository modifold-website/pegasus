import { cookies } from "next/headers";
import { getLocale, getTranslations } from "next-intl/server";
import SettingsAccountSecurityPage from "@/components/pages/SettingsAccountSecurityPage";

export async function generateMetadata() {
    const resolvedLocale = await getLocale();
    const t = await getTranslations({ locale: resolvedLocale, namespace: "SettingsBlogPage" });

    return {
        title: t("metadata.title"),
    };
}

export default async function Page() {
    const cookieStore = await cookies();
    const authToken = cookieStore.get("authToken")?.value;

    let initialTwoFactor = null;

    try {
        const twoFactorResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/auth/2fa/status`, {
            headers: {
                Authorization: `Bearer ${authToken}`,
                Accept: "application/json",
            },
            cache: "no-store",
        });

        if(twoFactorResponse.ok) {
            const data = await twoFactorResponse.json().catch(() => ({}));
            initialTwoFactor = { enabled: Boolean(data?.enabled) };
        }
    } catch (error) {
        console.error("Failed to preload user settings:", error);
    }

    return <SettingsAccountSecurityPage initialTwoFactor={initialTwoFactor} authToken={authToken} />;
}