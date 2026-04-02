import { cookies } from "next/headers";
import { redirect } from "next/navigation";
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
    const cookieStore = await cookies();
    const authToken = cookieStore.get("authToken")?.value;

    if(!authToken) {
        redirect("/403");
    }

    let initialUser = null;
    let initialVerification = null;

    try {
        const [userResponse, verificationResponse] = await Promise.all([
            fetch(`${process.env.NEXT_PUBLIC_API_BASE}/auth/user`, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    Accept: "application/json",
                },
                cache: "no-store",
            }),
            fetch(`${process.env.NEXT_PUBLIC_API_BASE}/verification/me`, {
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

        if(verificationResponse.ok) {
            const data = await verificationResponse.json().catch(() => ({}));
            initialVerification = {
                isVerified: data?.isVerified === 1,
                request: data?.request || null,
            };
        }
    } catch (error) {
        console.error("Failed to preload verification settings:", error);
    }

    if(!initialUser) {
        redirect("/403");
    }

    return <SettingsVerificationPage initialUser={initialUser} initialVerification={initialVerification} />;
}