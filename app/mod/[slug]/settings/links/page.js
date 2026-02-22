import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import LinksSettings from "@/components/project/settings/LinksSettings";

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

    if(!authToken) {
        redirect("/");
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/projects/${slug}/settings`, {
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${authToken}`,
        },
        cache: "no-store",
    });

    if(res.status === 401 || res.status === 403) {
        redirect("/403");
    }

    if(!res.ok) {
        return (
            <div className="layout">
                <div className="view">
                    <div className="not-found-page__dummy">{tNotFound("message")}</div>
                </div>
            </div>
        );
    }

    const resProject = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/projects/${slug}`, {
        headers: {
            Accept: "application/json",
            Authorization: authToken ? `Bearer ${authToken}` : undefined,
        },
    });

    const project = await resProject.json();

    return <LinksSettings project={project} authToken={authToken} />;
}