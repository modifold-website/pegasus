"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "../providers/AuthProvider";
import { useRouter } from "next/navigation";
import DeleteAccountSection from "../DeleteAccountSection";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import UserSettingsSidebar from "@/components/ui/UserSettingsSidebar";

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
                <UserSettingsSidebar
                    user={effectiveUser}
                    profileIconAlt={t("sidebar.profileIconAlt")}
                    labels={{
                        projects: t("sidebar.projects"),
                        notifications: t("sidebar.notifications"),
                        settings: t("sidebar.settings"),
                        apiTokens: t("sidebar.apiTokens"),
                        verification: t("sidebar.verification"),
                    }}
                />

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