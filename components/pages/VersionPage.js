"use client";

import { useTranslations, useLocale } from "next-intl";
import Modal from "react-modal";
import VersionDisplay from "../VersionDisplay";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ProjectMasthead from "../project/ProjectMasthead";
import ProjectTabs from "../project/ProjectTabs";
import ProjectSidebar from "../project/ProjectSidebar";
import showOverTheTopDownloadAnimation from "../ui/showOverTheTopDownloadAnimation";

Modal.setAppElement("body");

const getSafeMarkdownHref = (href) => {
    if(typeof href !== "string") {
        return null;
    }

    if(href.startsWith("/") || href.startsWith("#")) {
        return href;
    }

    try {
        const parsed = new URL(href);
        if(!["http:", "https:", "mailto:"].includes(parsed.protocol)) {
            return null;
        }

        return parsed.toString();
    } catch {
        return null;
    }
};

export default function VersionPage({ project, version, authToken }) {
    const t = useTranslations("ProjectPage");
    const locale = useLocale();

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(locale, { day: "numeric", month: "short" });
    };

    const primaryFile = version.files?.find((file) => file.primary) || version.files?.[0];
    const featuredImage = project.gallery?.find((image) => image.featured === 1);

    return (
        <>
            {featuredImage && project.showProjectBackground === 1 && (
                <img src={featuredImage.url} className="fixed-background-teleport"></img>
            )}

            <div className="layout">
                <div className="project-page">
                    <ProjectMasthead project={project} authToken={authToken} />

                    <div className="project__general">
                        <div>
                            <ProjectTabs project={project} />

                            <div className="version-page">
                                <div className="version-page__title content content--padding">
                                    <div className="version-header">
                                        <h2>{version.name || version.version_number}</h2>
                                    </div>

                                    <div className="input-group">
                                        {primaryFile && (
                                            <a className="button button--size-m button--type-primary" href={`${process.env.NEXT_PUBLIC_API_BASE}/projects/${project.slug}/versions/${version.id}/download`} onClick={showOverTheTopDownloadAnimation}>
                                                <svg className="masthead-stats__icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M12 15V3" />
                                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                    <path d="m7 10 5 5 5-5" />
                                                </svg>{t("download")}
                                            </a>
                                        )}

                                    </div>
                                </div>
                                
                                <div className="version-page__changelog content content--padding">
                                    <h3>{t("changesTitle")}</h3>

                                    <div class="markdown-body">
                                        {version.changelog ? (
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                    a: ({ href, children }) => {
                                                        const safeHref = getSafeMarkdownHref(href);
                                                        if(!safeHref) {
                                                            return <>{children}</>;
                                                        }

                                                        const isExternal = /^https?:\/\//i.test(safeHref);
                                                        return (
                                                            <a href={safeHref} target={isExternal ? "_blank" : undefined} rel={isExternal ? "noopener noreferrer" : undefined}>
                                                                {children}
                                                            </a>
                                                        );
                                                    },
                                                }}
                                            >
                                                {version.changelog}
                                            </ReactMarkdown>
                                        ) : (
                                            <p>{t("noChanges")}</p>
                                        )}
                                    </div>
                                </div>

                                <div class="version-page__files content content--padding">
                                    <h3>{t("filesTitle")}</h3>

                                    {version.files?.map((file, index) => (
                                        <div key={index} className="file">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5z"></path><path d="M14 2v6h6"></path></svg>
                                            
                                            <span className="filename">
                                                {version.name || version.version_number}

                                                <span className="file-size">({formatBytes(file.size)})</span>
                                            </span>

                                            <a style={{ marginLeft: "auto", "--button-radius": "100px", "--button-padding": "0 16px" }} className="button button--size-m button--type-primary" href={`${process.env.NEXT_PUBLIC_API_BASE}/projects/${project.slug}/versions/${version.id}/download`} onClick={showOverTheTopDownloadAnimation}>{t("download")}</a>
                                        </div>
                                    )) || <span>{t("noFiles")}</span>}
                                </div>

                                <div className="version-page__metadata content content--padding">
                                    <h3>Metadata</h3>

                                    <div>
                                        <strong>Game Version</strong>

                                        <VersionDisplay gameVersions={version.game_versions ? version.game_versions : []} />
                                    </div>

                                    <div>
                                        <strong>Platform</strong>

                                        {version.loaders ? version.loaders.map((loader) => (
                                            <span key={loader} className="version__game-platform">
                                                {loader.trim()}
                                            </span>
                                        )) : <span>{t("versions.notSpecified")}</span>}
                                    </div>

                                    <div>
                                        <strong>Channel</strong>
                                        {version.release_channel || t("versions.notSpecified")}
                                    </div>

                                    <div>
                                        <strong>{t("versions.downloads")}</strong>
                                        {version.downloads}
                                    </div>

                                    <div>
                                        <strong>Uploaded</strong>
                                        {formatDate(version.created_at)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <ProjectSidebar project={project} />
                    </div>
                </div>
            </div>
        </>
    );
}

function formatBytes(bytes, decimals = 2) {
    if(bytes === 0) {
        return "0 Bytes";
    }

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}