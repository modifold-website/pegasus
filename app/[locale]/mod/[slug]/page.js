import { cookies, headers } from "next/headers";
import { notFound } from "next/navigation";
import ProjectPage from "../../../../components/pages/ProjectPage";
import { getTranslations } from "next-intl/server";
import Script from "next/script";
const DEFAULT_PROJECT_ICON_URL = "https://media.modifold.com/static/no-project-icon.svg";

export async function generateMetadata({ params }) {
    const { locale, slug } = await params;
    const resolvedLocale = ["ru", "en", "es", "pt", "uk", "tr"].includes(locale) ? locale : "en";
    const ogLocale = resolvedLocale === "ru" ? "ru_RU" : "en_US";

    const t = await getTranslations({ locale: resolvedLocale, namespace: "ProjectPage" });
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/projects/${slug}`, {
        headers: { Accept: "application/json" },
        next: { revalidate: 60, tags: [`project:${slug}`] },
    });

    if(!res.ok) {
        notFound();
    }

    const project = await res.json();

    const titlePrefix = t(`projectTypes.${project.project_type}`, {
        defaultValue: project.project_type.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase()),
    });

    const description = project.summary.length > 160 ? `${project.summary.substring(0, 157)}...` : project.summary;

    return {
        title: t("metadata.title", { title: project.title, titlePrefix }),
        description,
        keywords: `${project.title}, ${titlePrefix}, Hytale, mods, shaders, resource packs, modpacks, download mods Hytale, Modifold`,
        author: project.owner.username,
        robots: "index, follow",
        alternates: {
            canonical: `https://modifold.com/mod/${project.slug}`,
            "x-default": `https://modifold.com/mod/${project.slug}`,
        },
        openGraph: {
            title: t("metadata.openGraph.title", { titlePrefix, title: project.title }),
            description,
            images: [
                {
                    url: project.icon_url || DEFAULT_PROJECT_ICON_URL,
                    width: 1200,
                    height: 630,
                    alt: `${project.title} Hytale Mod`,
                },
            ],
            url: `https://modifold.com/mod/${project.slug}`,
            type: "website",
            locale: ogLocale,
        },
        twitter: {
            card: "summary_large_image",
            title: t("metadata.openGraph.title", { titlePrefix, title: project.title }),
            description,
            images: [project.icon_url || DEFAULT_PROJECT_ICON_URL],
        },
    };
}

export default async function Page({ params }) {
    const { locale, slug } = await params;

    const h = await headers();
    const xff = h.get("x-forwarded-for");
    const realIp = h.get("x-real-ip");
    const clientIp = (xff?.split(",")[0] || realIp || "").trim();

    const resolvedLocale = ["ru", "en", "es", "pt", "uk", "tr"].includes(locale) ? locale : "en";
    const cookieStore = await cookies();
    const authToken = cookieStore.get("authToken")?.value;

    const projectFetchOptions = authToken ? {
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${authToken}`,
        },
        cache: "no-store",
    } : {
        headers: { Accept: "application/json" },
        next: { revalidate: 60, tags: [`project:${slug}`] },
    };

    const membersFetchOptions = authToken ? {
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${authToken}`,
        },
        cache: "no-store",
    } : {
        headers: { Accept: "application/json" },
        next: { revalidate: 60, tags: [`project:${slug}:members`] },
    };

    let res;
    try {
        res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/projects/${slug}`, projectFetchOptions);
    } catch {
        notFound();
    }

    if(!res.ok) {
        notFound();
    }

    const project = await res.json();

    fetch(`${process.env.NEXT_PUBLIC_API_BASE}/projects/${slug}/view`, {
        method: "POST",
        headers: {
            ...(clientIp ? { "x-forwarded-for": clientIp } : {}),
        },
        cache: "no-store",
    }).catch(console.error);

    let members = [];
    try {
        const membersRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/projects/${slug}/members`, membersFetchOptions);
        if(membersRes.ok) {
            members = await membersRes.json();
        }
    } catch {}

    return (
        <>
            <Script id="schema-markup" type="application/ld+json">
                {JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "SoftwareApplication",
                    "name": project.title,
                    "applicationCategory": project.project_type === "mod" ? "Game Mod" : project.project_type.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase()),
                    "operatingSystem": "Hytale",
                    "author": { "@type": "Person", "name": project.owner.username },
                    "description": project.summary,
                    "url": `https://modifold.com/mod/${project.slug}`,
                    "image": project.icon_url || DEFAULT_PROJECT_ICON_URL,
                    "inLanguage": resolvedLocale,
                })}
            </Script>

            <link rel="alternate" hrefLang="x-default" href={`https://modifold.com/mod/${project.slug}`} />

            <ProjectPage project={{ ...project, members }} authToken={authToken} />
        </>
    );
}