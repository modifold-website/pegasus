"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../providers/AuthProvider";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import { useLocale, useTranslations } from "next-intl";
import ProjectSettingsSidebar from "@/components/ui/ProjectSettingsSidebar";

export default function ModerationProjectPage({ project, authToken }) {
    const t = useTranslations("SettingsProjectPage");
    const locale = useLocale();
    const { isLoggedIn, user } = useAuth();
    const router = useRouter();
    const [hasIcon, setHasIcon] = useState(false);
    const [hasDescription, setHasDescription] = useState(false);
    const [hasSummary, setHasSummary] = useState(false);
    const [hasVersions, setHasVersions] = useState(false);
    const [loading, setLoading] = useState(false);
    const [moderationHistory, setModerationHistory] = useState([]);

    useEffect(() => {
        if(!isLoggedIn || project.user_id !== user.id) {
            router.push("/");
            return;
        }

        setHasIcon(!!project.icon_url);
        setHasDescription(!!project.description);
        setHasSummary(!!project.summary);
        setHasVersions(Array.isArray(project?.versions) && project.versions.length > 0);
    }, [isLoggedIn, user, project, router]);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/projects/${project.slug}/moderation-history`, {
                    headers: { Authorization: `Bearer ${authToken}` },
                });

                setModerationHistory(res.data.history);
            } catch (err) {
                console.error("Failed to load moderation history", err);
            }
        };

        if(project?.slug) {
            fetchHistory();
        }
    }, [project?.slug, authToken]);

    const handleSubmit = async () => {
        if(!hasIcon) {
            toast.error(t("moderation.errors.icon"));
            return;
        }

        if(!hasDescription) {
            toast.error(t("moderation.errors.description"));
            return;
        }

        if(!hasSummary) {
            toast.error(t("moderation.errors.summary"));
            return;
        }

        if(!hasVersions) {
            toast.error(t("moderation.errors.versions"));
            return;
        }

        setLoading(true);

        try {
            await axios.post(
                `${process.env.NEXT_PUBLIC_API_BASE}/projects/${project.slug}/submit`,
                { status: "queued" },
                { headers: { Authorization: `Bearer ${authToken}` } }
            );

            router.push(`/mod/${project.slug}/settings/moderation`);
        } catch (err) {
            toast.error(t("moderation.errors.submit"));
            setLoading(false);
        }
    };

    const canSubmit = hasIcon && hasDescription && hasSummary && hasVersions && project.status !== "queued" && project.status !== "approved";

    const historyActionLabel = (action) => {
        switch(action) {
            case "queued":
                return t("moderation.history.actions.queued");
            case "approved":
                return t("moderation.history.actions.approved");
            case "rejected":
                return t("moderation.history.actions.rejected");
            case "changes_requested":
                return t("moderation.history.actions.changesRequested");
            default:
                return action;
        }
    };

    return (
        <div className="layout">
            <div className="page-content settings-page">
                <ProjectSettingsSidebar
                    project={project}
                    iconAlt={t("general.iconAlt")}
                    labels={{
                        general: t("sidebar.general"),
                        description: t("sidebar.description"),
                        links: t("sidebar.links"),
                        versions: t("sidebar.versions"),
                        gallery: t("sidebar.gallery"),
                        tags: t("sidebar.tags"),
                        license: t("sidebar.license"),
                        moderation: t("sidebar.moderation"),
                    }}
                />

                <div className="settings-wrapper" style={{ width: "100%" }}>
                    <div className="settings-content">
                        <div className="blog-settings">
                            <div className="blog-settings__body">
                                <p className="blog-settings__field-title">
                                    {t("moderation.title")}
                                </p>

                                <p style={{ marginBottom: "12px" }}>{t("moderation.description")}</p>

                                <div className="bento-grid">
                                    <div className={`bento-card ${hasIcon ? "completed" : "incomplete"}`}>
                                        <div className="card-status">
                                            {hasIcon ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-icon lucide-check"><path d="M20 6 9 17l-5-5"></path></svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                                            )}
                                        </div>

                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="card-icon"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                                        <h3>{t("moderation.cards.icon.title")}</h3>

                                        <p>{hasIcon ? t("moderation.cards.icon.done") : t("moderation.cards.icon.required")}</p>
                                    </div>

                                    <div className={`bento-card ${hasSummary ? "completed" : "incomplete"}`}>
                                        <div className="card-status">
                                            {hasSummary ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-icon lucide-check"><path d="M20 6 9 17l-5-5"></path></svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                                            )}
                                        </div>

                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="card-icon"><path d="M12 4v16"/><path d="M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2"/><path d="M9 20h6"/></svg>
                                        <h3>{t("moderation.cards.summary.title")}</h3>

                                        <p>{hasSummary ? t("moderation.cards.summary.done") : t("moderation.cards.summary.required")}</p>
                                    </div>

                                    <div className={`bento-card description-card ${hasDescription ? "completed" : "incomplete"}`}>
                                        <div className="card-status">
                                            {hasDescription ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-icon lucide-check"><path d="M20 6 9 17l-5-5"></path></svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                                            )}
                                        </div>

                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="card-icon"><path d="M15 5h6"/><path d="M15 12h6"/><path d="M3 19h18"/><path d="m3 12 3.553-7.724a.5.5 0 0 1 .894 0L11 12"/><path d="M3.92 10h6.16"/></svg>
                                        <h3>{t("moderation.cards.description.title")}</h3>

                                        <p>{hasDescription ? t("moderation.cards.description.done") : t("moderation.cards.description.required")}</p>
                                    </div>

                                    <div className={`bento-card ${hasVersions ? "completed" : "incomplete"}`}>
                                        <div className="card-status">
                                            {hasVersions ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-icon lucide-check"><path d="M20 6 9 17l-5-5"></path></svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                                            )}
                                        </div>

                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="card-icon"><path d="M12 17V3"/><path d="m6 11 6 6 6-6"/><path d="M19 21H5"/></svg>
                                        <h3>{t("moderation.cards.versions.title")}</h3>

                                        <p>{hasVersions ? t("moderation.cards.versions.done") : t("moderation.cards.versions.required")}</p>
                                    </div>
                                </div>

                                {(project.status === "queued" || project.status === "approved") && (
                                    <div className="status-banner">
                                        {project.status === "queued" ? (
                                            <>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clock-icon lucide-clock"><path d="M12 6v6l4 2"/><circle cx="12" cy="12" r="10"/></svg>

                                                <span>{t("moderation.status.queued")}</span>
                                            </>
                                        ) : (
                                            <>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-icon lucide-check"><path d="M20 6 9 17l-5-5"/></svg>

                                                <span>{t("moderation.status.approved")}</span>
                                            </>
                                        )}
                                    </div>
                                )}

                                <div className="moderation-history">
                                    <p className="blog-settings__field-title" style={{ marginBottom: "16px" }}>{t("moderation.history.title")}</p>

                                    {moderationHistory.length === 0 ? (
                                        <p>{t("moderation.history.empty")}</p>
                                    ) : (
                                        <div className="history-list">
                                            {moderationHistory.map((entry) => (
                                                <div key={entry.id} className={`history-item ${entry.action}`}>
                                                    <div className="date">{new Date(entry.createdAt).toLocaleString(locale)}</div>
                                                    
                                                    <div className="action">
                                                        {historyActionLabel(entry.action)}
                                                    </div>

                                                    {entry.reason && (
                                                        <div className="reason">
                                                            {t("moderation.history.reason")}: {entry.reason}
                                                        </div>
                                                    )}

                                                    {entry.moderator && (
                                                        <div className="moderator">
                                                            {t("moderation.history.moderator")}: {entry.moderator.username}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <button style={{ marginTop: "18px" }} className="button button--size-m button--type-primary" onClick={handleSubmit} disabled={loading || !canSubmit}>
                                    {loading ? t("moderation.actions.submitting") : project.status === "queued" ? t("moderation.actions.alreadySubmitted") : project.status === "approved" ? t("moderation.actions.approved") : t("moderation.actions.submit")}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}