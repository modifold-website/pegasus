"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslations } from "next-intl";
import { LICENSES } from "../../Licenses";
import UnsavedChangesBar from "@/components/ui/UnsavedChangesBar";
import ProjectSettingsSidebar from "@/components/ui/ProjectSettingsSidebar";

export default function LicenseSettings({ project, authToken }) {
    const t = useTranslations("SettingsProjectPage");
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

    const currentLicenseName = LICENSES.find((l) => l.key === selectedLicense)?.name || t("license.noSelection");

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