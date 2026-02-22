import { cookies } from "next/headers";
import { getLocale, getTranslations } from "next-intl/server";
import VersionPage from "@/components/pages/VersionPage";
const DEFAULT_PROJECT_ICON_URL = "https://media.modifold.com/static/no-project-icon.svg";

export async function generateMetadata({ params }) {
    const { slug, version_number } = await params;
    const resolvedLocale = await getLocale();
    const t = await getTranslations({ locale: resolvedLocale, namespace: "ProjectPage" });

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/projects/${slug}/version/${version_number}`, {
        headers: { Accept: "application/json" },
    });

    if(!res.ok) {
        return { title: t("metadata.version.notFound") };
    }

    const version = await res.json();
    const projectRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/projects/${slug}`, {
        headers: { Accept: "application/json" },
    });

    const project = projectRes.ok ? await projectRes.json() : {};
    const projectTitle = project.title || t("metadata.version.unknownProject");

    return {
        title: t("metadata.version.title", { version: version.version_number, project: projectTitle }),
        description: version.changelog || t("metadata.version.description", { version: version.version_number, project: projectTitle }),
        openGraph: {
            title: t("metadata.version.title", { version: version.version_number, project: projectTitle }),
            description: version.changelog || t("metadata.version.description", { version: version.version_number, project: projectTitle }),
            images: [project.icon_url || DEFAULT_PROJECT_ICON_URL],
            url: `https://modifold.com/project/${slug}/version/${version_number}`,
        },
    };
}

export default async function Page({ params }) {
    const { slug, version_number } = await params;
    const resolvedLocale = await getLocale();
    const t = await getTranslations({ locale: resolvedLocale, namespace: "ProjectPage" });
    const cookieStore = await cookies();
    const authToken = cookieStore.get("authToken")?.value;

    const versionRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/projects/${slug}/version/${version_number}`, {
        headers: {
            Accept: "application/json",
            Authorization: authToken ? `Bearer ${authToken}` : undefined,
        },
    });

    if(!versionRes.ok) {
        return <div>{t("versionNotFound")}</div>;
    }

    const version = await versionRes.json();

    const projectRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/projects/${slug}`, {
        headers: {
            Accept: "application/json",
            Authorization: authToken ? `Bearer ${authToken}` : undefined,
        },
    });

    if(!projectRes.ok) {
        return <div>{t("projectNotFound")}</div>;
    }

    const project = await projectRes.json();

    const membersRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/projects/${slug}/members`, {
        headers: { Accept: "application/json", Authorization: `Bearer ${authToken}` },
    });

    const members = membersRes.ok ? await membersRes.json() : [];

    return <VersionPage project={{ ...project, members }} version={version} authToken={authToken} />;
}