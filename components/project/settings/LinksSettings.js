"use client";

import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslations } from "next-intl";
import UnsavedChangesBar from "@/components/ui/UnsavedChangesBar";
import ProjectSettingsSidebar from "@/components/ui/ProjectSettingsSidebar";

export default function LinksSettings({ project, authToken }) {
    const t = useTranslations("SettingsProjectPage");
    const initialFormData = {
        issue_url: project.issue_url || "",
        source_url: project.source_url || "",
        wiki_url: project.wiki_url || "",
        discord_url: project.discord_url || "",
    };

    const [formData, setFormData] = useState(initialFormData);
    const [savedFormData, setSavedFormData] = useState(initialFormData);
    const [isSaving, setIsSaving] = useState(false);
    const isDirty = JSON.stringify(formData) !== JSON.stringify(savedFormData);

    const handleSubmit = async (e) => {
        if(e) {
            e.preventDefault();
        }

        if(isSaving || !isDirty) {
            return;
        }

        setIsSaving(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/projects/${project.slug}/links`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify(formData),
            });

            if(response.ok) {
                setSavedFormData({ ...formData });
                toast.success(t("links.success"));
            } else {
                toast.error(t("links.errors.save"));
            }
        } catch (err) {
            toast.error(t("links.errors.save"));
        } finally {
            setIsSaving(false);
        }
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

                <div className="settings-wrapper" style={{ width: "100%" }}>
                    <div className="settings-content">
                        <form onSubmit={handleSubmit}>
                            <div className="blog-settings">
                                <div className="blog-settings__body">
                                    <p className="blog-settings__field-title">{t("links.fields.issueTracker")}</p>
                                    <div className="field field--default blog-settings__input">
                                        <label style={{ marginBottom: "10px" }} className="field__wrapper">
                                            <input
                                                type="url"
                                                name="issue_url"
                                                value={formData.issue_url}
                                                onChange={(e) => setFormData({ ...formData, issue_url: e.target.value })}
                                                placeholder={t("links.placeholders.issueTracker")}
                                                className="text-input"
                                            />
                                        </label>
                                    </div>

                                    <p className="blog-settings__field-title">{t("links.fields.sourceCode")}</p>
                                    <div className="field field--default blog-settings__input">
                                        <label style={{ marginBottom: "10px" }} className="field__wrapper">
                                            <input
                                                type="url"
                                                name="issue_url"
                                                value={formData.source_url}
                                                onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
                                                placeholder={t("links.placeholders.sourceCode")}
                                                className="text-input"
                                            />
                                        </label>

                                        <p className="blog-settings__field-title">{t("links.fields.wiki")}</p>
                                        <div className="field field--default blog-settings__input">
                                            <label style={{ marginBottom: "10px" }} className="field__wrapper">
                                                <input
                                                    type="url"
                                                    name="issue_url"
                                                    value={formData.wiki_url}
                                                    onChange={(e) => setFormData({ ...formData, wiki_url: e.target.value })}
                                                    placeholder={t("links.placeholders.wiki")}
                                                    className="text-input"
                                                />
                                            </label>
                                        </div>

                                        <p className="blog-settings__field-title">{t("links.fields.discord")}</p>
                                        <div className="field field--default blog-settings__input">
                                            <label style={{ marginBottom: "10px" }} className="field__wrapper">
                                                <input
                                                    type="url"
                                                    name="issue_url"
                                                    value={formData.discord_url}
                                                    onChange={(e) => setFormData({ ...formData, discord_url: e.target.value })}
                                                    placeholder={t("links.placeholders.discord")}
                                                    className="text-input"
                                                />
                                            </label>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
                <UnsavedChangesBar
                    isDirty={isDirty}
                    isSaving={isSaving}
                    onSave={handleSubmit}
                    onReset={() => setFormData({ ...savedFormData })}
                    saveLabel={t("links.actions.save")}
                    resetLabel={t("unsavedBar.reset")}
                    message={t("unsavedBar.message")}
                />
            </div>
        </div>
    );
}