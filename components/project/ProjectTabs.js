"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

export default function ProjectTabs({ project }) {
    const t = useTranslations("ProjectPage");
    const pathname = usePathname();
    const tabsRef = useRef(null);
    const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0, opacity: 0 });

    const isActive = (href) => pathname === href;
    const isWikiActive = pathname === `/mod/${project.slug}/wiki` || pathname.startsWith(`/mod/${project.slug}/wiki/`);

    useEffect(() => {
        const updateIndicator = () => {
            const container = tabsRef.current;
            if(!container) {
                return;
            }

            const activeTab = container.querySelector(".tabs__tab--active");
            if(!activeTab) {
                setIndicatorStyle({ width: 0, left: 0, opacity: 0 });
                return;
            }

            const containerRect = container.getBoundingClientRect();
            const tabRect = activeTab.getBoundingClientRect();
            const left = tabRect.left - containerRect.left;
            setIndicatorStyle({ width: tabRect.width, left, opacity: 1 });
        };

        const raf = requestAnimationFrame(updateIndicator);
        window.addEventListener("resize", updateIndicator);
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", updateIndicator);
        };
    }, [pathname]);

    return (
        <div className="tabs" ref={tabsRef} style={{ paddingLeft: "16px", "--40010a00": "46px", "--58752bc5": "0px", "--b2a58f2e": "0" }}>
            <Link href={`/mod/${project.slug}`} scroll={false} className={`tabs__tab ${isActive(`/mod/${project.slug}`) ? "tabs__tab--active" : ""}`}>
                {t("tabs.description")}
            </Link>

            <Link href={`/mod/${project.slug}/versions`} scroll={false} className={`tabs__tab ${isActive(`/mod/${project.slug}/versions`) ? "tabs__tab--active" : ""}`}>
                {t("tabs.versions")}
            </Link>
        
            {project.gallery?.length > 0 && (
                <Link href={`/mod/${project.slug}/gallery`} scroll={false} className={`tabs__tab ${isActive(`/mod/${project.slug}/gallery`) ? "tabs__tab--active" : ""}`}>
                    {t("tabs.gallery")}
                </Link>
            )}

            {project.hytale_wiki_slug && (
                <Link href={`/mod/${project.slug}/wiki`} scroll={false} className={`tabs__tab ${isWikiActive ? "tabs__tab--active" : ""}`}>
                    {t("wiki")}
                </Link>
            )}

            {project.comments_enabled && (
                <Link href={`/mod/${project.slug}/comments`} scroll={false} className={`tabs__tab ${isActive(`/mod/${project.slug}/comments`) ? "tabs__tab--active" : ""}`}>
                    {t("tabs.comments")}
                </Link>
            )}

            <span className="tabs__indicator" aria-hidden="true" style={{ width: `${indicatorStyle.width}px`, transform: `translateX(${indicatorStyle.left}px)`, opacity: indicatorStyle.opacity }} />
        </div>
    );
}