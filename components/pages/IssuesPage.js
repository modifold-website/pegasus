"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../providers/AuthProvider";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "react-toastify";
import IssueTemplatePickerModal from "@/modal/IssueTemplatePickerModal";
import ProjectSidebar from "@/components/project/ProjectSidebar";
import { getProjectBasePath } from "@/utils/projectRoutes";

const formatDate = (timestamp, locale) => {
    if(!timestamp) {
        return "";
    }

    const date = new Date(Number(timestamp));
    return date.toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
};

const applyLabelStyle = (label) => ({
    background: `${label.color}22`,
    color: label.color,
    border: `1px solid ${label.color}44`,
});

export default function IssuesPage({ project, initialIssues, templates = [] }) {
    const t = useTranslations("Issues");
    const locale = useLocale();
    const { isLoggedIn } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);
    const sortRef = useRef(null);
    const status = (searchParams.get("status") || initialIssues.status || "open").toLowerCase();
    const sort = (searchParams.get("sort") || initialIssues.sort || "newest").toLowerCase();

    const basePath = getProjectBasePath(project.project_type);
    const [issueItems, setIssueItems] = useState(initialIssues.issues || []);
    const [isPinUpdating, setIsPinUpdating] = useState(null);

    useEffect(() => {
        setIssueItems(initialIssues.issues || []);
    }, [initialIssues.issues]);

    const pagination = useMemo(() => {
        const currentPage = Number(initialIssues.page || 1);
        const totalPages = Number(initialIssues.totalPages || 1);
        const buttons = [];
        const maxButtons = 8;
        let start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
        let end = Math.min(totalPages, start + maxButtons - 1);
        if(end - start + 1 < maxButtons) {
            start = Math.max(1, end - maxButtons + 1);
        }

        for(let i = start; i <= end; i++) {
            buttons.push(i);
        }

        return { currentPage, totalPages, buttons };
    }, [initialIssues]);

    const openPicker = () => {
        if(!isLoggedIn) {
            toast.error(t("newIssue.loginRequired"));
            return;
        }

        setIsPickerOpen(true);
    };

    const handleTemplateSelect = (template) => {
        setIsPickerOpen(false);
        const templateQuery = template?.id ? `?template=${encodeURIComponent(template.id)}` : "";
        router.push(`${basePath}/${project.slug}/issues/new${templateQuery}`);
    };

    const buildUrl = (params) => {
        const query = new URLSearchParams(searchParams.toString());
        Object.entries(params).forEach(([key, value]) => {
            if(value === null) {
                query.delete(key);
            } else {
                query.set(key, value);
            }
        });

        const qs = query.toString();
        return qs ? `?${qs}` : "";
    };

    const handleTogglePin = async (event, issueId, isPinned) => {
        event.preventDefault();
        event.stopPropagation();

        if(!initialIssues.canManage) {
            return;
        }

        try {
            setIsPinUpdating(issueId);
            const token = localStorage.getItem("authToken");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/projects/${project.slug}/issues/${issueId}`, {
                method: "PATCH",
                headers: token ? {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                } : {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ action: isPinned ? "unpin" : "pin" }),
            });

            if(!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || "Failed");
            }

            const issuesRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/projects/${project.slug}/issues?status=${encodeURIComponent(status)}&sort=${encodeURIComponent(sort)}&page=${encodeURIComponent(pagination.currentPage)}&limit=${encodeURIComponent(initialIssues.limit || 20)}`, {
                headers: token ? {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                } : { Accept: "application/json" },
            });

            const data = issuesRes.ok ? await issuesRes.json() : null;
            if(data?.issues) {
                setIssueItems(data.issues);
            }
        } catch (error) {
            toast.error(error.message || t("errors.pin"));
        } finally {
            setIsPinUpdating(null);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if(sortRef.current && !sortRef.current.contains(event.target)) {
                setIsSortOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="project__general">
            <div className="issues-page">
                <div className="content content--padding issues-header">
                    <div className="issues-title-row">
                        <h1>{t("title")}</h1>

                        <button className="button button--size-m button--type-primary button--active-transform button--with-icon" onClick={openPicker}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14"></path>
                                <path d="M12 5v14"></path>
                            </svg>
                            
                            {t("newIssue.button")}
                        </button>
                    </div>

                    <div className="issues-toolbar">
                        <div className="issues-filters">
                            <Link href={buildUrl({ status: "open", page: "1" })} className={`button button--size-m button--active-transform ${status === "open" ? "button--type-primary" : "button--type-minimal"}`}>
                                {t("filters.open")} {initialIssues.openCount}
                            </Link>

                            <Link href={buildUrl({ status: "closed", page: "1" })} className={`button button--size-m button--active-transform ${status === "closed" ? "button--type-primary" : "button--type-minimal"}`}>
                                {t("filters.closed")} {initialIssues.closedCount}
                            </Link>
                        </div>

                        <div className="issues-sort" ref={sortRef}>
                            <div className="dropdown">
                                <button className="dropdown__label" onClick={() => setIsSortOpen((prev) => !prev)} aria-expanded={isSortOpen}>
                                    {sort === "oldest" ? t("filters.oldest") : t("filters.newest")}

                                    <svg style={{ fill: "none" }} xmlns="http://www.w3.org/2000/svg" className={`icon icon--chevron_up ${isSortOpen ? "open" : ""}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="m6 9 6 6 6-6"/>
                                    </svg>
                                </button>

                                {isSortOpen && (
                                    <div className="popover popover--sort">
                                        <div className="context-list" data-scrollable="" style={{ maxHeight: "none" }}>
                                            <Link href={buildUrl({ sort: "newest", page: "1" })} className={`context-list-option ${sort === "newest" ? "context-list-option--selected" : ""}`} onClick={() => setIsSortOpen(false)}>
                                                <div className="context-list-option__label">{t("filters.newest")}</div>
                                            </Link>

                                            <Link href={buildUrl({ sort: "oldest", page: "1" })} className={`context-list-option ${sort === "oldest" ? "context-list-option--selected" : ""}`} onClick={() => setIsSortOpen(false)}>
                                                <div className="context-list-option__label">{t("filters.oldest")}</div>
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="issues-list">
                    {issueItems.length === 0 ? (
                        <div className="issues-empty">{t("empty")}</div>
                    ) : (
                        issueItems.map((issue) => (
                            <div key={issue.id} className="issue-card">
                                <Link className="issue-card__overlay" href={`${basePath}/${project.slug}/issues/${issue.id}`} aria-label={issue.title} />
                                
                                <div className="issue-card__main">
                                    <div className="issue-card__title">
                                        <span className={`issue-status-badge issue-status-badge--${issue.status === "closed" ? "closed" : "open"}`}>
                                            {issue.status === "closed" ? t("status.closed") : t("status.open")}
                                        </span>

                                        <p>{issue.title}</p>
                                    </div>

                                    <div className="issue-card__meta">
                                        {(issue.labels || []).length > 0 && (
                                            (issue.labels || []).map((label) => (
                                                <span key={label.id} className="issue-label" style={applyLabelStyle(label)}>
                                                    {label.name}
                                                </span>
                                            ))
                                        )}

                                        <span>#{issue.id}</span>

                                        {issue.author && (
                                            <span>{t("meta.by")} {issue.author.username}</span>
                                        )}

                                        <span>{formatDate(issue.created_at, locale)}</span>
                                    </div>
                                </div>

                                <div className="issue-card__comments">
                                    {initialIssues.canManage && (
                                        <button type="button" className={`issue-card__pin ${issue.is_pinned ? "is-pinned" : ""}`} onClick={(event) => handleTogglePin(event, issue.id, issue.is_pinned)} aria-label={issue.is_pinned ? t("actions.unpin") : t("actions.pin")} title={issue.is_pinned ? t("actions.unpin") : t("actions.pin")} aria-pressed={issue.is_pinned} disabled={isPinUpdating === issue.id}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                <path d="M12 17v5"/>
                                                <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/>
                                            </svg>
                                        </button>
                                    )}

                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M21.0083 16.3419C20.8613 16.7129 20.8285 17.1193 20.9143 17.5089L21.9793 20.7989C22.0136 20.9658 22.0048 21.1386 21.9535 21.3011C21.9023 21.4635 21.8104 21.6102 21.6866 21.7272C21.5628 21.8442 21.4112 21.9276 21.2461 21.9696C21.081 22.0115 20.9079 22.0106 20.7433 21.9669L17.3303 20.9689C16.9626 20.896 16.5818 20.9279 16.2313 21.0609C14.0959 22.0582 11.6769 22.2691 9.40116 21.6567C7.12537 21.0442 5.13904 19.6476 3.79261 17.7133C2.44618 15.779 1.82619 13.4313 2.04201 11.0845C2.25784 8.73763 3.29561 6.54241 4.97224 4.88613C6.64887 3.22986 8.85661 2.21898 11.2059 2.03183C13.5552 1.84469 15.8952 2.49332 17.8129 3.86328C19.7306 5.23323 21.1028 7.23648 21.6874 9.51958C22.2721 11.8027 22.0315 14.2189 21.0083 16.3419Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>

                                    {issue.comments_count}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {pagination.totalPages > 1 && (
                    <div className="pagination-controls">
                        <Link href={buildUrl({ page: String(Math.max(1, pagination.currentPage - 1)) })} className="button button--size-m button--type-secondary">
                            {t("pagination.prev")}
                        </Link>

                        {pagination.buttons.map((page) => (
                            <Link key={page} href={buildUrl({ page: String(page) })} className={`button button--size-m pagination-button ${pagination.currentPage === page ? "button--type-primary" : "button--type-secondary"}`}>
                                {page}
                            </Link>
                        ))}

                        <Link href={buildUrl({ page: String(Math.min(pagination.totalPages, pagination.currentPage + 1)) })} className="button button--size-m button--type-secondary">
                            {t("pagination.next")}
                        </Link>
                    </div>
                )}

                <IssueTemplatePickerModal
                    isOpen={isPickerOpen}
                    templates={templates}
                    onSelect={handleTemplateSelect}
                    onRequestClose={() => setIsPickerOpen(false)}
                />
            </div>

            <ProjectSidebar project={project} showLicense={true} showLinks={true} />
        </div>
    );
}