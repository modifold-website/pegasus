import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import ProjectAnalyticsSettingsPage from "@/components/project/settings/ProjectAnalyticsSettingsPage";
import { getProjectBasePath } from "@/utils/projectRoutes";

const ALLOWED_TIME_RANGES = new Set(["7d", "30d", "90d"]);

const getNormalizedTimeRange = (value) => {
    const timeRange = Array.isArray(value) ? value[0] : value;
    return ALLOWED_TIME_RANGES.has(timeRange) ? timeRange : "7d";
};

async function fetchProjectAnalytics(slug, authToken, timeRange) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/projects/${slug}/analytics?time_range=${timeRange}`, {
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${authToken}`,
        },
        cache: "no-store",
    });

    return response;
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const resolvedLocale = await getLocale();
    const tProject = await getTranslations({ locale: resolvedLocale, namespace: "ProjectPage" });
    const tSettings = await getTranslations({ locale: resolvedLocale, namespace: "SettingsProjectPage" });

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/projects/${slug}`, {
        headers: { Accept: "application/json" },
    });

    if(!res.ok) {
        return { title: tProject("metadata.notFound") };
    }

    const project = await res.json();
    return { title: tSettings("analytics.metadataTitle", { title: project.title }) };
}

export default async function Page({ params, searchParams }) {
    const { slug } = await params;
    const resolvedSearchParams = await searchParams;
    const requestedTimeRange = Array.isArray(resolvedSearchParams?.time_range) ? resolvedSearchParams.time_range[0] : resolvedSearchParams?.time_range;
    const timeRange = getNormalizedTimeRange(resolvedSearchParams?.time_range);
    const resolvedLocale = await getLocale();
    const tNotFound = await getTranslations({ locale: resolvedLocale, namespace: "NotFound" });
    const cookieStore = await cookies();
    const authToken = cookieStore.get("authToken")?.value;

    if(!authToken) {
        redirect("/");
    }

    const [projectResponse, analyticsResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_BASE}/projects/${slug}`, {
            headers: {
                Accept: "application/json",
                Authorization: authToken ? `Bearer ${authToken}` : undefined,
            },
            cache: "no-store",
        }),
        fetchProjectAnalytics(slug, authToken, timeRange),
    ]);

    if(!projectResponse.ok || !analyticsResponse.ok) {
        return (
            <div className="layout">
                <div className="view">
                    <div className="not-found-page__dummy">{tNotFound("message")}</div>
                </div>
            </div>
        );
    }

    const project = await projectResponse.json();
    const analytics = await analyticsResponse.json();
    const basePath = getProjectBasePath(project.project_type);

    if(requestedTimeRange === "7d") {
        redirect(`${basePath}/${slug}/settings/analytics`);
    }

    return (
        <ProjectAnalyticsSettingsPage
            project={project}
            analytics={analytics}
            selectedTimeRange={timeRange}
        />
    );
}
