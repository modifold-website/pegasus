"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../providers/AuthProvider";
import { useTranslations } from "next-intl";
import ProjectTags from "../ui/ProjectTags";
import ProjectReportModal from "@/modal/ProjectReportModal";
const DEFAULT_PROJECT_ICON_URL = "https://media.modifold.com/static/no-project-icon.svg";

export default function ProjectMasthead({ project, authToken }) {
    const t = useTranslations("ProjectPage");
    const { isLoggedIn, user } = useAuth();
    const [followers, setFollowers] = useState(project.followers || 0);
    const [isLiked, setIsLiked] = useState(project.is_liked || false);
    const [isActionsOpen, setIsActionsOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportStatus, setReportStatus] = useState({ loading: false, hasReported: false, report: null });
    const mastheadTagsCount = project.tags_count ?? project.tagsCount ?? project.total_tags ?? project.totalTags;
    const actionsRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if(actionsRef.current && !actionsRef.current.contains(event.target)) {
                setIsActionsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if(!isLoggedIn || !authToken) {
            setReportStatus({ loading: false, hasReported: false, report: null });
            return;
        }

        let cancelled = false;

        const fetchReportStatus = async () => {
            try {
                setReportStatus((prev) => ({ ...prev, loading: true }));
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_BASE}/reports/projects/${project.slug}/my-status`,
                    { headers: { Authorization: `Bearer ${authToken}` } }
                );

                if(cancelled) {
                    return;
                }

                setReportStatus({
                    loading: false,
                    hasReported: Boolean(response.data?.has_reported),
                    report: response.data?.report || null,
                });
            } catch {
                if(!cancelled) {
                    setReportStatus({ loading: false, hasReported: false, report: null });
                }
            }
        };

        fetchReportStatus();

        return () => {
            cancelled = true;
        };
    }, [isLoggedIn, authToken, project.slug]);

    const handleLikeToggle = async () => {
        if(!isLoggedIn) {
            alert(t("loginRequired"));
            return;
        }

        try {
            const method = isLiked ? "DELETE" : "POST";
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/projects/${project.slug}/like`, {
                method,
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    "Content-Type": "application/json",
                },
            });

            const data = await response.json();
            if(response.ok) {
                setFollowers(data.followers);
                setIsLiked(data.is_liked);
            } else {
                throw new Error(data.message || "Failed to toggle like");
            }
        } catch (error) {
            console.error("Error toggling like:", error);
            alert(t("likeError"));
        }
    };

    const openReportModal = () => {
        if(!isLoggedIn || !authToken) {
            toast.error(t("report.loginRequired"));
            return;
        }

        if(reportStatus.hasReported) {
            toast.info(t("report.alreadySubmittedToast"));
            return;
        }

        setIsActionsOpen(false);
        setIsReportModalOpen(true);
    };

    const handleReportSubmitted = () => {
        setReportStatus({
            loading: false,
            hasReported: true,
            report: {
                ...(reportStatus.report || {}),
                status: "open",
            },
        });
    };

    const handleCopyProjectLink = async () => {
        const projectUrl = typeof window !== "undefined" ? `${window.location.origin}/mod/${project.slug}` : `https://modifold.com/mod/${project.slug}`;

        try {
            if(navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(projectUrl);
            } else {
                const textarea = document.createElement("textarea");
                textarea.value = projectUrl;
                textarea.setAttribute("readonly", "");
                textarea.style.position = "absolute";
                textarea.style.left = "-9999px";
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand("copy");
                document.body.removeChild(textarea);
            }

            toast.success(t("report.copySuccess"));
            setIsActionsOpen(false);
        } catch {
            toast.error(t("report.copyError"));
        }
    };

    return (
        <>
            <section className="masthead">
                <div className="masthead-info">
                    <div className="masthead-avatar">
                        <div className="avatar avatar-s-masthead">
                            <Image src={project.icon_url || DEFAULT_PROJECT_ICON_URL} className="avatar-image" alt={project.title} width={100} height={100} priority />
                        </div>
                    </div>

                    <div className="masthead-wrapper">
                        <div className="masthead-name">{project.title}</div>
                        <div className="masthead-desc">{project.summary}</div>

                        <div className="masthead-short">
                            <div className="masthead-stats">
                                <div className="masthead-stats__item">
                                    <svg className="masthead-stats__icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 15V3" />
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                        <path d="m7 10 5 5 5-5" />
                                    </svg>

                                    <div className="masthead-stats__quantity">{project.downloads}</div>
                                </div>

                                <div className="masthead-stats__divider">•</div>

                                <div className="masthead-stats__item">
                                    <svg className="masthead-stats__icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />
                                    </svg>

                                    <div className="masthead-stats__quantity">{followers}</div>
                                </div>

                                {project.tags && (
                                    <>
                                        <div className="masthead-stats__divider">•</div>

                                        <div className="masthead-tags">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-tags-icon lucide-tags"><path d="M13.172 2a2 2 0 0 1 1.414.586l6.71 6.71a2.4 2.4 0 0 1 0 3.408l-4.592 4.592a2.4 2.4 0 0 1-3.408 0l-6.71-6.71A2 2 0 0 1 6 9.172V3a1 1 0 0 1 1-1z"/><path d="M2 7v6.172a2 2 0 0 0 .586 1.414l6.71 6.71a2.4 2.4 0 0 0 3.191.193"/><circle cx="10.5" cy="6.5" r=".5" fill="currentColor"/></svg>

                                            <ProjectTags tags={project.tags} limit={3} totalCount={mastheadTagsCount} tagClassName="masthead-tag" popoverAlign="left" />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="masthead-buttons">
                    {user && project.user_id === user.id && (
                        <Link className="button button--size-m button--type-secondary" href={`/mod/${project.slug}/settings`}>
                            {t("editSettings")}
                        </Link>
                    )}

                    <button className={`button--like ${isLiked ? "active" : ""}`} onClick={handleLikeToggle} style={{ cursor: isLoggedIn ? "pointer" : "not-allowed" }}>
                        {isLiked ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon lucide-heart"><path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"/></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon lucide-heart"><path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"/></svg>
                        )}
                    </button>

                    <div style={{ position: "relative" }} ref={actionsRef}>
                        <button className="icon-button" type="button" aria-label={t("report.moreActions")} aria-expanded={isActionsOpen} onClick={() => setIsActionsOpen((prev) => !prev)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon lucide lucide-ellipsis-vertical-icon lucide-ellipsis-vertical">
                                <circle cx="12" cy="12" r="1"></circle>
                                <circle cx="12" cy="5" r="1"></circle>
                                <circle cx="12" cy="19" r="1"></circle>
                            </svg>
                        </button>

                        {isActionsOpen && (
                            <div id="popover-overlay" className="popover-overlay">
                                <div className="popover" tabIndex={0} style={{ "--width": "240px", "--top": "46px", "--position": "absolute", "--left": "auto", "--right": "0", "--bottom": "auto", "--distance": "8px" }}>
                                    <div className="popover__scrollable" style={{ "--max-height": "auto" }}>
                                        <button style={{ width: "100%" }} type="button" className="context-list-option" onClick={handleCopyProjectLink}>
                                            <div className="context-list-option__label" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                <svg style={{ fill: "none" }} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link-icon lucide-link"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>

                                                <span>{t("report.copyLink")}</span>
                                            </div>
                                        </button>

                                        <button style={{ width: "100%" }} type="button" className={`context-list-option ${reportStatus.hasReported ? "context-list-option--selected" : ""}`} onClick={openReportModal} disabled={reportStatus.hasReported || reportStatus.loading}>
                                            <div className="context-list-option__label" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                <svg style={{ fill: "none" }} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-flag-icon lucide-flag"><path d="M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528"/></svg>

                                                <span>{reportStatus.hasReported ? t("report.alreadySubmitted") : t("report.openModal")}</span>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <ProjectReportModal isOpen={isReportModalOpen} onRequestClose={() => setIsReportModalOpen(false)} projectSlug={project.slug} authToken={authToken} onSubmitted={handleReportSubmitted} />
        </>
    );
}