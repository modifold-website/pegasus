"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import ProjectCard from "@/components/project/ProjectCard";
import { useAuth } from "../providers/AuthProvider";
import ImageLightbox, { useImageLightbox } from "@/components/ui/ImageLightbox";
import UserName from "@/components/ui/UserName";

const DEFAULT_ICON_URL = "https://media.modifold.com/static/no-project-icon.svg";

export default function OrganizationPage({ organization, members = [], projects = [], my_permissions = null }) {
    const t = useTranslations("Organizations");
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
                    <div style={{ width: "300px", maxWidth: "300px", display: "grid", gap: "12px" }}>
                        <div className="subsite-header">
                            <div className="subsite-header__padding">
                                <div className="subsite-header__header">
                                    <div className="subsite-avatar subsite-header__avatar">
                                        <div className="andropov-media andropov-media--rounded andropov-media--bordered andropov-media--cropped andropov-image andropov-image--zoom subsite-avatar__image" style={{ aspectRatio: "1.5 / 1", maxWidth: "none" }} aria-label={t("page.openAvatar")} {...getLightboxTriggerProps({ url: organization.icon_url || DEFAULT_ICON_URL, title: organization.name })}>
                                            <img className="magnify" src={organization.icon_url || DEFAULT_ICON_URL} alt={organization.name} />
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
                                {members.map((member) => (
                                    <div key={member.user_id} className="author author-card" style={{ "--1ebedaf6": "40px" }}>
                                        <Link href={`/user/${member.slug}`} className="author__avatar">
                                            <div className="andropov-media andropov-media--rounded andropov-media--bordered andropov-media--loaded andropov-media--has-preview andropov-image" style={{ aspectRatio: "1.77778 / 1", width: "40px", height: "40px", maxWidth: "none" }}>
                                                <img src={member.avatar || DEFAULT_ICON_URL} className="magnify" alt={member.username} />
                                            </div>
                                        </Link>

                                        <div className="author__main">
                                            <Link href={`/user/${member.slug}`} className="author__name">
                                                <UserName user={member} />
                                            </Link>
                                        </div>

                                        <div className="author__details">{member.role}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
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
                                                avatar: organization.icon_url || DEFAULT_ICON_URL,
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