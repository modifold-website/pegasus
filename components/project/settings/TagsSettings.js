"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslations } from "next-intl";
import UnsavedChangesBar from "@/components/ui/UnsavedChangesBar";
import ProjectSettingsSidebar from "@/components/ui/ProjectSettingsSidebar";

const TAGS_BY_TYPE = {
    mod: [
        "Adventure",
        "Cursed",
        "Decoration",
        "Economy",
        "Equipment",
        "Food",
        "Game Mechanics",
        "Library",
        "Magic",
        "Management",
        "Minigame",
        "Mobs",
        "Optimization",
        "Social",
        "Storage",
        "Technology",
        "Transportation",
        "Utility",
        "World Generation",
        "Texture Packs",
    ],
};

const normalizeTagKey = (tag) => tag.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");

export default function TagsSettings({ project, authToken }) {
    const t = useTranslations("SettingsProjectPage");
    const { slug } = useParams();

    const initialTags = project.tags ? project.tags.split(",") : [];
    const [selectedTags, setSelectedTags] = useState(initialTags);
    const [savedTags, setSavedTags] = useState(initialTags);
    const [isTagsPopoverOpen, setIsTagsPopoverOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const tagsRef = useRef(null);
    const isDirty = JSON.stringify(selectedTags) !== JSON.stringify(savedTags);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if(tagsRef.current && !tagsRef.current.contains(event.target)) {
                setIsTagsPopoverOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleTagsPopover = () => {
        setIsTagsPopoverOpen((prev) => !prev);
    };

    const handleToggleTag = (tag) => {
        setSelectedTags((prev) => {
            if(prev.includes(tag)) {
                return prev.filter((t) => t !== tag);
            }

            return [...prev, tag];
        });
    };

    const handleSubmit = async (e) => {
        if(e) {
            e.preventDefault();
        }

        if(isSaving || !isDirty) {
            return;
        }

        setIsSaving(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/projects/${slug}/tags`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify({ tags: selectedTags }),
            });

            if(response.ok) {
                setSavedTags([...selectedTags]);
                toast.success(t("tags.success"));
            } else {
                toast.error(t("tags.errors.save"));
            }
        } catch (err) {
            console.error("Error updating tags:", err);
            toast.error(t("tags.errors.save"));
        } finally {
            setIsSaving(false);
        }
    };

    const getTagLabel = (tag) => {
        const key = normalizeTagKey(tag);
        try {
            return t(`tags.labels.${key}`);
        } catch (err) {
            return tag;
        }
    };

    const selectionLabel = selectedTags.length > 0 ? t("tags.selected", { count: selectedTags.length }) : t("tags.select");

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
                                <p className="blog-settings__field-title">{t("tags.title")}</p>
                                <form onSubmit={handleSubmit}>
                                    <div className="field field--default blog-settings__input" ref={tagsRef}>
                                        <label className="field__wrapper" onClick={toggleTagsPopover}>
                                            <div className="field__wrapper-body">
                                                <div className="select">
                                                    <div className="select__selected">{selectionLabel}</div>
                                                </div>
                                            </div>
                                        </label>

                                        {isTagsPopoverOpen && (
                                            <div className="popover">
                                                <div className="context-list" data-scrollable style={{ maxHeight: "200px", overflowY: "auto" }}>
                                                    {TAGS_BY_TYPE[project.project_type]?.map((tag) => (
                                                        <div key={tag} className={`context-list-option ${selectedTags.includes(tag) ? "context-list-option--selected" : ""}`} style={{ "--press-duration": "140ms" }} onClick={() => handleToggleTag(tag)}>
                                                            <div className="context-list-option__label">{getTagLabel(tag)}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <button type="button" className="button button--size-m button--type-minimal" style={{ marginTop: "18px" }} onClick={() => setSelectedTags([])}>
                                        {t("tags.actions.clear")}
                                    </button>
                                </form>

                                <p className="blog-settings__field-title">{t("tags.current")}</p>
                                <div className="tags-list">
                                    {selectedTags.length > 0 ? (
                                        selectedTags.map((tag) => (
                                            <div key={tag} className="button button--size-m button--type-minimal">{getTagLabel(tag)}</div>
                                        ))
                                    ) : (
                                        <p>{t("tags.none")}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
                <UnsavedChangesBar
                    isDirty={isDirty}
                    isSaving={isSaving}
                    onSave={handleSubmit}
                    onReset={() => {
                        setSelectedTags([...savedTags]);
                        setIsTagsPopoverOpen(false);
                    }}
                    saveLabel={t("tags.actions.save")}
                    resetLabel={t("unsavedBar.reset")}
                    message={t("unsavedBar.message")}
                />
            </div>
        </div>
    );
}