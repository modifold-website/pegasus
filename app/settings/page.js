import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import SettingsBlogPage from "@/components/pages/SettingsBlogPage";

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

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/auth/user`, {
            headers: {
                Authorization: `Bearer ${authToken}`,
                Accept: "application/json",
            },
            cache: "no-store",
        });

        if(response.status === 401 || response.status === 403) {
            redirect("/403");
        }

        if(response.ok) {
            const data = await response.json().catch(() => ({}));
            if(data?.success && data?.user) {
                initialUser = data.user;
            }
        }
    } catch (error) {
        console.error("Failed to preload user settings:", error);
    }

    if(!initialUser) {
        redirect("/403");
    }

    return <SettingsBlogPage initialUser={initialUser} />;
}