"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { useAuth } from "../providers/AuthProvider";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import UserName from "../ui/UserName";
import ProjectTags from "../ui/ProjectTags";
const DEFAULT_PROJECT_ICON_URL = "https://media.modifold.com/static/no-project-icon.svg";

export default function DashboardClient({ initialProjects, initialTotalPages, initialPage, authToken }) {
    const t = useTranslations("DashboardClient");
    const tSidebar = useTranslations("SettingsBlogPage.sidebar");
    const router = useRouter();
    const pathname = usePathname();
    const { isLoggedIn, user } = useAuth();
    const [projects, setProjects] = useState(initialProjects || []);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(initialPage || 1);
    const [totalPages, setTotalPages] = useState(initialTotalPages || 1);

    useEffect(() => {
        if(!isLoggedIn) {
            router.push("/");
            return;
        }

        if(currentPage === initialPage) {
            setProjects(initialProjects);
            setTotalPages(initialTotalPages);
            return;
        }

        const fetchUserProjects = async () => {
            try {
                setLoading(true);

                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/projects/user/projects`, {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                    params: {
                        page: currentPage,
                        limit: 20,
                    },
                });

                setProjects(res.data.projects || []);
                setTotalPages(res.data.totalPages || 1);
            } catch (err) {
                console.error("Error fetching user projects:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserProjects();
    }, [currentPage, authToken, initialProjects, initialTotalPages, initialPage, isLoggedIn, router]);

    const getPageButtons = () => {
        const maxButtons = 10;
        let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxButtons - 1);

        if(endPage - startPage + 1 < maxButtons) {
            startPage = Math.max(1, endPage - maxButtons + 1);
        }

        const buttons = [];
        for(let i = startPage; i <= endPage; i++) {
            buttons.push(
                <button key={i} className={`button button--size-m pagination-button ${currentPage === i ? "button--type-primary" : "button--type-secondary"}`} onClick={() => setCurrentPage(i)} aria-current={currentPage === i ? "page" : undefined}>
                    {i}
                </button>
            );
        }

        return buttons;
    };

    const isActive = (href) => pathname === href;

    return (
        <div className="layout">
            <div className="page-content settings-page">
                <div className="sidebar">
                    <div className="sidebar__main">
                        <Link href={`/user/${user.slug}`} className="sidebar-item">
                            <img src={user.avatar} alt={t("userAvatarAlt", { username: user.username })} className="icon" width="28" height="28" style={{ borderRadius: "8px" }} />

                            <UserName user={user} />
                        </Link>

                        <div className="sidebar-separator-view _theme_default _size_s"></div>

                        <Link href={`/dashboard`} className={`sidebar-item ${isActive(`/dashboard`) ? "sidebar-item--active" : ""}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon lucide lucide-box-icon lucide-box"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>

                            {tSidebar("projects")}
                        </Link>

                        <Link href={`/notifications`} className={`sidebar-item ${isActive(`/notifications`) ? "sidebar-item--active" : ""}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon lucide lucide-bell-icon lucide-bell"><path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/></svg>

                            {tSidebar("notifications")}
                        </Link>

                        <Link href={`/settings`} className={`sidebar-item ${isActive(`/settings`) ? "sidebar-item--active" : ""}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon lucide lucide-settings-icon lucide-settings"><path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/><circle cx="12" cy="12" r="3"/></svg>

                            {tSidebar("settings")}
                        </Link>

                        <Link href="/settings/api" className={`sidebar-item ${isActive("/settings/api") ? "sidebar-item--active" : ""}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon lucide lucide-braces-icon lucide-braces"><path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1"/><path d="M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1"/></svg>

                            {tSidebar("apiTokens")}
                        </Link>

                        <Link href="/settings/verification" className={`sidebar-item ${isActive("/settings/verification") ? "sidebar-item--active" : ""}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon lucide lucide-badge-check-icon lucide-badge-check"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/></svg>

                            {tSidebar("verification")}
                        </Link>
                    </div>
                </div>

                <div className="settings-content">
                    {loading ? (
                        <div className="subsite-empty-feed">
                            <p className="subsite-empty-feed__title">{t("loading")}</p>
                        </div>
                    ) : projects.length > 0 ? (
                        <div className="projects-grid">
                            {projects.map((project) => (
                                <div key={project.slug} id={project.slug} className="new-project-card">
                                    <img className="new-project-icon" alt={t("projectIconAlt", { title: project.title })} src={project.icon_url || DEFAULT_PROJECT_ICON_URL} />

                                    <div className="new-project-info">
                                        <div className="new-project-header">
                                            <Link href={`/mod/${project.slug}`} className="new-project-title">{project.title}</Link>
                                            <span className="new-project-author">
                                                {t("byYou")}
                                            </span>
                                        </div>

                                        <Link href={`/mod/${project.slug}`} className="new-project-description">{project.summary}</Link>

                                        {project.tags?.length > 0 && (
                                            <div className="new-project-tags">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-tags-icon lucide-tags"><path d="M13.172 2a2 2 0 0 1 1.414.586l6.71 6.71a2.4 2.4 0 0 1 0 3.408l-4.592 4.592a2.4 2.4 0 0 1-3.408 0l-6.71-6.71A2 2 0 0 1 6 9.172V3a1 1 0 0 1 1-1z"/><path d="M2 7v6.172a2 2 0 0 0 .586 1.414l6.71 6.71a2.4 2.4 0 0 0 3.191.193"/><circle cx="10.5" cy="6.5" r=".5" fill="currentColor"/></svg>

                                                <ProjectTags tags={project.tags} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="new-project-stats">
                                        <Link href={`/mod/${project.slug}/settings`} className="button button--size-m button--type-minimal button--icon-only">
                                            <svg style={{ fill: "none" }} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon--settings"><path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/><circle cx="12" cy="12" r="3"/></svg>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>{t("noProjects")}</p>
                    )}

                    {totalPages > 1 && (
                        <div className="pagination-controls">
                            <button className="button button--size-m button--type-secondary" onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))} disabled={currentPage === 1} aria-disabled={currentPage === 1}>
                                {t("previous")}
                            </button>

                            {getPageButtons()}

                            <button className="button button--size-m button--type-secondary" onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} aria-disabled={currentPage === totalPages}>
                                {t("next")}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}