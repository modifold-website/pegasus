import { cookies } from "next/headers";
import { getLocale, getTranslations } from "next-intl/server";
import IssuesSettings from "@/components/project/settings/IssuesSettings";

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
    return { title: tSettings("metadata.title", { title: project.title }) };
}

export default async function Page({ params }) {
    const { slug } = await params;
    const resolvedLocale = await getLocale();
    const tNotFound = await getTranslations({ locale: resolvedLocale, namespace: "NotFound" });
    const cookieStore = await cookies();
    const authToken = cookieStore.get("authToken")?.value;

    const resProject = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/projects/${slug}`, {
        headers: {
            Accept: "application/json",
            Authorization: authToken ? `Bearer ${authToken}` : undefined,
        },
    });

    if(!resProject.ok) {
        return (
            <div className="layout">
                <div className="view">
                    <div className="not-found-page__dummy">{tNotFound("message")}</div>
                </div>
            </div>
        );
    }

    const project = await resProject.json();

    const templatesRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/projects/${slug}/issues/templates?include_archived=true`, {
        headers: {
            Accept: "application/json",
            Authorization: authToken ? `Bearer ${authToken}` : undefined,
        },
        cache: "no-store",
    });

    const labelsRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/projects/${slug}/issues/labels?include_archived=true`, {
        headers: {
            Accept: "application/json",
            Authorization: authToken ? `Bearer ${authToken}` : undefined,
        },
        cache: "no-store",
    });

    const templatesData = templatesRes.ok ? await templatesRes.json() : { templates: [] };
    const labelsData = labelsRes.ok ? await labelsRes.json() : { labels: [] };

    return (
        <IssuesSettings
            project={project}
            authToken={authToken}
            initialTemplates={templatesData.templates || []}
            initialLabels={labelsData.labels || []}
        />
    );
}