import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import ModerationPage from "@/components/pages/ModerationPage";
import axios from "axios";

export async function generateMetadata() {
    const resolvedLocale = await getLocale();
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

export default async function ModerationServer() {
    const cookieStore = await cookies();
    const authToken = cookieStore.get("authToken")?.value;

    if(!authToken) {
        redirect("/");
    }

    const { projects, totalPages } = await fetchProjects(authToken);
    return <ModerationPage authToken={authToken} initialProjects={projects} initialTotalPages={totalPages} />;
}