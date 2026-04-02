import { cookies } from "next/headers";
import { redirect } from "next/navigation";
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

    if(!authToken) {
        redirect("/403");
    }

    let initialUser = null;
    let initialTwoFactor = null;

    try {
        const [userResponse, twoFactorResponse] = await Promise.all([
            fetch(`${process.env.NEXT_PUBLIC_API_BASE}/auth/user`, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    Accept: "application/json",
                },
                cache: "no-store",
            }),
            fetch(`${process.env.NEXT_PUBLIC_API_BASE}/auth/2fa/status`, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    Accept: "application/json",
                },
                cache: "no-store",
            }),
        ]);

        if(userResponse.status === 401 || userResponse.status === 403) {
            redirect("/403");
        }

        if(userResponse.ok) {
            const data = await userResponse.json().catch(() => ({}));
            if(data?.success && data?.user) {
                initialUser = data.user;
            }
        }

        if(twoFactorResponse.ok) {
            const data = await twoFactorResponse.json().catch(() => ({}));
            initialTwoFactor = { enabled: Boolean(data?.enabled) };
        }
    } catch (error) {
        console.error("Failed to preload user settings:", error);
    }

    if(!initialUser) {
        redirect("/403");
    }

    return <SettingsAccountSecurityPage initialUser={initialUser} initialTwoFactor={initialTwoFactor} authToken={authToken} />;
}