import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import StatisticsModerationPage from "@/components/pages/StatisticsModerationPage";
import axios from "axios";

export async function generateMetadata() {
    const resolvedLocale = await getLocale();
    const t = await getTranslations({ locale: resolvedLocale, namespace: "ModerationPage" });

    return {
        title: `${t("tabs.statistics")} — Modifold`,
    };
}

async function fetchAnalytics(authToken) {
    try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/moderation/analytics`, {
            headers: { Authorization: `Bearer ${authToken}` },
            params: { time_range: "30d" },
        });

        return response.data;
    } catch (err) {
        console.error("Error fetching analytics data:", err);

        return {
            approvedProjects: [],
            pendingProjects: [],
            userRegistrations: [],
            totalApproved: 0,
            totalPending: 0,
            totalUsers: 0,
        };
    }
}

export default async function StatisticsModerationServer() {
    const cookieStore = await cookies();
    const authToken = cookieStore.get("authToken")?.value;

    if(!authToken) {
        redirect("/");
    }

    const analytics = await fetchAnalytics(authToken);

    return <StatisticsModerationPage authToken={authToken} initialAnalytics={analytics} />;
}