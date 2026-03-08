"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

export default function ProjectTabs({ project }) {
    const t = useTranslations("ProjectPage");
    const pathname = usePathname();

    const isActive = (href) => pathname === href;
    const isWikiActive = pathname === `/mod/${project.slug}/wiki` || pathname.startsWith(`/mod/${project.slug}/wiki/`);

    return (
        <div className="tabs" style={{ paddingLeft: "16px", "--40010a00": "46px", "--58752bc5": "0px", "--b2a58f2e": "0" }}>
            <Link href={`/mod/${project.slug}`} className={`tabs__tab ${isActive(`/mod/${project.slug}`) ? "tabs__tab--active" : ""}`}>
                {t("tabs.description")}
            </Link>

            <Link href={`/mod/${project.slug}/versions`} className={`tabs__tab ${isActive(`/mod/${project.slug}/versions`) ? "tabs__tab--active" : ""}`}>
                {t("tabs.versions")}
            </Link>
        
            {project.gallery?.length > 0 && (
                <Link href={`/mod/${project.slug}/gallery`} className={`tabs__tab ${isActive(`/mod/${project.slug}/gallery`) ? "tabs__tab--active" : ""}`}>
                    {t("tabs.gallery")}
                </Link>
            )}

            {project.hytale_wiki_slug && (
                <Link href={`/mod/${project.slug}/wiki`} className={`tabs__tab ${isWikiActive ? "tabs__tab--active" : ""}`}>
                    {t("wiki")}
                </Link>
            )}

            {project.comments_enabled && (
                <Link href={`/mod/${project.slug}/comments`} className={`tabs__tab ${isActive(`/mod/${project.slug}/comments`) ? "tabs__tab--active" : ""}`}>
                    {t("tabs.comments")}
                </Link>
            )}
        </div>
    );
}