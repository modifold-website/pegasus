import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import CommentsPage from "@/components/pages/CommentsPage";
import { getLocale } from "next-intl/server";
import Script from "next/script";
import { getProjectBasePath } from "@/utils/projectRoutes";

export async function generateMetadata({ params }) {
    const { slug } = await params;

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
    const basePath = getProjectBasePath(project.project_type);

    const description = project.summary.length > 160 ? `${project.summary.substring(0, 157)}...` : project.summary;

    return {
        title: `${project.title} — Modifold`,
        description,
        keywords: `${project.title}, Hytale, mods, shaders, resource packs, modpacks, download mods Hytale, Modifold`,
        author: project.owner.username,
        robots: "index, follow",
        alternates: {
            canonical: `https://modifold.com${basePath}/${project.slug}/comments`,
            "x-default": `https://modifold.com${basePath}/${project.slug}/comments`,
        },
        openGraph: {
            title: `${project.title} — Modifold`,
            description,
            images: [
                {
                    url: project.icon_url || "https://media.modifold.com/static/no-project-icon.svg",
                    width: 1200,
                    height: 630,
                    alt: `${project.title} Hytale Mod`,
                },
            ],
            url: `https://modifold.com${basePath}/${project.slug}/comments`,
            type: "website",
            locale: "en_US",
        },
        twitter: {
            card: "summary_large_image",
            title: `${project.title} — Modifold`,
            description,
            images: [project.icon_url || "https://media.modifold.com/static/no-project-icon.svg"],
        },
    };
}

export default async function Page({ params }) {
    const { slug } = await params;
    const resolvedLocale = await getLocale();
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
    const basePath = getProjectBasePath(project.project_type);
    
    const membersRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/projects/${slug}/members`, {
        headers: {
            Accept: "application/json",
            Authorization: authToken ? `Bearer ${authToken}` : undefined,
        },
    });

    const members = membersRes.ok ? await membersRes.json() : [];
    const commentsRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/projects/${slug}/comments`, {
        headers: {
            Accept: "application/json",
            Authorization: authToken ? `Bearer ${authToken}` : undefined,
        },
        cache: "no-store",
    });
    const commentsData = commentsRes.ok ? await commentsRes.json() : { comments: [], canModerate: false };

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
                    "url": `https://modifold.com${basePath}/${project.slug}/comments`,
                    "image": project.icon_url || "https://media.modifold.com/static/no-project-icon.svg",
                    "inLanguage": resolvedLocale,
                })}
            </Script>

            <link rel="alternate" hrefLang="x-default" href={`https://modifold.com${basePath}/${project.slug}/comments`} />

            <CommentsPage
                project={{ ...project, members }}
                authToken={authToken}
                initialComments={commentsData.comments || []}
                initialCanModerate={!!commentsData.canModerate}
                initialCommentsLoaded={commentsRes.ok}
            />
        </>
    );
}