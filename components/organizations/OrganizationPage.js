"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import ProjectCard from "@/components/project/ProjectCard";
import { useAuth } from "../providers/AuthProvider";
import ImageLightbox, { useImageLightbox } from "@/components/ui/ImageLightbox";
import UserName from "@/components/ui/UserName";
import Tooltip from "@/components/ui/Tooltip";

export default function OrganizationPage({ organization, members = [], projects = [], my_permissions = null }) {
    const t = useTranslations("Organizations");
    const tLinks = useTranslations("Organizations.settings.links");
    const locale = useLocale();
    const { isLoggedIn, user } = useAuth();
    const { lightboxOpen, lightboxImage, closeLightbox, getLightboxTriggerProps } = useImageLightbox();
    const canEditOrganization = Boolean(
        isLoggedIn && (
            my_permissions?.is_owner ||
            my_permissions?.organization_permissions?.includes("organization_edit_details") ||
            (user?.id && Number(user.id) === Number(organization?.owner_user_id))
        )
    );

    if(!organization) {
        return null;
    }

    const createdAtDate = Number(organization.created_at) > 0 ? new Date(Number(organization.created_at) * 1000) : null;
    const formattedCreatedAt = createdAtDate ? createdAtDate.toLocaleString(locale || undefined, {
        day: "numeric",
        month: "short",
    }) : null;

    return (
        <>
            <div className="layout">
                <div className="browse-page">
                    <div className="subsite-content">
                        <div className="subsite-header">
                            <div className="subsite-header__padding">
                                <div className="subsite-header__header">
                                    <div className="subsite-avatar subsite-header__avatar" style={{ borderRadius: "12px" }}>
                                        <div className="andropov-media andropov-media--rounded andropov-media--bordered andropov-media--cropped andropov-image andropov-image--zoom subsite-avatar__image" style={{ aspectRatio: "1.5 / 1", maxWidth: "none", borderRadius: "12px" }} aria-label={t("page.openAvatar")} {...getLightboxTriggerProps({ url: organization.icon_url || "https://media.modifold.com/static/no-project-icon.svg", title: organization.name })}>
                                            <img className="magnify" src={organization.icon_url || "https://media.modifold.com/static/no-project-icon.svg"} alt={organization.name} />
                                        </div>
                                    </div>

                                    {canEditOrganization && (
                                        <div className="subsite-header__controls">
                                            <Link href={`/organization/${organization.slug}/settings`} className="button button--size-m button--type-minimal button--active-transform">
                                                {t("page.edit")}
                                            </Link>
                                        </div>
                                    )}
                                </div>

                                <h1 className="subsite-header__name">{organization.name}</h1>
                                
                                <span className="badge--developer" style={{ width: "fit-content", marginBottom: "8px" }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-building2-icon lucide-building-2">
                                        <path d="M10 12h4"></path>
                                        <path d="M10 8h4"></path>
                                        <path d="M14 21v-3a2 2 0 0 0-4 0v3"></path>
                                        <path d="M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2"></path>
                                        <path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"></path>
                                    </svg>

                                    {t("page.organizationBadge")}
                                </span>
                                
                                <p className="subsite-header__description">{organization.summary}</p>

                                {formattedCreatedAt && (
                                    <div className="subsite-header__cols">
                                        <div className="subsite-header__date-created">{t("page.dateCreated", { date: formattedCreatedAt })}</div>
                                    </div>
                                )}
                                
                                <div className="subsite-followers">
                                    <div className="subsite-followers__item">
                                        <span>{members.length}</span> {t("page.membersCount", { count: members.length })}
                                    </div>

                                    <div className="subsite-followers__item">
                                        <span>{projects.length}</span> {t("page.projectsCount", { count: projects.length })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="content content--padding">
                            <h2>{t("page.membersTitle")}</h2>
                            
                            <div style={{ display: "grid", gap: "10px" }}>
                                {members.map((member) => {
                                    const isOwnerMember = Number(member.user_id) === Number(organization.owner_user_id);

                                    return (
                                        <div key={member.user_id} className="author author-card" style={{ "--1ebedaf6": "40px" }}>
                                            <Link href={`/user/${member.slug}`} className="author__avatar button--active-transform">
                                                <div className="andropov-media andropov-media--rounded andropov-media--bordered andropov-media--loaded andropov-media--has-preview andropov-image" style={{ aspectRatio: "1.77778 / 1", width: "40px", height: "40px", maxWidth: "none" }}>
                                                    <img src={member.avatar || "https://media.modifold.com/static/no-project-icon.svg"} className="magnify" alt={member.username} />
                                                </div>
                                            </Link>

                                            <div className="author__main">
                                                <Link href={`/user/${member.slug}`} className="author__name">
                                                    <UserName user={member} />
                                                </Link>
                                            </div>

                                            <div className="author__details" style={{ display: "flex", alignItems: "center", overflow: "visible" }}>
                                                <span>{member.role}</span>

                                                {isOwnerMember && (
                                                    <Tooltip content={t("page.organizationOwnerTooltip")}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="lucide lucide-crown" viewBox="0 0 24 24" style={{ color: "#e08325", verticalAlign: "middle", fill: "none" }}>
                                                            <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7z"></path>
                                                            <path d="M5 20h14"></path>
                                                        </svg>
                                                    </Tooltip>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {(organization.discord_url || organization.website_url || organization.twitter_url || organization.bluesky_url || organization.telegram_url || organization.youtube_url) && (
                            <div className="content content--padding">
                                <h2>{tProject("links")}</h2>

                                <ul className="links-list">
                                    {organization.discord_url && (
                                        <li>
                                            <a href={organization.discord_url} target="_blank" rel="noopener noreferrer">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="71" height="55" fill="none" viewBox="0 0 71 55" className="shrink" aria-hidden="true"><g clipPath="url(#a)"><path fill="currentColor" d="M60.105 4.898A58.6 58.6 0 0 0 45.653.415a.22.22 0 0 0-.233.11 41 41 0 0 0-1.8 3.697c-5.456-.817-10.885-.817-16.23 0-.485-1.164-1.201-2.587-1.828-3.697a.23.23 0 0 0-.233-.11 58.4 58.4 0 0 0-14.451 4.483.2.2 0 0 0-.095.082C1.578 18.73-.944 32.144.293 45.39a.24.24 0 0 0 .093.167c6.073 4.46 11.955 7.167 17.729 8.962a.23.23 0 0 0 .249-.082 42 42 0 0 0 3.627-5.9.225.225 0 0 0-.123-.312 39 39 0 0 1-5.539-2.64.228.228 0 0 1-.022-.378c.372-.279.744-.569 1.1-.862a.22.22 0 0 1 .23-.03c11.619 5.304 24.198 5.304 35.68 0a.22.22 0 0 1 .233.027c.356.293.728.586 1.103.865a.228.228 0 0 1-.02.378 36.4 36.4 0 0 1-5.54 2.637.227.227 0 0 0-.121.315 47 47 0 0 0 3.624 5.897.225.225 0 0 0 .249.084c5.801-1.794 11.684-4.502 17.757-8.961a.23.23 0 0 0 .092-.164c1.48-15.315-2.48-28.618-10.497-40.412a.18.18 0 0 0-.093-.084m-36.38 32.427c-3.497 0-6.38-3.211-6.38-7.156s2.827-7.156 6.38-7.156c3.583 0 6.438 3.24 6.382 7.156 0 3.945-2.827 7.156-6.381 7.156m23.593 0c-3.498 0-6.38-3.211-6.38-7.156s2.826-7.156 6.38-7.156c3.582 0 6.437 3.24 6.38 7.156 0 3.945-2.798 7.156-6.38 7.156"></path></g><defs><clipPath id="a"><path fill="#fff" d="M0 0h71v55H0z"></path></clipPath></defs></svg>

                                                {tLinks("fields.discord")}

                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
                                            </a>
                                        </li>
                                    )}

                                    {organization.website_url && (
                                        <li>
                                            <a href={organization.website_url} target="_blank" rel="noopener noreferrer">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a15.3 15.3 0 0 1 4 9 15.3 15.3 0 0 1-4 9 15.3 15.3 0 0 1-4-9 15.3 15.3 0 0 1 4-9"/></svg>

                                                {tLinks("fields.website")}

                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
                                            </a>
                                        </li>
                                    )}

                                    {organization.twitter_url && (
                                        <li>
                                            <a href={organization.twitter_url} target="_blank" rel="noopener noreferrer">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path d="m4 4 7.2 9.6L4 20h3.5l5.2-4.9L16 20h4l-7.6-10 7.1-6h-3.4l-4.6 4.3L8 4z"/></svg>

                                                {tLinks("fields.twitter")}

                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
                                            </a>
                                        </li>
                                    )}

                                    {organization.bluesky_url && (
                                        <li>
                                            <a href={organization.bluesky_url} target="_blank" rel="noopener noreferrer">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4c3 2 6 6 6 6s3-4 6-6c1.4-1 3.2 0 2.8 1.7-.5 2.3-2.5 5-5.8 7 3.3 2 5.3 4.7 5.8 7 .4 1.7-1.4 2.7-2.8 1.7-3-2-6-6-6-6s-3 4-6 6c-1.4 1-3.2 0-2.8-1.7.5-2.3 2.5-5 5.8-7-3.3-2-5.3-4.7-5.8-7C2.8 4 4.6 3 6 4z"/></svg>

                                                {tLinks("fields.bluesky")}

                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
                                            </a>
                                        </li>
                                    )}

                                    {organization.telegram_url && (
                                        <li>
                                            <a href={organization.telegram_url} target="_blank" rel="noopener noreferrer">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path d="m3 11 18-8-6.5 18-3-6-3.5-3z"/><path d="M9 12.5 21 3"/></svg>

                                                {tLinks("fields.telegram")}

                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
                                            </a>
                                        </li>
                                    )}

                                    {organization.youtube_url && (
                                        <li>
                                            <a href={organization.youtube_url} target="_blank" rel="noopener noreferrer">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="6" width="20" height="12" rx="3"/><path d="m10 9 5 3-5 3z"/></svg>

                                                {tLinks("fields.youtube")}

                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
                                            </a>
                                        </li>
                                    )}
                                </ul>
                            </div>
                        )}
                    </div>

                    <div className="browse-content">
                        {projects.length > 0 ? (
                            <div className="browse-project-list">
                                {projects.map((project) => (
                                    <ProjectCard
                                        key={project.id}
                                        project={{
                                            ...project,
                                            owner: {
                                                username: organization.name,
                                                slug: organization.slug,
                                                avatar: organization.icon_url || "https://media.modifold.com/static/no-project-icon.svg",
                                                type: "organization",
                                                profile_url: `/organization/${organization.slug}`,
                                            },
                                        }}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="subsite-empty-feed">
                                <p className="subsite-empty-feed__title">{t("page.emptyProjects")}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ImageLightbox isOpen={lightboxOpen} image={lightboxImage} onClose={closeLightbox} dialogLabel={t("page.lightboxLabel")} closeLabel={t("page.close")} openInNewTabLabel={t("page.openInNewTab")} fallbackAlt={organization.name} />
        </>
    );
}
