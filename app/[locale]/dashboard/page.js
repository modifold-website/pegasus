import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import DashboardClient from "../../../components/pages/DashboardClient";

export async function generateMetadata({ params }) {
    const { locale } = await params;
    const resolvedLocale = ["ru", "en", "es", "pt", "uk", "tr"].includes(locale) ? locale : "en";
    const t = await getTranslations({ locale: resolvedLocale, namespace: "DashboardClient" });

    return {
        title: t("metadata.title"),
        description: t("metadata.description"),
        openGraph: {
            title: t("metadata.title"),
            description: t("metadata.description"),
            url: "https://modifold.com/dashboard",
        },
    };
}

export default async function DashboardPage() {
    const cookieStore = await cookies();
    const authToken = cookieStore.get("authToken")?.value;

    if(!authToken) {
        redirect("/");
    }

    const initialPage = 1;
    const limit = 20;
    let projects = [];
    let totalPages = 1;

    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/projects/user/projects?page=${initialPage}&limit=${limit}`, {
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${authToken}`,
            },
        });

        if(res.ok) {
            const data = await res.json();
            projects = data.projects || [];
            totalPages = data.totalPages || 1;
        }
    } catch (err) {
        console.error("Error fetching user projects:", err);
    }

    return <DashboardClient initialProjects={projects} initialTotalPages={totalPages} initialPage={initialPage} authToken={authToken} />;
}