"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import Link from "next/link";
import { useTranslations } from "next-intl";
import UnsavedChangesBar from "@/components/ui/UnsavedChangesBar";

const DEFAULT_ICON_URL = "https://media.modifold.com/static/no-project-icon.svg";

export default function OrganizationOverviewSettingsPage({ authToken, organization, my_permissions }) {
    const t = useTranslations("Organizations");
    const tUnsaved = useTranslations("SettingsProjectPage.unsavedBar");
    const router = useRouter();

    const [name, setName] = useState(organization?.name || "");
    const [slug, setSlug] = useState(organization?.slug || "");
    const [summary, setSummary] = useState(organization?.summary || "");
    const [savedName, setSavedName] = useState(organization?.name || "");
    const [savedSlug, setSavedSlug] = useState(organization?.slug || "");
    const [savedSummary, setSavedSummary] = useState(organization?.summary || "");
    const [iconUrl, setIconUrl] = useState(organization?.icon_url || DEFAULT_ICON_URL);
    const [savedIconUrl, setSavedIconUrl] = useState(organization?.icon_url || DEFAULT_ICON_URL);
    const [iconFile, setIconFile] = useState(null);
    const [previewIcon, setPreviewIcon] = useState(organization?.icon_url || DEFAULT_ICON_URL);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeletingOrganization, setIsDeletingOrganization] = useState(false);
    const iconInputRef = useRef(null);

    const canEditDetails = Boolean(my_permissions?.is_owner || my_permissions?.organization_permissions?.includes("organization_edit_details"));
    const canDeleteOrganization = Boolean(my_permissions?.is_owner || my_permissions?.organization_permissions?.includes("organization_delete"));
    const isDirty = name !== savedName || slug !== savedSlug || summary !== savedSummary || Boolean(iconFile);

    const handleSave = async () => {
        if(isSaving) {
            return;
        }

        setIsSaving(true);
        try {
            if(iconFile) {
                const data = new FormData();
                data.append("icon", iconFile);

                const iconResponse = await axios.put(`${process.env.NEXT_PUBLIC_API_BASE}/organizations/${organization.slug}/icon`, data, {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        "Content-Type": "multipart/form-data",
                    },
                });

                if(iconResponse.data?.icon_url) {
                    setIconUrl(iconResponse.data.icon_url);
                    setSavedIconUrl(iconResponse.data.icon_url);
                    setPreviewIcon(iconResponse.data.icon_url);
                }
            }

            await axios.put(`${process.env.NEXT_PUBLIC_API_BASE}/organizations/${organization.slug}/settings`, {
                name,
                slug,
                summary,
            }, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            setSavedName(name);
            setSavedSlug(slug);
            setSavedSummary(summary);
            setIconFile(null);
            if(iconInputRef.current) {
                iconInputRef.current.value = "";
            }
            toast.success(t("settings.successSaved"));
        } catch (error) {
            toast.error(error.response?.data?.message || t("settings.errors.save"));
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteOrganization = async () => {
        if(!canDeleteOrganization || isDeletingOrganization) {
            return;
        }

        if(!window.confirm(t("settings.delete.confirm"))) {
            return;
        }

        setIsDeletingOrganization(true);

        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE}/organizations/${organization.slug}`, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            toast.success(t("settings.delete.success"));
            router.push("/dashboard/organizations");
        } catch (error) {
            toast.error(error.response?.data?.message || t("settings.delete.error"));
        } finally {
            setIsDeletingOrganization(false);
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        if(!file) {
            return;
        }

        if(file.size > 20 * 1024 * 1024) {
            toast.error(t("settings.errors.fileTooLarge"));
            event.target.value = "";
            return;
        }

        setIconFile(file);
        setPreviewIcon(URL.createObjectURL(file));
    };

    const handleAvatarOverlayClick = () => {
        if(!canEditDetails || isSaving) {
            return;
        }

        iconInputRef.current?.click();
    };

    return (
        <div className="layout">
            <div className="page-content settings-page">
                <div className="sidebar">
                    <div className="sidebar__main">
                        <Link href={`/organization/${organization.slug}`} className="sidebar-item" data-ripple>
                            <img src={iconUrl || DEFAULT_ICON_URL} alt={t("settings.iconAlt", { name: organization.name })} className="icon" width="28" height="28" style={{ borderRadius: "8px" }} />
                            
                            <span>{organization.name}</span>
                        </Link>

                        <div className="sidebar-separator-view _theme_default _size_s"></div>

                        <Link href={`/organization/${organization.slug}/settings`} className="sidebar-item sidebar-item--active" data-ripple>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon lucide lucide-settings-icon lucide-settings">
                                <path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/>
                                <circle cx="12" cy="12" r="3"/>
                            </svg>
                            
                            {t("settings.navOverview")}
                        </Link>

                        <Link href={`/organization/${organization.slug}/settings/members`} className="sidebar-item" data-ripple>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon lucide lucide-users-round-icon lucide-users-round">
                                <path d="M18 21a8 8 0 0 0-16 0"/>
                                <circle cx="10" cy="8" r="5"/>
                                <path d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3"/>
                            </svg>
                            
                            {t("settings.navMembers")}
                        </Link>
                    </div>
                </div>

                <div className="settings-content" style={{ display: "grid", gap: "16px" }}>
                    <div className="settings-wrapper blog-settings">
                        <div className="blog-settings__body">
                            <div className="subsite-header">
                                <div className="subsite-avatar subsite-header__avatar">
                                    <div className="andropov-media andropov-media--rounded andropov-media--bordered andropov-media--has-preview subsite-avatar__image andropov-image andropov-image--zoom" style={{ aspectRatio: "1 / 1", width: "90px", height: "90px", maxWidth: "none" }} data-loaded="true">
                                        {previewIcon && <img id="create_image_url_avatar" src={previewIcon} alt={t("settings.iconAlt", { name: organization.name })} />}
                                    </div>

                                    {canEditDetails && (
                                        <div className="subsite-avatar__overlay" onClick={handleAvatarOverlayClick} aria-label={t("settings.actions.uploadIcon")}>
                                            <svg className="icon icon--image" width="40" height="40" viewBox="0 0 24 24">
                                                <path d="M8 9.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z"></path>
                                                <path fillRule="evenodd" clipRule="evenodd" d="M7 3a4 4 0 0 0-4 4v10a4 4 0 0 0 4 4h10a4 4 0 0 0 4-4V7a4 4 0 0 0-4-4H7ZM5 7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v5.252l-1.478-1.477a2 2 0 0 0-3.014.214L8.5 19H7a2 2 0 0 1-2-2V7Zm11.108 5.19L19 15.08V17a2 2 0 0 1-2 2h-6l5.108-6.81Z"></path>
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <input type="file" id="icon" name="icon" accept="image/jpeg,image/png,image/gif,image/webp" onChange={handleFileChange} ref={iconInputRef} disabled={isSaving} style={{ display: "none" }} />

                            <p className="blog-settings__field-title">{t("settings.fields.name")}</p>
                            <div className="field field--default blog-settings__input">
                                <label className="field__wrapper">
                                    <input className="text-input" value={name} onChange={(event) => setName(event.target.value)} disabled={!canEditDetails} />
                                </label>
                            </div>

                            <p className="blog-settings__field-title">{t("settings.fields.slug")}</p>
                            <div className="field field--default blog-settings__input">
                                <label className="field__wrapper">
                                    <input className="text-input" value={slug} onChange={(event) => setSlug(event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} disabled={!canEditDetails} />
                                </label>
                            </div>

                            <p className="blog-settings__field-title">{t("settings.fields.summary")}</p>
                            <div className="field field--default textarea blog-settings__input">
                                <label className="field__wrapper">
                                    <textarea className="autosize textarea__input" value={summary} onChange={(event) => setSummary(event.target.value)} style={{ height: "130px" }} disabled={!canEditDetails} />
                                </label>
                            </div>

                        </div>
                    </div>

                    {canDeleteOrganization && (
                        <div className="content content--padding">
                            <h2 style={{ marginTop: 0 }}>{t("settings.delete.title")}</h2>
                            <p style={{ marginBottom: "12px", color: "var(--theme-color-text-secondary)" }}>{t("settings.delete.description")}</p>
                            
                            <button type="button" className="button button--size-m button--type-danger" onClick={handleDeleteOrganization} disabled={isDeletingOrganization}>
                                {isDeletingOrganization ? t("settings.delete.deleting") : t("settings.delete.action")}
                            </button>
                        </div>
                    )}
                </div>

                {canEditDetails && (
                    <UnsavedChangesBar
                        isDirty={isDirty}
                        isSaving={isSaving}
                        onSave={handleSave}
                        onReset={() => {
                            setName(savedName);
                            setSlug(savedSlug);
                            setSummary(savedSummary);
                            setIconFile(null);
                            setPreviewIcon(savedIconUrl || iconUrl || DEFAULT_ICON_URL);
                            if(iconInputRef.current) {
                                iconInputRef.current.value = "";
                            }
                        }}
                        saveLabel={t("settings.actions.save")}
                        resetLabel={tUnsaved("reset")}
                        message={tUnsaved("message")}
                    />
                )}
            </div>
        </div>
    );
}