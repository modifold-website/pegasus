"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import Link from "next/link";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import sanitizeHtml from "sanitize-html";
import { useTranslations } from "next-intl";

export default function DescriptionSettings({ project, authToken }) {
    const t = useTranslations("SettingsProjectPage");
    const [description, setDescription] = useState(project.description || "");
    const pathname = usePathname();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const sanitizedDescription = sanitizeHtml(description, {
            allowedTags: ["b", "i", "em", "strong", "a", "img", "ul", "li", "br", "p", "div"],
            allowedAttributes: {
                a: ["href"],
                img: ["src", "alt", "width", "height"],
            },
        });

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/projects/${project.slug}/description`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ description: sanitizedDescription }),
        });

        if(response.ok) {
            toast.success(t("description.success"));
        } else {
            toast.error(t("description.errors.save"));
        }
    };

    const isActive = (href) => pathname === href;

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
                        <form onSubmit={handleSubmit}>
                            <div className="blog-settings">
                                <div className="blog-settings__body">
                                    <p className="blog-settings__field-title">{t("description.title")}</p>

                                    <div className="field field--default textarea">
                                        <label style={{ marginBottom: "10px" }} className="field__wrapper">
                                            <textarea
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                placeholder={t("description.placeholder")}
                                                className="autosize textarea__input"
                                                style={{ height: "256px", fontFamily: "monospace" }}
                                                minLength={100}
                                            />
                                        </label>

                                        <p>{t("description.hint")}</p>
                                    </div>

                                    <p className="blog-settings__field-title">{t("description.preview")}</p>
                                    <div className="markdown-body">
                                        <ReactMarkdown
                                            rehypePlugins={[rehypeRaw]}
                                            components={{
                                                a: ({ href, children }) => (
                                                    <a href={href} target="_blank" rel="noopener noreferrer">
                                                        {children}
                                                    </a>
                                                ),
                                            }}
                                        >
                                            {description}
                                        </ReactMarkdown>
                                    </div>

                                    <button type="submit" className="button button--size-m button--type-primary" style={{ marginTop: "18px" }}>
                                        {t("description.actions.save")}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
            </div>
        </div>
    );
}