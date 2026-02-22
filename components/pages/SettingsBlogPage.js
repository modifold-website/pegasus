"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "../providers/AuthProvider";
import { useRouter, usePathname } from "next/navigation";
import DeleteAccountSection from "../DeleteAccountSection";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import UserName from "../ui/UserName";

const getEmptySocialLinks = () => ({
    youtube: "",
    telegram: "",
    x: "",
    discord: "",
});

const getInitialFormData = (user) => ({
    username: user?.username || "",
    avatar: null,
    description: user?.description || "",
    social_links: user?.social_links || getEmptySocialLinks(),
});

export default function SettingsBlogPage({ initialUser = null }) {
    const t = useTranslations("SettingsBlogPage");
    const locale = useLocale();
    const pathname = usePathname();
    const { isLoggedIn, user, setUser } = useAuth();
    const router = useRouter();
    const effectiveUser = user || initialUser;

    const [formData, setFormData] = useState(() => getInitialFormData(effectiveUser));

    const [previewAvatar, setPreviewAvatar] = useState(effectiveUser?.avatar || "");
    const avatarInputRef = useRef(null);
    const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
    const languageButtonRef = useRef(null);
    const languageMenuRef = useRef(null);
    const [selectedLocale, setSelectedLocale] = useState(locale || "en");
    const languageLabels = {
        en: t("language.english"),
        es: t("language.spanish"),
        pt: t("language.portuguese"),
        ru: t("language.russian"),
        uk: t("language.ukrainian"),
        tr: t("language.turkish"),
    };

    useEffect(() => {
        if(!isLoggedIn && !initialUser) {
            router.push("/403");
        }
    }, [initialUser, isLoggedIn, router]);

    useEffect(() => {
        if(!effectiveUser) {
            return;
        }

        setFormData(getInitialFormData(effectiveUser));
        setPreviewAvatar(effectiveUser.avatar || "");
    }, [effectiveUser]);

    useEffect(() => {
        setSelectedLocale(locale || "en");
    }, [locale]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if(isLanguageMenuOpen && languageMenuRef.current && !languageMenuRef.current.contains(event.target) && languageButtonRef.current && !languageButtonRef.current.contains(event.target)) {
                setIsLanguageMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isLanguageMenuOpen]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if(name.startsWith("social_links.")) {
            const socialKey = name.split(".")[1];
            setFormData((prev) => ({
                ...prev,
                social_links: { ...prev.social_links, [socialKey]: value },
            }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        const file = files[0];

        if(file && file.size > 20 * 1024 * 1024) {
            toast.error(t("errors.fileTooLarge"));
            return;
        }

        setFormData((prev) => ({ ...prev, [name]: file }));

        const previewUrl = URL.createObjectURL(file);
        if(name === "avatar") {
            setPreviewAvatar(previewUrl);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        data.append("username", formData.username);

        if(formData.avatar) {
            data.append("avatar", formData.avatar);
        }

        data.append("description", formData.description);
        data.append("social_links", JSON.stringify(formData.social_links));

        try {
            const res = await axios.put(`${process.env.NEXT_PUBLIC_API_BASE}/users/me`, data, {
                headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
            });

            setUser(res.data);
            toast.success(t("success"));
        } catch (err) {
            toast.error(t("errors.generic"));
        }
    };

    const handleAvatarOverlayClick = () => {
        avatarInputRef.current?.click();
    };

    const isActive = (href) => pathname === href;

    const toggleLanguageMenu = () => {
        setIsLanguageMenuOpen((prev) => !prev);
    };

    const setLanguage = (newLocale) => {
        setSelectedLocale(newLocale);
        document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
        setIsLanguageMenuOpen(false);
        window.location.reload();
    };

    if(!isLoggedIn && !effectiveUser) {
        return null;
    }

    return (
        <div className="layout">
            <div className="page-content settings-page">
                <div className="sidebar">
                    <div className="sidebar__main">
                        <Link href={`/user/${effectiveUser.slug}`} className="sidebar-item">
                            <img src={effectiveUser.avatar} alt={t("sidebar.profileIconAlt")} className="icon" width="28" height="28" style={{ borderRadius: "8px" }} />
                            <UserName user={effectiveUser} />
                        </Link>

                        <div className="sidebar-separator-view _theme_default _size_s"></div>

                        <Link href="/dashboard" className={`sidebar-item ${isActive("/dashboard") ? "sidebar-item--active" : ""}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon lucide lucide-box-icon lucide-box">
                                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                                <path d="m3.3 7 8.7 5 8.7-5" />
                                <path d="M12 22V12" />
                            </svg>

                            {t("sidebar.projects")}
                        </Link>

                        <Link href="/notifications" className={`sidebar-item ${isActive("/notifications") ? "sidebar-item--active" : ""}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon lucide lucide-bell-icon lucide-bell">
                                <path d="M10.268 21a2 2 0 0 0 3.464 0" />
                                <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
                            </svg>

                            {t("sidebar.notifications")}
                        </Link>

                        <Link href="/settings" className={`sidebar-item ${isActive("/settings") ? "sidebar-item--active" : ""}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon lucide lucide-settings-icon lucide-settings">
                                <path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>

                            {t("sidebar.settings")}
                        </Link>

                        <Link href="/settings/api" className={`sidebar-item ${isActive("/settings/api") ? "sidebar-item--active" : ""}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon lucide lucide-braces-icon lucide-braces"><path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1"/><path d="M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1"/></svg>

                            {t("sidebar.apiTokens")}
                        </Link>

                        <Link href="/settings/verification" className={`sidebar-item ${isActive("/settings/verification") ? "sidebar-item--active" : ""}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon lucide lucide-badge-check-icon lucide-badge-check"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/></svg>

                            {t("sidebar.verification")}
                        </Link>
                    </div>
                </div>

                <form className="settings-wrapper blog-settings" onSubmit={handleSubmit}>
                    <div className="blog-settings__body">
                        <div className="subsite-header">
                            <div className="subsite-avatar subsite-header__avatar">
                                <div className="andropov-media andropov-media--rounded andropov-media--bordered andropov-media--has-preview subsite-avatar__image andropov-image andropov-image--zoom" style={{ aspectRatio: "1 / 1", width: "90px", height: "90px", maxWidth: "none", "--background-color": "#30382d" }} data-loaded="true">
                                    {previewAvatar && <img id="create_image_url_avatar" src={previewAvatar} alt={t("avatarPreviewAlt")} />}
                                </div>

                                <div className="subsite-avatar__overlay" onClick={handleAvatarOverlayClick} aria-label={t("uploadAvatar")}>
                                    <svg className="icon icon--image" width="40" height="40" viewBox="0 0 24 24">
                                        <path d="M8 9.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z"></path>
                                        <path fillRule="evenodd" clipRule="evenodd" d="M7 3a4 4 0 0 0-4 4v10a4 4 0 0 0 4 4h10a4 4 0 0 0 4-4V7a4 4 0 0 0-4-4H7ZM5 7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v5.252l-1.478-1.477a2 2 0 0 0-3.014.214L8.5 19H7a2 2 0 0 1-2-2V7Zm11.108 5.19L19 15.08V17a2 2 0 0 1-2 2h-6l5.108-6.81Z"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <input type="file" id="avatar" name="avatar" accept="image/jpeg,image/png,image/gif" onChange={handleFileChange} ref={avatarInputRef} style={{ display: "none" }} />

                        <p className="blog-settings__field-title">{t("username")}</p>
                        <div className="field field--default blog-settings__input">
                            <label style={{ marginBottom: "10px" }} className="field__wrapper">
                                <input type="text" name="username" value={formData.username} onChange={handleInputChange} placeholder={t("placeholders.username")} className="text-input" maxLength="30" />
                                <div className="counter">{formData.username.length}</div>
                            </label>
                        </div>

                        <p className="blog-settings__field-title">{t("description")}</p>
                        <div className="field field--default textarea blog-settings__input">
                            <label style={{ marginBottom: "10px" }} className="field__wrapper">
                                <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder={t("placeholders.description")} className="autosize textarea__input" style={{ height: "256px" }} />
                            </label>
                        </div>

                        <p className="blog-settings__field-title">{t("language.title")}</p>
                        <div className="field field--default blog-settings__input" ref={languageMenuRef}>
                            <label className="field__wrapper" onClick={toggleLanguageMenu} ref={languageButtonRef} style={{ cursor: "pointer" }}>
                                <div className="field__wrapper-body">
                                    <div className="select">
                                        <div className="select__selected">
                                            {languageLabels[selectedLocale] || t("language.english")}
                                        </div>
                                    </div>
                                </div>

                                <svg style={{ fill: "none" }} className={`icon icon--chevron_down ${isLanguageMenuOpen ? "rotate" : ""}`} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"></path></svg>
                            </label>

                            {isLanguageMenuOpen && (
                                <div className="popover">
                                    <div className="context-list" data-scrollable style={{ maxHeight: "200px", overflowY: "auto" }}>
                                        {Object.entries(languageLabels).map(([code, label]) => (
                                            <div key={code} className={`context-list-option ${selectedLocale === code ? "context-list-option--selected" : ""}`} onClick={() => setLanguage(code)}>
                                                <div className="context-list-option__label">{label}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <p className="blog-settings__field-title">{t("socialNetworks")}</p>
                        <div className="field field--default blog-settings__input">
                            <label style={{ marginBottom: "10px" }} className="field__wrapper">
                                <input type="text" name="social_links.youtube" value={formData.social_links.youtube} onChange={handleInputChange} placeholder={t("placeholders.youtube")} className="text-input" />
                            </label>
                        </div>

                        <div className="field field--default blog-settings__input">
                            <label style={{ marginBottom: "10px" }} className="field__wrapper">
                                <input type="text" name="social_links.telegram" value={formData.social_links.telegram} onChange={handleInputChange} placeholder={t("placeholders.telegram")} className="text-input" />
                            </label>
                        </div>

                        <div className="field field--default blog-settings__input">
                            <label style={{ marginBottom: "10px" }} className="field__wrapper">
                                <input type="text" name="social_links.x" value={formData.social_links.x} onChange={handleInputChange} placeholder={t("placeholders.x")} className="text-input" />
                            </label>
                        </div>

                        <div className="field field--default blog-settings__input">
                            <label style={{ marginBottom: "10px" }} className="field__wrapper">
                                <input type="text" name="social_links.discord" value={formData.social_links.discord} onChange={handleInputChange} placeholder={t("placeholders.discord")} className="text-input" />
                            </label>
                        </div>

                        <button type="submit" className="button button--size-m button--type-primary" style={{ marginTop: "18px" }}>
                            {t("save")}
                        </button>

                        <DeleteAccountSection />
                    </div>
                </form>
            </div>
        </div>
    );
}