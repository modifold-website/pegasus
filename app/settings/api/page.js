import { cookies } from "next/headers";
import { redirect } from "next/navigation";
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
    const cookieStore = await cookies();
    const authToken = cookieStore.get("authToken")?.value;

    if(!authToken) {
        redirect("/403");
    }

    let initialUser = null;
    let initialTokens = null;

    try {
        const [userResponse, tokensResponse] = await Promise.all([
            fetch(`${process.env.NEXT_PUBLIC_API_BASE}/auth/user`, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    Accept: "application/json",
                },
                cache: "no-store",
            }),
            fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api-tokens`, {
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

        if(tokensResponse.ok) {
            const data = await tokensResponse.json().catch(() => ({}));
            initialTokens = data?.tokens || [];
        }
    } catch (error) {
        console.error("Failed to preload API tokens:", error);
    }

    if(!initialUser) {
        redirect("/403");
    }

    return <SettingsAPIPage initialUser={initialUser} initialTokens={initialTokens} authToken={authToken} />;
}