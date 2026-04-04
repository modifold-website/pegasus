"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslations } from "next-intl";
import UnsavedChangesBar from "@/components/ui/UnsavedChangesBar";

const normalizeTagKey = (tag) => tag.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");

const normalizeTags = (tags) => tags.map((tag) => (typeof tag === "string" ? { name: tag } : tag)).filter((tag) => tag && typeof tag.name === "string");

export default function TagsSettings({ project, authToken, availableTags = [] }) {
    const t = useTranslations("SettingsProjectPage");
    const { slug } = useParams();

    const initialTags = project.tags ? project.tags.split(",") : [];
    const [selectedTags, setSelectedTags] = useState(initialTags);
    const [savedTags, setSavedTags] = useState(initialTags);
    const [isTagsPopoverOpen, setIsTagsPopoverOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const tagsRef = useRef(null);
    const [tagOptions, setTagOptions] = useState(() => normalizeTags(availableTags));
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

    useEffect(() => {
        if(tagOptions.length > 0 || !project?.project_type) {
            return;
        }

        const controller = new AbortController();
        const fetchTags = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/tags/${project.project_type}`, {
                    signal: controller.signal,
                });
                if(response.ok) {
                    const data = await response.json();
                    const normalized = normalizeTags(Array.isArray(data?.tags) ? data.tags : []);
                    setTagOptions(normalized);
                }
            } catch (err) {
                if(!controller.signal.aborted) {
                    console.error("Error fetching tags:", err);
                }
            }
        };

        fetchTags();

        return () => controller.abort();
    }, [project?.project_type, tagOptions.length]);

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
        <>
            <div className="settings-wrapper settings-wrapper--narrow">
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
                                                {tagOptions.map((tag) => (
                                                    <div key={tag.name} className={`context-list-option ${selectedTags.includes(tag.name) ? "context-list-option--selected" : ""}`} style={{ "--press-duration": "140ms" }} onClick={() => handleToggleTag(tag.name)}>
                                                        <div className="context-list-option__label">{getTagLabel(tag.name)}</div>
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
        </>
    );
}