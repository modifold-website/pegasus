"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import LicenseModal from "../../modal/LicenseModal";
import UserName from "../ui/UserName";

export default function ProjectSidebar({ project, showLicense = true, showLinks = true }) {
    const t = useTranslations("ProjectPage");
    const locale = useLocale();
    const [showLicenseModal, setShowLicenseModal] = useState(false);
    const licenseToken = "__LICENSE__";
    const licenseName = project?.license?.name || t("LicenseModal.unknown");
    const licensedAs = t("licensedAs", { license: licenseToken });
    const [licensedAsBefore, licensedAsAfter = ""] = licensedAs.split(licenseToken);
    const licensedHasToken = licensedAs.includes(licenseToken);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(locale, { day: "numeric", month: "short" });
    };

    return (
        <div style={{ display: "flex", gap: "12px", flexDirection: "column" }}>
            <div className="content content--padding">
                <h2>{t("creators")}</h2>

                <div style={{ display: "flex", gap: "12px", flexDirection: "column" }}>
                    {project.members && project.members.length > 0 ? (
                        project.members.map((member) => (
                            <div key={member.user_id} className="author author-card" style={{ "--1ebedaf6": "40px" }}>
                                <Link className="author__avatar" href={`/user/${member.slug}`}>
                                    <div className="andropov-media andropov-media--rounded andropov-media--bordered andropov-media--loaded andropov-media--has-preview andropov-image" style={{ aspectRatio: "1.77778 / 1", width: "40px", height: "40px", maxWidth: "none" }}>
                                        <img src={member.avatar} className="magnify" alt={t("ownerAvatarAlt", { username: member.username })} />
                                    </div>
                                </Link>

                                <div className="author__main">
                                    <Link className="author__name" href={`/user/${member.slug}`}>
                                        <UserName user={member} />
                                    </Link>
                                </div>

                                <div className="author__details">
                                    <div className="comment__detail" style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                                        <time style={{ lineHeight: "normal" }}>{member.role}</time>
                                        
                                        {project.owner.slug === member.slug && (
                                            <svg style={{ fill: "none", color: "#f0a530" }} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-crown-icon lucide-crown">
                                                <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z" />
                                                <path d="M5 21h14" />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="author author-card" style={{ "--1ebedaf6": "40px" }}>
                            <Link className="author__avatar" href={`/user/${project.owner.slug}`}>
                                <div className="andropov-media andropov-media--rounded andropov-media--bordered andropov-media--loaded andropov-media--has-preview andropov-image" style={{ aspectRatio: "1.77778 / 1", width: "40px", height: "40px", maxWidth: "none" }}>
                                    <img src={project.owner.avatar} className="magnify" alt={t("ownerAvatarAlt", { username: project.owner.username })} />
                                </div>
                            </Link>

                            <div className="author__main">
                                <Link className="author__name" href={`/user/${project.owner.slug}`}>
                                    <UserName user={project.owner} />
                                </Link>
                            </div>

                            <div className="author__details">
                                <div className="comment__detail" style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                                    <time style={{ lineHeight: "normal" }}>{t("owner")}</time>
                                    
                                    <svg style={{ fill: "none", color: "#f0a530" }} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-crown-icon lucide-crown">
                                        <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z" />
                                        <path d="M5 21h14" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="project-info">
                    <div className="project-info__date">
                        <span>{t("created")}</span>
                        <p>{formatDate(project.created_at)}</p>
                    </div>

                    <div className="project-info__id">
                        <span>{t("id")}</span>
                        <p>{project.id}</p>
                    </div>
                </div>
            </div>

            {showLicense && project?.license?.id && (
                <>
                    <div className="content content--padding">
                        <h2>{t("licenseTitle")}</h2>

                        <div className="license">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-copyright-icon lucide-copyright"><circle cx="12" cy="12" r="10"/><path d="M14.83 14.83a4 4 0 1 1 0-5.66"/></svg>
                        
                            <span>
                                {licensedHasToken ? (
                                    <>
                                        {licensedAsBefore}
                                        <span style={{ color: "#1f68c0", cursor: "pointer" }} onClick={() => setShowLicenseModal(true)}>
                                            {licenseName}
                                        </span>
                                        {licensedAsAfter}
                                    </>
                                ) : (
                                    <>
                                        {licensedAs}{" "}
                                        <span style={{ color: "#1f68c0", cursor: "pointer" }} onClick={() => setShowLicenseModal(true)}>
                                            {licenseName}
                                        </span>
                                    </>
                                )}
                            </span>
                        </div>
                    </div>

                    <LicenseModal isOpen={showLicenseModal} licenseId={project?.license?.id} onRequestClose={() => setShowLicenseModal(false)} />
                </>
            )}

            {showLinks && (project.issue_url || project.source_url || project.wiki_url || project.discord_url) && (
                <div className="content content--padding">
                    <h2>{t("links")}</h2>

                    <ul className="links-list">
                        {project.issue_url && (
                            <li>
                                <a href={project.issue_url} target="_blank" rel="noopener noreferrer">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0M12 9v4M12 17h.01"></path></svg>
                                    
                                    {t("reportIssues")}

                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
                                </a>
                            </li>
                        )}

                        {project.source_url && (
                            <li>
                                <a href={project.source_url} target="_blank" rel="noopener noreferrer">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m10 20 4-16m4 4 4 4-4 4M6 16l-4-4 4-4"></path></svg>
                                    
                                    {t("viewSource")}

                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
                                </a>
                            </li>
                        )}

                        {project.wiki_url && (
                            <li>
                                <a href={project.wiki_url} target="_blank" rel="noopener noreferrer">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                                    
                                    {t("wiki")}

                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
                                </a>
                            </li>
                        )}

                        {project.discord_url && (
                            <li>
                                <a href={project.discord_url} target="_blank" rel="noopener noreferrer">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="71" height="55" fill="none" viewBox="0 0 71 55" className="shrink" aria-hidden="true"><g clipPath="url(#a)"><path fill="currentColor" d="M60.105 4.898A58.6 58.6 0 0 0 45.653.415a.22.22 0 0 0-.233.11 41 41 0 0 0-1.8 3.697c-5.456-.817-10.885-.817-16.23 0-.485-1.164-1.201-2.587-1.828-3.697a.23.23 0 0 0-.233-.11 58.4 58.4 0 0 0-14.451 4.483.2.2 0 0 0-.095.082C1.578 18.73-.944 32.144.293 45.39a.24.24 0 0 0 .093.167c6.073 4.46 11.955 7.167 17.729 8.962a.23.23 0 0 0 .249-.082 42 42 0 0 0 3.627-5.9.225.225 0 0 0-.123-.312 39 39 0 0 1-5.539-2.64.228.228 0 0 1-.022-.378c.372-.279.744-.569 1.1-.862a.22.22 0 0 1 .23-.03c11.619 5.304 24.198 5.304 35.68 0a.22.22 0 0 1 .233.027c.356.293.728.586 1.103.865a.228.228 0 0 1-.02.378 36.4 36.4 0 0 1-5.54 2.637.227.227 0 0 0-.121.315 47 47 0 0 0 3.624 5.897.225.225 0 0 0 .249.084c5.801-1.794 11.684-4.502 17.757-8.961a.23.23 0 0 0 .092-.164c1.48-15.315-2.48-28.618-10.497-40.412a.18.18 0 0 0-.093-.084m-36.38 32.427c-3.497 0-6.38-3.211-6.38-7.156s2.827-7.156 6.38-7.156c3.583 0 6.438 3.24 6.382 7.156 0 3.945-2.827 7.156-6.381 7.156m23.593 0c-3.498 0-6.38-3.211-6.38-7.156s2.826-7.156 6.38-7.156c3.582 0 6.437 3.24 6.38 7.156 0 3.945-2.798 7.156-6.38 7.156"></path></g><defs><clipPath id="a"><path fill="#fff" d="M0 0h71v55H0z"></path></clipPath></defs></svg>
                                    
                                    {t("joinDiscord")}

                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
                                </a>
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}