import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import CommentsPage from "../../../../../components/pages/CommentsPage";
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
    });

    if(!res.ok) {
        notFound();
    }

    const project = await res.json();
    if(!project.comments_enabled) {
        notFound();
    }

    const titlePrefix = t(`projectTypes.${project.project_type}`, {
        defaultValue: project.project_type.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase()),
    });

    const description = project.summary.length > 160 ? `${project.summary.substring(0, 157)}...` : project.summary;
    const baseUrl = "https://modifold.com";

    return {
        title: t("metadata.title", { title: project.title, titlePrefix }),
        description,
        keywords: `${project.title}, ${titlePrefix}, Hytale, mods, shaders, resource packs, modpacks, download mods Hytale, Modifold`,
        author: project.owner.username,
        robots: "index, follow",
        alternates: {
            canonical: `${baseUrl}/mod/${project.slug}/comments`,
            "x-default": `${baseUrl}/mod/${project.slug}/comments`,
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
            url: `${baseUrl}/mod/${project.slug}/comments`,
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
    const resolvedLocale = ["ru", "en", "es", "pt", "uk", "tr"].includes(locale) ? locale : "en";
    const cookieStore = await cookies();
    const authToken = cookieStore.get("authToken")?.value;

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/projects/${slug}`, {
        headers: {
            Accept: "application/json",
            Authorization: authToken ? `Bearer ${authToken}` : undefined,
        },
    });

    if(!res.ok) {
        notFound();
    }

    const project = await res.json();
    if(!project.comments_enabled) {
        notFound();
    }
    const membersRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/projects/${slug}/members`, {
        headers: {
            Accept: "application/json",
            Authorization: authToken ? `Bearer ${authToken}` : undefined,
        },
    });

    const members = membersRes.ok ? await membersRes.json() : [];
    const baseUrl = "https://modifold.com";

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
                    "url": `${baseUrl}/mod/${project.slug}/comments`,
                    "image": project.icon_url || DEFAULT_PROJECT_ICON_URL,
                    "inLanguage": resolvedLocale,
                })}
            </Script>

            <link rel="alternate" hrefLang="x-default" href={`${baseUrl}/mod/${project.slug}/comments`} />

            <CommentsPage project={{ ...project, members }} authToken={authToken} />
        </>
    );
}