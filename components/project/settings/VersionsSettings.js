"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslations } from "next-intl";
import Modal from "react-modal";
import axios from "axios";
import VersionDisplay from "../../VersionDisplay";
import ProjectSettingsSidebar from "@/components/ui/ProjectSettingsSidebar";

const gameVersions = [
    "1.0",
];

const loaders = [
    "Vanilla",
];

const releaseChannels = ["release", "beta", "alpha"];

Modal.setAppElement("body");

export default function VersionsSettings({ project, authToken }) {
    const t = useTranslations("SettingsProjectPage");
    const tProject = useTranslations("ProjectPage");

    const [showUpload, setShowUpload] = useState(false);

    const [formData, setFormData] = useState({
        version_number: "",
        changelog: "",
        release_channel: "release",
        game_versions: [],
        loaders: [],
    });

    const [isReleaseChannelPopoverOpen, setIsReleaseChannelPopoverOpen] = useState(false);
    const [isGameVersionsPopoverOpen, setIsGameVersionsPopoverOpen] = useState(false);
    const [isLoadersPopoverOpen, setIsLoadersPopoverOpen] = useState(false);
    const releaseChannelRef = useRef(null);
    const gameVersionsRef = useRef(null);
    const loadersRef = useRef(null);
    const uploadFileRef = useRef(null);

    const [isEditReleaseChannelPopoverOpen, setIsEditReleaseChannelPopoverOpen] = useState(false);
    const [isEditGameVersionsPopoverOpen, setIsEditGameVersionsPopoverOpen] = useState(false);
    const [isEditLoadersPopoverOpen, setIsEditLoadersPopoverOpen] = useState(false);
    const editReleaseChannelRef = useRef(null);
    const editGameVersionsRef = useRef(null);
    const editLoadersRef = useRef(null);

    const [isFilterGameVersionsPopoverOpen, setIsFilterGameVersionsPopoverOpen] = useState(false);
    const [isFilterChannelsPopoverOpen, setIsFilterChannelsPopoverOpen] = useState(false);
    const [isFilterLoadersPopoverOpen, setIsFilterLoadersPopoverOpen] = useState(false);
    const [filterGameVersions, setFilterGameVersions] = useState([]);
    const [filterChannels, setFilterChannels] = useState([]);
    const [filterLoaders, setFilterLoaders] = useState([]);

    const filterGameVersionsRef = useRef(null);
    const filterChannelsRef = useRef(null);
    const filterLoadersRef = useRef(null);

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingVersionId, setEditingVersionId] = useState(null);
    const [editLoading, setEditLoading] = useState(false);
    const [editFormData, setEditFormData] = useState({
        version_number: "",
        changelog: "",
        release_channel: "release",
        game_versions: [],
        loaders: [],
    });

    useEffect(() => {
        const handleClickOutside = (event) => {
            if(releaseChannelRef.current && !releaseChannelRef.current.contains(event.target)) {
                setIsReleaseChannelPopoverOpen(false);
            }

            if(gameVersionsRef.current && !gameVersionsRef.current.contains(event.target)) {
                setIsGameVersionsPopoverOpen(false);
            }

            if(loadersRef.current && !loadersRef.current.contains(event.target)) {
                setIsLoadersPopoverOpen(false);
            }

            if(editReleaseChannelRef.current && !editReleaseChannelRef.current.contains(event.target)) {
                setIsEditReleaseChannelPopoverOpen(false);
            }

            if(editGameVersionsRef.current && !editGameVersionsRef.current.contains(event.target)) {
                setIsEditGameVersionsPopoverOpen(false);
            }

            if(editLoadersRef.current && !editLoadersRef.current.contains(event.target)) {
                setIsEditLoadersPopoverOpen(false);
            }

            if(filterGameVersionsRef.current && !filterGameVersionsRef.current.contains(event.target)) {
                setIsFilterGameVersionsPopoverOpen(false);
            }

            if(filterChannelsRef.current && !filterChannelsRef.current.contains(event.target)) {
                setIsFilterChannelsPopoverOpen(false);
            }

            if(filterLoadersRef.current && !filterLoadersRef.current.contains(event.target)) {
                setIsFilterLoadersPopoverOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleReleaseChannelPopover = () => {
        setIsReleaseChannelPopoverOpen((prev) => !prev);
    };

    const toggleGameVersionsPopover = () => {
        setIsGameVersionsPopoverOpen((prev) => !prev);
    };

    const toggleLoadersPopover = () => {
        setIsLoadersPopoverOpen((prev) => !prev);
    };

    const toggleEditReleaseChannelPopover = () => {
        setIsEditReleaseChannelPopoverOpen((prev) => !prev);
    };

    const toggleEditGameVersionsPopover = () => {
        setIsEditGameVersionsPopoverOpen((prev) => !prev);
    };

    const toggleEditLoadersPopover = () => {
        setIsEditLoadersPopoverOpen((prev) => !prev);
    };

    const toggleFilterGameVersionsPopover = () => {
        setIsFilterGameVersionsPopoverOpen((prev) => !prev);
    };

    const toggleFilterChannelsPopover = () => {
        setIsFilterChannelsPopoverOpen((prev) => !prev);
    };

    const toggleFilterLoadersPopover = () => {
        setIsFilterLoadersPopoverOpen((prev) => !prev);
    };

    const handleToggleFilterGameVersion = (version) => {
        setFilterGameVersions((prev) => (prev.includes(version) ? prev.filter((v) => v !== version) : [...prev, version]));
    };

    const handleToggleFilterChannel = (channel) => {
        setFilterChannels((prev) => (prev.includes(channel) ? prev.filter((c) => c !== channel) : [...prev, channel]));
    };

    const handleToggleFilterLoader = (loader) => {
        const normalized = String(loader || "").toLowerCase();
        setFilterLoaders((prev) => (prev.includes(normalized) ? prev.filter((l) => l !== normalized) : [...prev, normalized]));
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

    const handleSelectReleaseChannel = (channel) => {
        setFormData((prev) => ({ ...prev, release_channel: channel }));
        setIsReleaseChannelPopoverOpen(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(formData.game_versions.length === 0 || formData.loaders.length === 0) {
            toast.error(t("versions.errors.selectVersionsAndLoaders"));
            return;
        }

        const formDataToSend = new FormData();
        formDataToSend.append("file", e.target.file.files[0]);
        formDataToSend.append("version_number", formData.version_number);
        formDataToSend.append("changelog", formData.changelog);
        formDataToSend.append("release_channel", formData.release_channel);
        formDataToSend.append("game_versions", JSON.stringify(formData.game_versions));
        formDataToSend.append("loaders", JSON.stringify(formData.loaders));

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/projects/${project.slug}/versions`, {
            method: "POST",
            headers: { Authorization: `Bearer ${authToken}` },
            body: formDataToSend,
        });

        if(response.ok) {
            toast.success(t("versions.success"));
            setShowUpload(false);
            resetUploadForm();
            try {
                await refreshVersions();
            } catch (err) {
                toast.error(tProject("errorOccurred"));
            }
        } else {
            toast.error(t("versions.errors.upload"));
        }
    };

    const openEditModal = async (versionId) => {
        setEditingVersionId(versionId);
        setEditModalOpen(true);
        setEditLoading(true);

        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/projects/${project.slug}/version/${versionId}`, {
                headers: { Accept: "application/json" },
            });

            const version = res.data;
            setEditFormData({
                version_number: version.version_number || "",
                changelog: version.changelog || "",
                release_channel: version.release_channel || "release",
                game_versions: Array.isArray(version.game_versions) ? version.game_versions : [],
                loaders: Array.isArray(version.loaders) ? version.loaders : [],
            });
        } catch (err) {
            toast.error(err.response?.data?.message || tProject("errorOccurred"));
            setEditModalOpen(false);
            setEditingVersionId(null);
        } finally {
            setEditLoading(false);
        }
    };

    const closeEditModal = () => {
        setEditModalOpen(false);
        setEditingVersionId(null);
        setEditLoading(false);
        setIsEditReleaseChannelPopoverOpen(false);
        setIsEditGameVersionsPopoverOpen(false);
        setIsEditLoadersPopoverOpen(false);
        setEditFormData({
            version_number: "",
            changelog: "",
            release_channel: "release",
            game_versions: [],
            loaders: [],
        });
    };

    const cancelUpload = () => {
        setShowUpload(false);
        resetUploadForm();
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleEditToggleGameVersion = (version) => {
        setEditFormData((prev) => ({
            ...prev,
            game_versions: prev.game_versions.includes(version) ? prev.game_versions.filter((v) => v !== version) : [...prev.game_versions, version],
        }));
    };

    const handleEditToggleLoader = (loader) => {
        setEditFormData((prev) => ({
            ...prev,
            loaders: prev.loaders.includes(loader) ? prev.loaders.filter((l) => l !== loader) : [...prev.loaders, loader],
        }));
    };

    const handleSelectEditReleaseChannel = (channel) => {
        setEditFormData((prev) => ({ ...prev, release_channel: channel }));
        setIsEditReleaseChannelPopoverOpen(false);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if(!editingVersionId) {
            return;
        }

        if(editFormData.game_versions.length === 0 || editFormData.loaders.length === 0) {
            toast.error(tProject("fillRequiredFields"));
            return;
        }

        setEditLoading(true);

        const formDataToSend = new FormData();
        formDataToSend.append("version_number", editFormData.version_number);
        formDataToSend.append("changelog", editFormData.changelog);
        formDataToSend.append("release_channel", editFormData.release_channel);
        formDataToSend.append("game_versions", JSON.stringify(editFormData.game_versions));
        formDataToSend.append("loaders", JSON.stringify(editFormData.loaders));
        if(e.target.file?.files?.[0]) {
            formDataToSend.append("file", e.target.file.files[0]);
        }

        try {
            await axios.put(`${process.env.NEXT_PUBLIC_API_BASE}/projects/${project.slug}/versions/${editingVersionId}`, formDataToSend, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            toast.success(tProject("versionUpdated"));
            closeEditModal();
            try {
                await refreshVersions();
            } catch (err) {
                toast.error(tProject("errorOccurred"));
            }
        } catch (err) {
            toast.error(err.response?.data?.message || tProject("errorOccurred"));
        } finally {
            setEditLoading(false);
        }
    };

    const handleDelete = async () => {
        if(!editingVersionId) {
            return;
        }

        if(!confirm(tProject("confirmDeleteVersion"))) {
            return;
        }

        setEditLoading(true);

        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE}/projects/${project.slug}/versions/${editingVersionId}`, {
                headers: { Authorization: `Bearer ${authToken}` },
            });

            toast.success(tProject("versionDeleted"));
            closeEditModal();

            try {
                await refreshVersions();
            } catch (err) {
                toast.error(tProject("errorOccurred"));
            }
        } catch (err) {
            toast.error(err.response?.data?.message || tProject("errorOccurred"));
        } finally {
            setEditLoading(false);
        }
    };
    const gameVersionsLabel = formData.game_versions.length > 0 ? t("versions.selectedGameVersions", { count: formData.game_versions.length }) : t("versions.selectGameVersions");
    const loadersLabel = formData.loaders.length > 0 ? t("versions.selectedLoaders", { count: formData.loaders.length }) : t("versions.selectLoaders");
    const releaseChannelLabel = t(`versions.releaseChannels.${formData.release_channel}`);
    const editGameVersionsLabel = editFormData.game_versions.length > 0 ? t("versions.selectedGameVersions", { count: editFormData.game_versions.length }) : t("versions.selectGameVersions");
    const editLoadersLabel = editFormData.loaders.length > 0 ? t("versions.selectedLoaders", { count: editFormData.loaders.length }) : t("versions.selectLoaders");
    const editReleaseChannelLabel = t(`versions.releaseChannels.${editFormData.release_channel}`);
    const [versions, setVersions] = useState(project?.versions || []);

    useEffect(() => {
        setVersions(project?.versions || []);
    }, [project?.versions]);

    const refreshVersions = async () => {
        const resProject = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/projects/${project.slug}`, {
            headers: {
                Accept: "application/json",
                Authorization: authToken ? `Bearer ${authToken}` : undefined,
            },
        });

        if(!resProject.ok) {
            throw new Error("Failed to refresh project versions");
        }

        const nextProject = await resProject.json();
        setVersions(nextProject?.versions || []);
    };

    const resetUploadForm = () => {
        setFormData({
            version_number: "",
            changelog: "",
            release_channel: "release",
            game_versions: [],
            loaders: [],
        });

        setIsGameVersionsPopoverOpen(false);
        setIsLoadersPopoverOpen(false);
        setIsReleaseChannelPopoverOpen(false);
        if(uploadFileRef.current) {
            uploadFileRef.current.value = "";
        }
    };

    const availableGameVersions = useMemo(() => {
        const items = versions.flatMap((version) => {
            if(!version?.game_versions) {
                return [];
            }

            if(Array.isArray(version.game_versions)) {
                return version.game_versions.map((v) => String(v).trim()).filter(Boolean);
            }

            return String(version.game_versions).split(",").map((v) => v.trim()).filter(Boolean);
        });

        return [...new Set(items)].sort((a, b) => gameVersions.indexOf(a) - gameVersions.indexOf(b));
    }, [versions]);

    const availableChannels = useMemo(() => {
        const items = versions.map((v) => v?.release_channel).filter(Boolean);
        return [...new Set(items)].filter((channel) => releaseChannels.includes(channel));
    }, [versions]);

    const availableLoaders = useMemo(() => {
        const items = versions.flatMap((version) => {
            if(!version?.loaders) {
                return [];
            }

            const raw = String(version.loaders);
            if(!raw.trim() || raw === "null") {
                return [];
            }

            return raw.toLowerCase().split(",").map((l) => l.trim()).filter(Boolean);
        });

        return [...new Set(items)].sort();
    }, [versions]);

    const filteredVersions = useMemo(() => {
        return versions.filter((version) => {
            const gameVersionsMatch = filterGameVersions.length === 0 || (version?.game_versions && filterGameVersions.some((filterVersion) => {
                const list = Array.isArray(version.game_versions) ? version.game_versions.map((v) => String(v).trim()) : String(version.game_versions).split(",").map((v) => v.trim());

                return list.includes(filterVersion);
            }));

            const channelMatch = filterChannels.length === 0 || filterChannels.includes(version?.release_channel);

            const loadersMatch = filterLoaders.length === 0 || (version?.loaders && filterLoaders.some((filterLoader) => String(version.loaders).toLowerCase().split(",").map((l) => l.trim()).includes(filterLoader)));

            return gameVersionsMatch && channelMatch && loadersMatch;
        });
    }, [versions, filterGameVersions, filterChannels, filterLoaders]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, { day: "numeric", month: "short" });
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

                <div>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center", marginBottom: "12px" }}>
                        <div className="version-filters" style={{ display: "flex", gap: "8px" }}>
                            <div className="field field--default" ref={filterGameVersionsRef}>
                                <button style={{ display: "flex", gap: "4px" }} type="button" className="button button--size-m button--type-secondary" onClick={toggleFilterGameVersionsPopover} aria-label={tProject("filters.gameVersionsAria")}>
                                    {tProject("tabs.gameVersion")}

                                    <svg className="icon icon--chevron_down" width="20" height="20" viewBox="0 0 24 24">
                                        <path fillRule="evenodd" clipRule="evenodd" d="M17.707 8.793a1 1 0 0 1 0 1.414l-5 5a1 1 0 0 1-1.414 0l-5-5a1 1 0 1 1 1.414-1.414L12 13.086l4.293-4.293a1 1 0 0 1 1.414 0Z" fill="currentColor"></path>
                                    </svg>
                                </button>

                                {isFilterGameVersionsPopoverOpen && (
                                    <div className="popover">
                                        <div className="context-list" style={{ maxHeight: "200px" }}>
                                            {availableGameVersions.map((version) => (
                                                <div key={version} className={`context-list-option ${filterGameVersions.includes(version) ? "context-list-option--selected" : ""}`} onClick={() => handleToggleFilterGameVersion(version)}>
                                                    <div className="context-list-option__label">{version}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="field field--default" ref={filterChannelsRef}>
                                <button style={{ display: "flex", gap: "4px" }} type="button" className="button button--size-m button--type-secondary" onClick={toggleFilterChannelsPopover} aria-label={tProject("filters.channelsAria")}>
                                    {tProject("tabs.gameChannel")}

                                    <svg className="icon icon--chevron_down" width="20" height="20" viewBox="0 0 24 24">
                                        <path fillRule="evenodd" clipRule="evenodd" d="M17.707 8.793a1 1 0 0 1 0 1.414l-5 5a1 1 0 0 1-1.414 0l-5-5a1 1 0 1 1 1.414-1.414L12 13.086l4.293-4.293a1 1 0 0 1 1.414 0Z" fill="currentColor"></path>
                                    </svg>
                                </button>

                                {isFilterChannelsPopoverOpen && (
                                    <div className="popover">
                                        <div className="context-list" style={{ maxHeight: "200px" }}>
                                            {availableChannels.map((channel) => (
                                                <div key={channel} className={`context-list-option ${filterChannels.includes(channel) ? "context-list-option--selected" : ""}`} onClick={() => handleToggleFilterChannel(channel)}>
                                                    <div className="context-list-option__label">{channel.charAt(0).toUpperCase() + channel.slice(1)}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="field field--default" ref={filterLoadersRef}>
                                <button style={{ display: "flex", gap: "4px" }} type="button" className="button button--size-m button--type-secondary" onClick={toggleFilterLoadersPopover} aria-label={tProject("filters.loadersAria")}>
                                    {tProject("tabs.loader") || "Loader"}

                                    <svg className="icon icon--chevron_down" width="20" height="20" viewBox="0 0 24 24">
                                        <path fillRule="evenodd" clipRule="evenodd" d="M17.707 8.793a1 1 0 0 1 0 1.414l-5 5a1 1 0 0 1-1.414 0l-5-5a1 1 0 1 1 1.414-1.414L12 13.086l4.293-4.293a1 1 0 0 1 1.414 0Z" fill="currentColor"></path>
                                    </svg>
                                </button>

                                {isFilterLoadersPopoverOpen && (
                                    <div className="popover">
                                        <div className="context-list" style={{ maxHeight: "200px" }}>
                                            {availableLoaders.map((loader) => (
                                                <div key={loader} className={`context-list-option ${filterLoaders.includes(loader) ? "context-list-option--selected" : ""}`} onClick={() => handleToggleFilterLoader(loader)}>
                                                    <div className="context-list-option__label">{loader.charAt(0).toUpperCase() + loader.slice(1)}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <button type="button" className="button button--size-m button--type-primary" onClick={() => { if(showUpload) { cancelUpload(); } else { setShowUpload(true); } }}>
                            {t("versions.title")}
                        </button>
                    </div>

                    {showUpload && (
                        <div className="blog-settings content" style={{ marginBottom: "12px" }}>
                            <div className="blog-settings__body" style={{ paddingBottom: "20px" }}>
                                <form onSubmit={handleSubmit}>
                                    <div className="field field--default blog-settings__input">
                                        <label style={{ marginBottom: "10px" }} className="field__wrapper">
                                            <input ref={uploadFileRef} type="file" name="file" accept=".jar,.zip,.rar,application/zip, application/x-rar-compressed, application/vnd.rar, application/java-archive" required />
                                        </label>
                                    </div>

                                    <p className="blog-settings__field-title">{t("versions.fields.versionNumber")}</p>
                                    <div className="field field--default blog-settings__input">
                                        <label style={{ marginBottom: "10px" }} className="field__wrapper">
                                            <input type="text" name="version_number" value={formData.version_number} onChange={handleInputChange} placeholder={t("versions.placeholders.versionNumber")} className="text-input" required />
                                        </label>
                                    </div>

                                    <p className="blog-settings__field-title">{t("versions.fields.changelog")}</p>
                                    <div className="field field--default textarea blog-settings__input">
                                        <label style={{ marginBottom: "10px" }} className="field__wrapper">
                                            <textarea name="changelog" value={formData.changelog} onChange={handleInputChange} placeholder={t("versions.placeholders.changelog")} className="autosize textarea__input" style={{ height: "200px" }} />
                                        </label>
                                    </div>

                                    <p className="blog-settings__field-title">{t("versions.fields.releaseChannel")}</p>
                                    <div className="field field--default blog-settings__input" ref={releaseChannelRef}>
                                        <label style={{ marginBottom: "10px" }} className="field__wrapper" onClick={toggleReleaseChannelPopover}>
                                            <div className="field__wrapper-body">
                                                <div className="select">
                                                    <div className="select__selected">
                                                        {releaseChannelLabel}
                                                    </div>
                                                </div>
                                            </div>
                                        </label>

                                        {isReleaseChannelPopoverOpen && (
                                            <div className="popover">
                                                <div className="context-list" style={{ maxHeight: "200px" }}>
                                                    {releaseChannels.map((channel) => (
                                                        <div key={channel} className={`context-list-option ${formData.release_channel === channel ? "context-list-option--selected" : ""}`} style={{ "--press-duration": "140ms" }} onClick={() => handleSelectReleaseChannel(channel)}>
                                                            <div className="context-list-option__label">{t(`versions.releaseChannels.${channel}`)}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <p className="blog-settings__field-title">{t("versions.fields.gameVersions")}</p>
                                    <div className="field field--default blog-settings__input" ref={gameVersionsRef}>
                                        <label className="field__wrapper" onClick={toggleGameVersionsPopover}>
                                            <div className="field__wrapper-body">
                                                <div className="select">
                                                    <div className="select__selected">
                                                        {gameVersionsLabel}
                                                    </div>
                                                </div>
                                            </div>
                                        </label>

                                        {isGameVersionsPopoverOpen && (
                                            <div className="popover">
                                                <div className="context-list" data-scrollable style={{ maxHeight: "200px", overflowY: "auto" }}>
                                                    {gameVersions.map((version) => (
                                                        <div key={version} className={`context-list-option ${formData.game_versions.includes(version) ? "context-list-option--selected" : ""}`} style={{ "--press-duration": "140ms" }} onClick={() => handleToggleGameVersion(version)}>
                                                            <div className="context-list-option__label">{version}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <p className="blog-settings__field-title">{t("versions.fields.loaders")}</p>
                                    <div className="field field--default blog-settings__input" ref={loadersRef}>
                                        <label className="field__wrapper" onClick={toggleLoadersPopover}>
                                            <div className="field__wrapper-body">
                                                <div className="select">
                                                    <div className="select__selected">
                                                        {loadersLabel}
                                                    </div>
                                                </div>
                                            </div>
                                        </label>

                                        {isLoadersPopoverOpen && (
                                            <div className="popover">
                                                <div className="context-list" data-scrollable style={{ maxHeight: "200px", overflowY: "auto" }}>
                                                    {loaders.map((loader) => (
                                                        <div key={loader} className={`context-list-option ${formData.loaders.includes(loader) ? "context-list-option--selected" : ""}`} style={{ "--press-duration": "140ms" }} onClick={() => handleToggleLoader(loader)}>
                                                            <div className="context-list-option__label">{loader}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ display: "flex", gap: "8px", marginTop: "18px" }}>
                                        <button type="submit" className="button button--size-m button--type-primary">
                                            {t("versions.actions.upload")}
                                        </button>

                                        <button type="button" className="button button--size-m button--type-minimal" onClick={cancelUpload}>
                                            {tProject("cancel")}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    <div className="all-versions">
                        <div className="card-header">
                            <div></div>
                            <div>{tProject("versions.headers.version")}</div>
                            <div>{tProject("versions.headers.statistics")}</div>
                        </div>

                        {filteredVersions.length === 0 ? (
                            <div style={{ padding: "12px 0", color: "var(--theme-color-text-secondary)" }}>
                                {tProject("noFiles")}
                            </div>
                        ) : (
                            filteredVersions.map((version) => (
                                <div key={version.id} className="version-button">
                                    <button className="download-button" type="button" onClick={() => openEditModal(version.id)} aria-label={tProject("editVersion")} title={tProject("editVersion")}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ fill: "none" }}>
                                            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.51a2 2 0 0 1 1-1.72l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    </button>

                                    <Link href={`/mod/${project.slug}/version/${version.id}`}>
                                        <span className="version__title">
                                            {version.version_number}

                                            {version.loaders && version.loaders.trim() && version.loaders !== "null" ? (
                                                version.loaders.split(",").map((loader, index) => (
                                                    <span key={index} className="version__game-platform">
                                                        {loader.trim()}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="version__game-platform">{tProject("versions.notSpecified")}</span>
                                            )}

                                            <VersionDisplay gameVersions={version.game_versions ? version.game_versions.split(",").map((v) => v.trim()).filter(Boolean) : []} />
                                        </span>

                                        <div className="version__metadata">
                                            <span className={`version__badge type--${version.release_channel}`}>
                                                <span className="circle"></span>
                                                {tProject("versions.published")}
                                            </span>
                                            <span className="divider"></span>
                                            <span className="version_number">{formatDate(version.created_at)}</span>
                                        </div>
                                    </Link>

                                    <div className="version__stats">
                                        <strong>{version.downloads}</strong>
                                        <span>{tProject("versions.downloads")}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
            </div>

            <Modal isOpen={editModalOpen} onRequestClose={closeEditModal} className="modal active" overlayClassName="modal-overlay">
                <div className="modal-window">
                    <div className="modal-window__header">
                        <span>{tProject("editVersion")}</span>

                        <button className="icon-button modal-window__close" type="button" onClick={closeEditModal} disabled={editLoading}>
                            <svg className="icon icon--cross" height="24" width="24">
                                <path fillRule="evenodd" clipRule="evenodd" d="M5.293 5.293a1 1 0 0 1 1.414 0L12 10.586l5.293-5.293a1 1 0 0 1 1.414 1.414L13.414 12l5.293 5.293a1 1 0 0 1-1.414 1.414L12 13.414l-5.293 5.293a1 1 0 0 1-1.414-1.414L10.586 12 5.293 6.707a1 1 0 0 1 0-1.414Z" />
                            </svg>
                        </button>
                    </div>

                    <div className="modal-window__content">
                        <form onSubmit={handleUpdate}>
                            <p className="blog-settings__field-title">{t("versions.fields.versionNumber")}</p>
                            <div className="field field--default blog-settings__input">
                                <label className="field__wrapper">
                                    <input type="text" name="version_number" value={editFormData.version_number} onChange={handleEditInputChange} className="text-input" required disabled={editLoading} />
                                </label>
                            </div>

                            <p className="blog-settings__field-title">{t("versions.fields.changelog")}</p>
                            <div className="field field--default textarea blog-settings__input">
                                <label className="field__wrapper">
                                    <textarea name="changelog" value={editFormData.changelog} onChange={handleEditInputChange} className="autosize textarea__input" style={{ height: "200px" }} disabled={editLoading} />
                                </label>
                            </div>

                            <p className="blog-settings__field-title">{t("versions.fields.releaseChannel")}</p>
                            <div className="field field--default blog-settings__input" ref={editReleaseChannelRef}>
                                <label className="field__wrapper" onClick={!editLoading ? toggleEditReleaseChannelPopover : undefined}>
                                    <div className="field__wrapper-body">
                                        <div className="select">
                                            <div className="select__selected">
                                                {editReleaseChannelLabel}
                                            </div>
                                        </div>
                                    </div>
                                </label>

                                {isEditReleaseChannelPopoverOpen && !editLoading && (
                                    <div className="popover">
                                        <div className="context-list" style={{ maxHeight: "200px" }}>
                                            {releaseChannels.map((channel) => (
                                                <div key={channel} className={`context-list-option ${editFormData.release_channel === channel ? "context-list-option--selected" : ""}`} style={{ "--press-duration": "140ms" }} onClick={() => handleSelectEditReleaseChannel(channel)}>
                                                    <div className="context-list-option__label">{t(`versions.releaseChannels.${channel}`)}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <p className="blog-settings__field-title">{t("versions.fields.gameVersions")}</p>
                            <div className="field field--default blog-settings__input" ref={editGameVersionsRef}>
                                <label className="field__wrapper" onClick={toggleEditGameVersionsPopover}>
                                    <div className="field__wrapper-body">
                                        <div className="select">
                                            <div className="select__selected">
                                                {editGameVersionsLabel}
                                            </div>
                                        </div>
                                    </div>
                                </label>

                                {isEditGameVersionsPopoverOpen && (
                                    <div className="popover">
                                        <div className="context-list" data-scrollable style={{ maxHeight: "200px", overflowY: "auto" }}>
                                            {gameVersions.map((version) => (
                                                <div key={version} className={`context-list-option ${editFormData.game_versions.includes(version) ? "context-list-option--selected" : ""}`} style={{ "--press-duration": "140ms" }} onClick={() => handleEditToggleGameVersion(version)}>
                                                    <div className="context-list-option__label">{version}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <p className="blog-settings__field-title">{t("versions.fields.loaders")}</p>
                            <div className="field field--default blog-settings__input" ref={editLoadersRef}>
                                <label className="field__wrapper" onClick={toggleEditLoadersPopover}>
                                    <div className="field__wrapper-body">
                                        <div className="select">
                                            <div className="select__selected">
                                                {editLoadersLabel}
                                            </div>
                                        </div>
                                    </div>
                                </label>

                                {isEditLoadersPopoverOpen && (
                                    <div className="popover">
                                        <div className="context-list" data-scrollable style={{ maxHeight: "200px", overflowY: "auto" }}>
                                            {loaders.map((loader) => (
                                                <div key={loader} className={`context-list-option ${editFormData.loaders.includes(loader) ? "context-list-option--selected" : ""}`} style={{ "--press-duration": "140ms" }} onClick={() => handleEditToggleLoader(loader)}>
                                                    <div className="context-list-option__label">{loader}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <p className="blog-settings__field-title">{tProject("file")}</p>
                            <div className="field field--default blog-settings__input">
                                <label className="field__wrapper">
                                    <input type="file" name="file" accept=".jar,.zip,.rar,application/zip, application/x-rar-compressed, application/vnd.rar, application/java-archive" className="text-input" disabled={editLoading} />
                                </label>
                            </div>

                            <div style={{ display: "flex", gap: "8px", marginTop: "18px" }}>
                                <button type="submit" className="button button--size-m button--type-primary" disabled={editLoading}>
                                    {editLoading ? tProject("updating") : tProject("update")}
                                </button>

                                <button type="button" className="button button--size-m button--type-negative" onClick={handleDelete} disabled={editLoading}>
                                    {tProject("delete")}
                                </button>

                                <button type="button" className="button button--size-m button--type-minimal" onClick={closeEditModal} disabled={editLoading}>
                                    {tProject("cancel")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </Modal>
        </div>
    );
}