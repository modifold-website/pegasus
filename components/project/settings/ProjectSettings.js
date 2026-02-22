"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../providers/AuthProvider";
import { useRouter, usePathname } from "next/navigation";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";
import { useTranslations } from "next-intl";
import UnsavedChangesBar from "@/components/ui/UnsavedChangesBar";

const getInitialFormData = (project) => ({
    title: project?.title || "",
    summary: project?.summary || "",
    visibility: project?.visibility || "public",
    slug: project?.slug || "",
    icon: null,
    comments_enabled: project?.comments_enabled !== false,
});

export default function ProjectSettings({ project }) {
    const t = useTranslations("SettingsProjectPage");
    const { isLoggedIn, user } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const [formData, setFormData] = useState(getInitialFormData(project));
    const [savedFormData, setSavedFormData] = useState(getInitialFormData(project));
    const [isSaving, setIsSaving] = useState(false);

    const [previewIcon, setPreviewIcon] = useState("");
    const [savedPreviewIcon, setSavedPreviewIcon] = useState(project?.icon_url || "");
    const iconInputRef = useRef(null);
    const [isCommentsMenuOpen, setIsCommentsMenuOpen] = useState(false);
    const commentsButtonRef = useRef(null);
    const commentsMenuRef = useRef(null);

    useEffect(() => {
        if(!isLoggedIn) {
            router.push("/403");
        } else if(project) {
            const initialData = getInitialFormData(project);
            const initialPreview = project.icon_url || "";
            setFormData(initialData);
            setSavedFormData(initialData);
            setPreviewIcon(initialPreview);
            setSavedPreviewIcon(initialPreview);
        }
    }, [isLoggedIn, project, router]);

    const isDirty = (
        formData.title !== savedFormData.title ||
        formData.summary !== savedFormData.summary ||
        formData.visibility !== savedFormData.visibility ||
        formData.slug !== savedFormData.slug ||
        formData.comments_enabled !== savedFormData.comments_enabled ||
        Boolean(formData.icon)
    );

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];

        if(file && file.size > 20 * 1024 * 1024) {
            toast.error(t("general.errors.fileTooLarge"));
            return;
        }

        setFormData((prev) => ({ ...prev, icon: file }));
        setPreviewIcon(file ? URL.createObjectURL(file) : project.icon_url || "");
    };

    const handleIconOverlayClick = () => {
        iconInputRef.current.click();
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if(!isCommentsMenuOpen) {
                return;
            }

            if(commentsMenuRef.current?.contains(event.target) || commentsButtonRef.current?.contains(event.target)) {
                return;
            }

            setIsCommentsMenuOpen(false);
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isCommentsMenuOpen]);

    const handleSubmit = async (e) => {
        if(e) {
            e.preventDefault();
        }

        if(isSaving || !isDirty) {
            return;
        }

        const data = new FormData();
        data.append("title", formData.title);
        data.append("summary", formData.summary);
        data.append("visibility", formData.visibility);
        data.append("slug", formData.slug);
        data.append("comments_enabled", formData.comments_enabled ? "1" : "0");
        if(formData.icon) {
            data.append("icon", formData.icon);
        }

        setIsSaving(true);

        try {
            await axios.put(`${process.env.NEXT_PUBLIC_API_BASE}/projects/${project.id}`, data, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            setSavedFormData({
                ...formData,
                icon: null,
            });
            setFormData((prev) => ({ ...prev, icon: null }));
            setSavedPreviewIcon(previewIcon);
            toast.success(t("general.success.saved"));
        } catch (err) {
            toast.error(err.response?.data?.message || t("general.errors.save"));
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if(!confirm(t("general.confirmDelete", { title: project.title }))) {
            return;
        }

        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE}/projects/${project.slug}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                },
            });

            toast.success(t("general.success.deleted"));
            router.push("/");
        } catch (err) {
            toast.error(err.response?.data?.message || t("general.errors.delete"));
        }
    };

    if(!isLoggedIn || !project) {
        return null;
    }

    const isActive = (href) => pathname === href;
    const toggleCommentsMenu = () => setIsCommentsMenuOpen((prev) => !prev);

    return (
        <div className="layout">
            <div className="page-content settings-page">
                <div className="sidebar">
                    <div className="sidebar__main">
                        <Link href={`/mod/${project.slug}`} className="sidebar-item">
                            <img src={previewIcon} alt={t("general.iconAlt")} className="icon" width="28" height="28" style={{ borderRadius: "8px" }} />

                            {project.title}
                        </Link>

                        <div className="sidebar-separator-view _theme_default _size_s"></div>

                        <Link href={`/mod/${project.slug}/settings`} className={`sidebar-item ${isActive(`/mod/${project.slug}/settings`) ? "sidebar-item--active" : ""}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon lucide-settings-icon lucide-settings">
                                <path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>

                            {t("sidebar.general")}
                        </Link>

                        <Link href={`/mod/${project.slug}/settings/description`} className={`sidebar-item ${isActive(`/mod/${project.slug}/settings/description`) ? "sidebar-item--active" : ""}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon lucide-type-icon lucide-type">
                                <path d="M12 4v16" />
                                <path d="M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2" />
                                <path d="M9 20h6" />
                            </svg>

                            {t("sidebar.description")}
                        </Link>

                        <Link href={`/mod/${project.slug}/settings/links`} className={`sidebar-item ${isActive(`/mod/${project.slug}/settings/links`) ? "sidebar-item--active" : ""}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon lucide-link-icon lucide-link">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                            </svg>

                            {t("sidebar.links")}
                        </Link>

                        <Link href={`/mod/${project.slug}/settings/versions`} className={`sidebar-item ${isActive(`/mod/${project.slug}/settings/versions`) ? "sidebar-item--active" : ""}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon lucide-arrow-down-to-line-icon lucide-arrow-down-to-line">
                                <path d="M12 17V3" />
                                <path d="m6 11 6 6 6-6" />
                                <path d="M19 21H5" />
                            </svg>

                            {t("sidebar.versions")}
                        </Link>

                        <Link href={`/mod/${project.slug}/settings/gallery`} className={`sidebar-item ${isActive(`/mod/${project.slug}/settings/gallery`) ? "sidebar-item--active" : ""}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon lucide-image-icon lucide-image">
                                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                                <circle cx="9" cy="9" r="2" />
                                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                            </svg>

                            {t("sidebar.gallery")}
                        </Link>

                        <Link href={`/mod/${project.slug}/settings/tags`} className={`sidebar-item ${isActive(`/mod/${project.slug}/settings/tags`) ? "sidebar-item--active" : ""}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon lucide lucide-tag-icon lucide-tag">
                                <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
                                <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
                            </svg>

                            {t("sidebar.tags")}
                        </Link>

                        <Link href={`/mod/${project.slug}/settings/license`} className={`sidebar-item ${isActive(`/mod/${project.slug}/settings/license`) ? "sidebar-item--active" : ""}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon--settings"><circle cx="12" cy="12" r="10"/><path d="M14.83 14.83a4 4 0 1 1 0-5.66"/></svg>

                            {t("sidebar.license")}
                        </Link>

                        <Link href={`/mod/${project.slug}/settings/moderation`} className={`sidebar-item ${isActive(`/mod/${project.slug}/settings/moderation`) ? "sidebar-item--active" : ""}`}>
                            <svg className="icon icon--settings" height="24" width="24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m3 6 3 1m0 0-3 9a5 5 0 0 0 6.001 0M6 7l3 9M6 7l6-2m6 2 3-1m-3 1-3 9a5 5 0 0 0 6.001 0M18 7l3 9m-3-9-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                            </svg>

                            {t("sidebar.moderation")}
                        </Link>
                    </div>
                </div>

                <div className="settings-wrapper" style={{ width: "100%" }}>
                    <div className="settings-content">
                        <form onSubmit={handleSubmit}>
                            <div className="blog-settings">
                                <div className="blog-settings__body">
                                    <p className="blog-settings__field-title">
                                        {t("general.fields.icon")}
                                    </p>

                                    <div className="blog-settings__avatar">
                                        <div className="avatar avatar--size-l">
                                            <div className="avatar__wrapper" style={{ "--background-color": "var(--theme-color-background)" }}>
                                                {previewIcon && (
                                                    <img src={previewIcon} alt={t("general.iconAlt")} className="avatar__image" />
                                                )}

                                                <div className="avatar__overlay" onClick={handleIconOverlayClick}>
                                                    <svg className="icon icon--image" width="40" height="40" viewBox="0 0 24 24">
                                                        <path d="M8 9.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z"></path>
                                                        <path fillRule="evenodd" clipRule="evenodd" d="M7 3a4 4 0 0 0-4 4v10a4 4 0 0 0 4 4h10a4 4 0 0 0 4-4V7a4 4 0 0 0-4-4H7ZM5 7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v5.252l-1.478-1.477a2 2 0 0 0-3.014.214L8.5 19H7a2 2 0 0 1-2-2V7Zm11.108 5.19L19 15.08V17a2 2 0 0 1-2 2h-6l5.108-6.81Z"></path>
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <input type="file" id="icon" name="icon" accept="image/jpeg,image/png,image/gif" onChange={handleFileChange} ref={iconInputRef} style={{ display: "none" }} />

                                    <p style={{ marginTop: "12px" }} className="blog-settings__field-title">
                                        {t("general.fields.name")}
                                    </p>

                                    <div className="field field--default blog-settings__input">
                                        <label style={{ marginBottom: "10px" }} className="field__wrapper">
                                            <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder={t("general.placeholders.name")} className="text-input" maxLength="30" />
                                            <div className="counter">{formData.title.length}</div>
                                        </label>
                                    </div>

                                    <p className="blog-settings__field-title">{t("general.fields.summary")}</p>
                                    <div className="field field--default textarea blog-settings__input">
                                        <label style={{ marginBottom: "10px" }} className="field__wrapper">
                                            <textarea name="summary" value={formData.summary} onChange={handleInputChange} placeholder={t("general.placeholders.summary")} className="autosize textarea__input" style={{ height: "256px" }} minLength={30} />
                                        </label>

                                        <p>{t("general.hints.summary")}</p>
                                    </div>

                                    <p style={{ marginTop: "12px" }} className="blog-settings__field-title">{t("general.fields.url")}</p>
                                    <div className="field field--default blog-settings__input">
                                        <label style={{ marginBottom: "10px" }} className="field__wrapper">
                                            <input type="text" name="slug" value={formData.slug} onChange={(e) => { const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 30); setFormData((prev) => ({ ...prev, slug: value })); }} placeholder={t("general.placeholders.url")} className="text-input" maxLength="30" />

                                            <div className="counter">{formData.slug.length}/30</div>
                                        </label>

                                        <p>{t("general.hints.url")}</p>
                                    </div>

                                    <p className="blog-settings__field-title">{t("general.fields.visibility")}</p>
                                    <div className="field field--default blog-settings__input">
                                        <label style={{ marginBottom: "10px" }} className="field__wrapper">
                                            <select name="visibility" value={formData.visibility} onChange={handleInputChange} className="text-input">
                                                <option value="public">{t("general.visibility.public")}</option>
                                                <option value="unlisted">{t("general.visibility.unlisted")}</option>
                                                <option value="private">{t("general.visibility.private")}</option>
                                            </select>
                                        </label>

                                        <p>{t("general.hints.visibility")}</p>
                                    </div>

                                    <p className="blog-settings__field-title">{t("general.comments.title")}</p>
                                    <div className="field field--default blog-settings__input" ref={commentsMenuRef}>
                                        <label style={{ marginBottom: "10px" }} className="field__wrapper" onClick={toggleCommentsMenu} ref={commentsButtonRef}>
                                            <div className="field__wrapper-body">
                                                <div className="select">
                                                    <div className="select__selected">
                                                        {formData.comments_enabled ? t("general.comments.enabled") : t("general.comments.disabled")}
                                                    </div>
                                                </div>
                                            </div>

                                            <svg style={{ fill: "none" }} className={`icon icon--chevron_down ${isCommentsMenuOpen ? "rotate" : ""}`} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"></path></svg>
                                        </label>

                                        {isCommentsMenuOpen && (
                                            <div className="popover">
                                                <div className="context-list" data-scrollable>
                                                    <div className={`context-list-option ${formData.comments_enabled ? "context-list-option--selected" : ""}`} onClick={() => { setFormData((prev) => ({ ...prev, comments_enabled: true })); setIsCommentsMenuOpen(false); }}>
                                                        <div className="context-list-option__label">{t("general.comments.enabled")}</div>
                                                    </div>

                                                    <div className={`context-list-option ${!formData.comments_enabled ? "context-list-option--selected" : ""}`} onClick={() => { setFormData((prev) => ({ ...prev, comments_enabled: false })); setIsCommentsMenuOpen(false); }}>
                                                        <div className="context-list-option__label">{t("general.comments.disabled")}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <p>{t("general.comments.hint")}</p>
                                    </div>

                                    <div style={{ marginTop: "18px", display: "flex", gap: "10px" }}>
                                        <button type="button" className="button button--size-m button--type-negative" onClick={handleDelete}>
                                            {t("general.actions.delete")}
                                        </button>
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
                    onReset={() => {
                        setFormData({ ...savedFormData, icon: null });
                        setPreviewIcon(savedPreviewIcon);
                        setIsCommentsMenuOpen(false);
                        if(iconInputRef.current) {
                            iconInputRef.current.value = "";
                        }
                    }}
                    saveLabel={t("general.actions.save")}
                    resetLabel={t("unsavedBar.reset")}
                    message={t("unsavedBar.message")}
                />
            </div>
        </div>
    );
}