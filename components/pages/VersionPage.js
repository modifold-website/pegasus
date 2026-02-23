"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import Modal from "react-modal";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../../components/providers/AuthProvider";
import VersionDisplay from "../VersionDisplay";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ProjectMasthead from "../project/ProjectMasthead";
import ProjectTabs from "../project/ProjectTabs";
import ProjectSidebar from "../project/ProjectSidebar";

const gameVersions = [
    "1.0",
];

const loaders = ["Vanilla"];

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
    const router = useRouter();
    const { user } = useAuth();
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        version_number: version.version_number || "",
        changelog: version.changelog || "",
        release_channel: version.release_channel || "release",
        game_versions: version.game_versions ? version.game_versions : [],
        loaders: version.loaders ? version.loaders : [],
    });
    const [isGameVersionsPopoverOpen, setIsGameVersionsPopoverOpen] = useState(false);
    const [isLoadersPopoverOpen, setIsLoadersPopoverOpen] = useState(false);
    const gameVersionsRef = useRef(null);
    const loadersRef = useRef(null);
    const [loading, setLoading] = useState(false);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(locale, { day: "numeric", month: "short" });
    };

    const isCurrentMember = project.user_id === user?.id;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if(gameVersionsRef.current && !gameVersionsRef.current.contains(event.target)) {
                setIsGameVersionsPopoverOpen(false);
            }

            if(loadersRef.current && !loadersRef.current.contains(event.target)) {
                setIsLoadersPopoverOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleGameVersionsPopover = () => {
        setIsGameVersionsPopoverOpen((prev) => !prev);
    };

    const toggleLoadersPopover = () => {
        setIsLoadersPopoverOpen((prev) => !prev);
    };

    const handleToggleGameVersion = (version) => {
        setFormData((prev) => ({
            ...prev,
            game_versions: prev.game_versions.includes(version) ? prev.game_versions.filter((v) => v !== version) : [...prev.game_versions, version],
        }));
    };

    const handleToggleLoader = (loader) => {
        setFormData((prev) => ({
            ...prev,
            loaders: prev.loaders.includes(loader) ? prev.loaders.filter((l) => l !== loader) : [...prev.loaders, loader],
        }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const closeEditModal = () => {
        setEditModalOpen(false);
        setFormData({
            version_number: version.version_number || "",
            changelog: version.changelog || "",
            release_channel: version.release_channel || "release",
            game_versions: version.game_versions ? version.game_versions : [],
            loaders: version.loaders ? version.loaders : [],
        });
        setIsGameVersionsPopoverOpen(false);
        setIsLoadersPopoverOpen(false);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if(formData.game_versions.length === 0 || formData.loaders.length === 0) {
            toast.error(t("fillRequiredFields"));
            return;
        }

        setLoading(true);
        const formDataToSend = new FormData();
        formDataToSend.append("version_number", formData.version_number);
        formDataToSend.append("changelog", formData.changelog);
        formDataToSend.append("release_channel", formData.release_channel);
        formDataToSend.append("game_versions", JSON.stringify(formData.game_versions));
        formDataToSend.append("loaders", JSON.stringify(formData.loaders));
        if(e.target.file.files[0]) {
            formDataToSend.append("file", e.target.file.files[0]);
        }

        try {
            await axios.put(`${process.env.NEXT_PUBLIC_API_BASE}/projects/${project.slug}/versions/${version.id}`, formDataToSend, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            toast.success(t("versionUpdated"));
            router.push(`/mod/${project.slug}/version/${version.id}`);
            setEditModalOpen(false);
        } catch (err) {
            toast.error(err.response?.data?.message || t("errorOccurred"));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if(!confirm(t("confirmDeleteVersion"))) {
            return;
        }

        setLoading(true);

        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE}/projects/${project.slug}/versions/${version.id}`, {
                headers: { Authorization: `Bearer ${authToken}` },
            });

            toast.success(t("versionDeleted"));
            router.push(`/mod/${project.slug}/versions`);
        } catch (err) {
            toast.error(err.response?.data?.message || t("errorOccurred"));
        } finally {
            setLoading(false);
        }
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
                                            <a className="button button--size-m button--type-primary" href={`${process.env.NEXT_PUBLIC_API_BASE}/projects/${project.slug}/versions/${version.id}/download`}>
                                                <svg className="masthead-stats__icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M12 15V3" />
                                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                    <path d="m7 10 5 5 5-5" />
                                                </svg>{t("download")}
                                            </a>
                                        )}

                                        {isCurrentMember && (
                                            <>
                                                <button className="button button--size-m button--type-secondary" onClick={() => setEditModalOpen(true)}>
                                                    {t("editVersion")}
                                                </button>

                                                <button className="button button--size-m button--type-negative" onClick={handleDelete} disabled={loading}>
                                                    {t("delete")}
                                                </button>
                                            </>
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

                                            <a style={{ marginLeft: "auto", "--button-radius": "100px", "--button-padding": "0 16px" }} className="button button--size-m button--type-primary" href={`${process.env.NEXT_PUBLIC_API_BASE}/projects/${project.slug}/versions/${version.id}/download`}>{t("download")}</a>
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
                                        )) : <span>{t("notSpecified")}</span>}
                                    </div>

                                    <div>
                                        <strong>Channel</strong>
                                        {version.release_channel || t("notSpecified")}
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

                <Modal isOpen={editModalOpen} onRequestClose={closeEditModal} className="modal active" overlayClassName="modal-overlay">
                    <div className="modal-window">
                        <div className="modal-window__header">
                            <span>{t("editVersion")}</span>
                            <button className="icon-button modal-window__close" type="button" onClick={closeEditModal} disabled={loading}>
                                <svg className="icon icon--cross" height="24" width="24">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M5.293 5.293a1 1 0 0 1 1.414 0L12 10.586l5.293-5.293a1 1 0 0 1 1.414 1.414L13.414 12l5.293 5.293a1 1 0 0 1-1.414 1.414L12 13.414l-5.293 5.293a1 1 0 0 1-1.414-1.414L10.586 12 5.293 6.707a1 1 0 0 1 0-1.414Z" />
                                </svg>
                            </button>
                        </div>

                        <div className="modal-window__content">
                            <form onSubmit={handleUpdate}>
                                <p className="blog-settings__field-title">{t("versionNumber")}</p>
                                <div className="field field--default blog-settings__input">
                                    <label className="field__wrapper">
                                        <input type="text" name="version_number" value={formData.version_number} onChange={handleInputChange} className="text-input" required disabled={loading} />
                                    </label>
                                </div>

                                <p className="blog-settings__field-title">{t("changelog")}</p>
                                <div className="field field--default textarea blog-settings__input">
                                    <label className="field__wrapper">
                                        <textarea name="changelog" value={formData.changelog} onChange={handleInputChange} className="autosize textarea__input" style={{ height: "256px" }} disabled={loading} />
                                    </label>
                                </div>

                                <p className="blog-settings__field-title">{t("releaseChannel")}</p>
                                <div className="field field--default blog-settings__input">
                                    <label className="field__wrapper">
                                        <select name="release_channel" value={formData.release_channel} onChange={handleInputChange} className="text-input" disabled={loading}>
                                            <option value="release">{t("releaseChannels.release")}</option>
                                            <option value="beta">{t("releaseChannels.beta")}</option>
                                            <option value="alpha">{t("releaseChannels.alpha")}</option>
                                        </select>
                                    </label>
                                </div>

                                <p className="blog-settings__field-title">{t("gameVersions")}</p>
                                <div className="field field--default blog-settings__input" ref={gameVersionsRef}>
                                    <button type="button" className="button button--size-m button--type-secondary" onClick={toggleGameVersionsPopover} disabled={loading}>
                                        {t("selectGameVersions")} ({formData.game_versions.length})
                                    </button>

                                    {isGameVersionsPopoverOpen && (
                                        <div className="popover">
                                            {gameVersions.map((version) => (
                                                <label key={version} className="popover-item">
                                                    <input type="checkbox" checked={formData.game_versions.includes(version)} onChange={() => handleToggleGameVersion(version)} disabled={loading} />
                                                    {version}
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <p className="blog-settings__field-title">{t("loaders")}</p>
                                <div className="field field--default blog-settings__input" ref={loadersRef}>
                                    <button type="button" className="button button--size-m button--type-secondary" onClick={toggleLoadersPopover} disabled={loading}>
                                        {t("selectLoaders")} ({formData.loaders.length})
                                    </button>

                                    {isLoadersPopoverOpen && (
                                        <div className="popover">
                                            {loaders.map((loader) => (
                                                <label key={loader} className="popover-item">
                                                    <input type="checkbox" checked={formData.loaders.includes(loader)} onChange={() => handleToggleLoader(loader)} disabled={loading} />
                                                    {loader}
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <p className="blog-settings__field-title">{t("file")}</p>
                                <div className="field field--default blog-settings__input">
                                    <label className="field__wrapper">
                                        <input type="file" name="file" accept=".jar,.zip,.litemod,.mrpack" className="text-input" disabled={loading} />
                                    </label>
                                </div>

                                <div style={{ display: "flex", gap: "8px", marginTop: "18px" }}>
                                    <button type="submit" className="button button--size-m button--type-primary" disabled={loading}>
                                        {loading ? t("updating") : t("update")}
                                    </button>

                                    <button type="button" className="button button--size-m button--type-negative" onClick={handleDelete} disabled={loading}>
                                        {t("delete")}
                                    </button>

                                    <button type="button" className="button button--size-m button--type-secondary" onClick={closeEditModal} disabled={loading}>
                                        {t("cancel")}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </Modal>
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
