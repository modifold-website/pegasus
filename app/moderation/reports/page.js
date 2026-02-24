import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import axios from "axios";
import ReportsModerationPage from "@/components/pages/ReportsModerationPage";

export async function generateMetadata() {
    const resolvedLocale = await getLocale();
    const t = await getTranslations({ locale: resolvedLocale, namespace: "ReportsModerationPage" });

    return {
        title: t("metadata.title"),
    };
}

async function fetchReports(authToken) {
    try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/moderation/reports`, {
            headers: { Authorization: `Bearer ${authToken}` },
            params: {
                page: 1,
                limit: 20,
                status: "open",
                reason: "all",
                sort: "newest",
                search: "",
            },
        });

        return {
            reports: response.data.reports || [],
            totalPages: response.data.totalPages || 1,
        };
    } catch (error) {
        console.error("Error fetching reports for moderation:", error);
        return { reports: [], totalPages: 1 };
    }
}

export default async function ReportsModerationServer() {
    const cookieStore = await cookies();
    const authToken = cookieStore.get("authToken")?.value;

    if(!authToken) {
        redirect("/");
    }

    const { reports, totalPages } = await fetchReports(authToken);

    return <ReportsModerationPage authToken={authToken} initialReports={reports} initialTotalPages={totalPages} />;
}