"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "../providers/AuthProvider";
import { useTranslations } from "next-intl";
import ProjectTags from "../ui/ProjectTags";
const DEFAULT_PROJECT_ICON_URL = "https://media.modifold.com/static/no-project-icon.svg";

export default function ProjectMasthead({ project, authToken }) {
    const t = useTranslations("ProjectPage");
    const { isLoggedIn, user } = useAuth();
    const [followers, setFollowers] = useState(project.followers || 0);
    const [isLiked, setIsLiked] = useState(project.is_liked || false);
    const mastheadTagsCount = project.tags_count ?? project.tagsCount ?? project.total_tags ?? project.totalTags;

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

    return (
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
            </div>
        </section>
    );
}