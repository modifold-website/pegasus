import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import VerificationModerationPage from "@/components/pages/VerificationModerationPage";
import axios from "axios";

export async function generateMetadata() {
    const resolvedLocale = await getLocale();
    const t = await getTranslations({ locale: resolvedLocale, namespace: "VerificationModerationPage" });

    return {
        title: t("metadata.title"),
    };
}

async function fetchVerificationRequests(authToken) {
    try {
        const params = { status: "pending", page: 1, limit: 15 };
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/moderation/verification`, {
            headers: { Authorization: `Bearer ${authToken}` },
            params,
        });

        return {
            requests: response.data.requests,
            totalPages: response.data.totalPages,
        };
    } catch (err) {
        console.error("Error fetching verification requests for moderation:", err);
        return { requests: [], totalPages: 1 };
    }
}

export default async function VerificationModerationServer() {
    const cookieStore = await cookies();
    const authToken = cookieStore.get("authToken")?.value;

    if(!authToken) {
        redirect("/");
    }

    const { requests, totalPages } = await fetchVerificationRequests(authToken);

    return <VerificationModerationPage authToken={authToken} initialRequests={requests} initialTotalPages={totalPages} />;
}