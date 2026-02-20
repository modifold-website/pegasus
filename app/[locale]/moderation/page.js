import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import ModerationPage from "../../../components/pages/ModerationPage";
import axios from "axios";

export async function generateMetadata({ params }) {
    const { locale } = await params;
    const resolvedLocale = ["ru", "en", "es", "pt", "uk", "tr"].includes(locale) ? locale : "en";
    const t = await getTranslations({ locale: resolvedLocale, namespace: "ModerationPage" });

    return {
        title: t("metadata.title"),
    };
}

async function fetchProjects(authToken) {
    try {
        const params = {
            search: "",
            type: undefined,
            sort: "oldest",
            page: 1,
            limit: 20,
        };

        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/moderation`, {
            headers: { Authorization: `Bearer ${authToken}` },
            params,
        });

        return {
            projects: response.data.projects,
            totalPages: response.data.totalPages,
        };
    } catch (err) {
        console.error("Error fetching projects for moderation:", err);
        return { projects: [], totalPages: 1 };
    }
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

export default async function ModerationServer() {
    const cookieStore = await cookies();
    const authToken = cookieStore.get("authToken")?.value;

    if(!authToken) {
        redirect("/");
    }

    const { projects, totalPages } = await fetchProjects(authToken);
    const analytics = await fetchAnalytics(authToken);

    return <ModerationPage authToken={authToken} initialProjects={projects} initialTotalPages={totalPages} initialAnalytics={analytics} />;
}