"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslations } from "next-intl";
import { LICENSES } from "../../Licenses";
import UnsavedChangesBar from "@/components/ui/UnsavedChangesBar";

export default function LicenseSettings({ project, authToken }) {
    const t = useTranslations("SettingsProjectPage");
    const pathname = usePathname();
    const { slug } = useParams();

    const initialLicense = project.license.id || "no-license";
    const [selectedLicense, setSelectedLicense] = useState(initialLicense);
    const [savedLicense, setSavedLicense] = useState(initialLicense);
    const [isLicensePopoverOpen, setIsLicensePopoverOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const licenseRef = useRef(null);
    const isDirty = selectedLicense !== savedLicense;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if(licenseRef.current && !licenseRef.current.contains(event.target)) {
                setIsLicensePopoverOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleLicensePopover = () => {
        setIsLicensePopoverOpen((prev) => !prev);
    };

    const handleSelectLicense = (licenseId) => {
        setSelectedLicense(licenseId);
        setIsLicensePopoverOpen(false);
    };

    const handleSubmit = async (e) => {
        if(e) {
            e.preventDefault();
        }

        if(isSaving || !isDirty) {
            return;
        }

        const selected = LICENSES.find((l) => l.key === selectedLicense);
        setIsSaving(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/projects/${slug}/license`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify({
                    license_id: selected?.key === "no-license" ? null : selected?.key,
                    license_name: selected?.name || null,
                }),
            });

            if(response.ok) {
                setSavedLicense(selectedLicense);
                toast.success(t("license.success"));
            } else {
                toast.error(t("license.errors.save"));
            }
        } catch (err) {
            console.error("Error updating license:", err);
            toast.error(t("license.errors.save"));
        } finally {
            setIsSaving(false);
        }
    };

    const handleClear = () => {
        setSelectedLicense("no-license");
    };

    const isActive = (href) => pathname === href;

    const currentLicenseName = LICENSES.find((l) => l.key === selectedLicense)?.name || t("license.noSelection");

    return (
        <div className="layout">
            <div className="page-content settings-page">
                <div className="sidebar">
                    <div className="sidebar__main">
                        <Link href={`/mod/${project.slug}`} className="sidebar-item">
                            <img src={project.icon_url} alt={t("general.iconAlt")} className="icon" width="28" height="28" style={{ borderRadius: "8px" }} />

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
                        <div className="blog-settings">
                            <div className="blog-settings__body">
                                <p className="blog-settings__field-title">{t("license.title")}</p>

                                <form onSubmit={handleSubmit}>
                                    <div className="field field--default blog-settings__input" ref={licenseRef}>
                                        <label className="field__wrapper" onClick={toggleLicensePopover}>
                                            <div className="field__wrapper-body">
                                                <div className="select">
                                                    <div className="select__selected">{currentLicenseName}</div>
                                                </div>
                                            </div>
                                        </label>

                                        {isLicensePopoverOpen && (
                                            <div className="popover">
                                                <div className="context-list" data-scrollable style={{ maxHeight: "280px", overflowY: "auto" }}>
                                                    {LICENSES.map((license) => (
                                                        <div key={license.id} className={`context-list-option ${selectedLicense === license.key ? "context-list-option--selected" : ""}`} style={{ "--press-duration": "140ms" }} onClick={() => handleSelectLicense(license.key)}>
                                                            <div className="context-list-option__label">
                                                                {license.name}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <button type="button" className="button button--size-m button--type-minimal" style={{ marginTop: "18px" }} onClick={handleClear}>
                                        {t("license.actions.clear")}
                                    </button>
                                </form>

                                <p className="blog-settings__field-title">{t("license.current")}</p>
                                <div className="tags-list">
                                    {selectedLicense !== "no-license" ? (
                                        <div className="button button--size-m button--type-minimal">
                                            {currentLicenseName}
                                        </div>
                                    ) : (
                                        <p>{t("license.noSelection")}</p>
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
                        setSelectedLicense(savedLicense);
                        setIsLicensePopoverOpen(false);
                    }}
                    saveLabel={t("license.actions.save")}
                    resetLabel={t("unsavedBar.reset")}
                    message={t("unsavedBar.message")}
                />
            </div>
        </div>
    );
}