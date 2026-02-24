"use client";

import { Fragment, useState, useRef, useEffect } from "react";
import { useAuth } from "../providers/AuthProvider";
import axios from "axios";
import { toast } from "react-toastify";
import Link from "next/link";
import ProjectCard from "../project/ProjectCard";
import { useTranslations, useLocale } from "next-intl";
import UserName from "../ui/UserName";
import Modal from "react-modal";
import ImageLightbox, { useImageLightbox } from "../ui/ImageLightbox";
import RoleBadge from "../ui/RoleBadge";

if(typeof window !== "undefined") {
    Modal.setAppElement("body");
}

const DESCRIPTION_URL_RE = /\bhttps?:\/\/[^\s<]+/gi;

const getSafeExternalUrl = (value) => {
    if(typeof value !== "string") {
        return null;
    }

    try {
        const parsed = new URL(value);
        if(parsed.protocol !== "http:" && parsed.protocol !== "https:") {
            return null;
        }

        return parsed.toString();
    } catch {
        return null;
    }
};

const renderDescription = (desc) => {
    if(!desc) {
        return null;
    }

    const lines = desc.split("\n");
    return lines.map((line, lineIndex) => {
        const parts = [];
        let lastIndex = 0;

        line.replace(DESCRIPTION_URL_RE, (match, offset) => {
            if(offset > lastIndex) {
                parts.push(line.slice(lastIndex, offset));
            }

            const safeUrl = getSafeExternalUrl(match);
            if(safeUrl) {
                parts.push(
                    <a key={`url-${lineIndex}-${offset}`} href={safeUrl} target="_blank" rel="noopener noreferrer">
                        {match.replace(/^https?:\/\//i, "")}
                    </a>
                );
            } else {
                parts.push(match);
            }

            lastIndex = offset + match.length;
            return match;
        });

        if(lastIndex < line.length) {
            parts.push(line.slice(lastIndex));
        }

        return (
            <Fragment key={`line-${lineIndex}`}>
                {parts}
                {lineIndex < lines.length - 1 && <br />}
            </Fragment>
        );
    });
};

const formatDate = (timestamp, locale) => {
    const date = new Date(timestamp);
    const now = new Date();
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString(locale, { month: 'short' });
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const year = date.getFullYear();

    if(year !== now.getFullYear()) {
        return `${day} ${month} ${year} ${hours}:${minutes}`;
    }

    return `${day} ${month} ${hours}:${minutes}`;
};

export default function ProfilePage({ user, isBanned, isSubscribed: initialSubscribed, subscriptionId: initialSubId, authToken }) {
    const t = useTranslations("ProfilePage");
    const locale = useLocale();
    const { isLoggedIn, user: currentUser } = useAuth();
    const [isSubscribed, setIsSubscribed] = useState(initialSubscribed);
    const [subscriptionId, setSubscriptionId] = useState(initialSubId);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [isVerifiedModalOpen, setIsVerifiedModalOpen] = useState(false);
    const [projects, setProjects] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const popoverRef = useRef(null);
    const buttonRef = useRef(null);
    const { lightboxOpen, lightboxImage, closeLightbox, getLightboxTriggerProps } = useImageLightbox();

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                setLoading(true);

                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/users/${user.slug}/projects`, {
                    params: { page: currentPage, limit: 20 },
                });

                setProjects(res.data.projects);
                setTotalPages(res.data.totalPages);
            } catch (err) {
                console.error("Error fetching user projects:", err);
                toast.error(t("errors.loadingProjects"));
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, [user.slug, currentPage]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if(isPopoverOpen && popoverRef.current && !popoverRef.current.contains(event.target) && buttonRef.current && !buttonRef.current.contains(event.target)) {
                setIsPopoverOpen(false);
            }

        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isPopoverOpen]);

    const handleSubscribe = async () => {
        if(!isLoggedIn || !authToken) {
            toast.error(t("loginToSubscribe"));
            return;
        }

        try {
            if(isSubscribed) {
                await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE}/subscriptions/${subscriptionId}`, {
                    headers: { Authorization: `Bearer ${authToken}` },
                });

                setIsSubscribed(false);
                setSubscriptionId(null);
            } else {
                const res = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE}/subscriptions`, { userId: user.id }, { headers: { Authorization: `Bearer ${authToken}` } });
                setIsSubscribed(true);
                setSubscriptionId(res.data.subscriptionId);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || t("errors.subscriptionChange"));
        }
    };

    const togglePopover = () => {
        setIsPopoverOpen((prev) => !prev);
    };

    const authorAva = isBanned ? "https://leonardo.osnova.io/8e95d9d3-932c-5f85-8b53-43da2e8ccaeb/-/format/webp/" : user.avatar || "https://cdn.modifold.com/default_avatar.png";
    const authorTitle = isBanned ? t("accountFrozen") : user.username;
    const desc = isBanned ? null : renderDescription(user.description);

    const countSubs = user.subscribers || 0;
    const countUserSubs = user.subscriptions || 0;

    const isOwnProfile = isLoggedIn && user.id === currentUser.id;

    const getPageButtons = () => {
        const maxButtons = 10;
        let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxButtons - 1);
        if(endPage - startPage + 1 < maxButtons) {
            startPage = Math.max(1, endPage - maxButtons + 1);
        }

        const buttons = [];
        for(let i = startPage; i <= endPage; i++) {
            buttons.push(
                <button key={i} className={`button button--size-m pagination-button ${currentPage === i ? "button--type-primary" : "button--type-secondary"}`} onClick={() => setCurrentPage(i)} aria-current={currentPage === i ? "page" : undefined}>
                    {i}
                </button>
            );
        }

        return buttons;
    };

    const socialIcons = {
        youtube: (
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.6 15.4988V8.50128L15.84 12L9.6 15.4988Z" fill="white"/>
                <path d="M23.4937 6.38795C23.3571 5.89505 23.0897 5.44564 22.7181 5.08471C22.3466 4.72377 21.884 4.46396 21.3766 4.33129C19.5082 3.84003 12 3.84003 12 3.84003C12 3.84003 4.49183 3.84003 2.62336 4.33129C2.11599 4.46396 1.6534 4.72377 1.28186 5.08471C0.910331 5.44564 0.642899 5.89505 0.506332 6.38795C0.157447 8.23915 -0.0118575 10.1181 0.00064491 12C-0.0118575 13.882 0.157447 15.7609 0.506332 17.6121C0.642899 18.105 0.910331 18.5544 1.28186 18.9153C1.6534 19.2763 2.11599 19.5361 2.62336 19.6688C4.49183 20.16 12 20.16 12 20.16C12 20.16 19.5082 20.16 21.3766 19.6688C21.884 19.5361 22.3466 19.2763 22.7181 18.9153C23.0897 18.5544 23.3571 18.105 23.4937 17.6121C23.8426 15.7609 24.0119 13.882 23.9994 12C24.0119 10.1181 23.8426 8.23915 23.4937 6.38795ZM9.60013 15.4972V8.50288L15.8312 12L9.60013 15.4972Z" fill="#307df0"/>
            </svg>
        ),
        telegram: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clip-path="url(#clip0_201_1367)">
            <path d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z" fill="url(#paint0_linear_201_1367)"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M5.43189 11.8733C8.93014 10.3492 11.2628 9.3444 12.43 8.85893C15.7626 7.47282 16.455 7.23203 16.9064 7.22408C17.0056 7.22234 17.2276 7.24694 17.3714 7.3636C17.4928 7.46211 17.5262 7.59518 17.5422 7.68857C17.5581 7.78197 17.578 7.99473 17.5622 8.16097C17.3816 10.0585 16.6002 14.6631 16.2027 16.7884C16.0345 17.6876 15.7032 17.9891 15.3826 18.0186C14.6857 18.0828 14.1566 17.5581 13.4816 17.1157C12.4255 16.4233 11.8288 15.9924 10.8036 15.3168C9.61884 14.536 10.3869 14.1069 11.0621 13.4056C11.2388 13.2221 14.3092 10.4294 14.3686 10.176C14.376 10.1443 14.3829 10.0262 14.3128 9.96385C14.2426 9.90148 14.139 9.92281 14.0643 9.93977C13.9584 9.96381 12.2712 11.079 9.00264 13.2853C8.52373 13.6142 8.08994 13.7744 7.70129 13.766C7.27283 13.7568 6.44864 13.5238 5.83594 13.3246C5.08444 13.0803 4.48716 12.9512 4.53917 12.5363C4.56626 12.3202 4.86383 12.0992 5.43189 11.8733Z" fill="white"/>
            </g>
            <defs>
            <linearGradient id="paint0_linear_201_1367" x1="12" y1="0" x2="12" y2="23.822" gradientUnits="userSpaceOnUse">
            <stop stop-color="#307df0"/>
            <stop offset="1" stop-color="#307df0"/>
            </linearGradient>
            <clipPath id="clip0_201_1367">
            <rect width="24" height="24" fill="#307df0"/>
            </clipPath>
            </defs>
            </svg>
        ),
        x: (
            <svg width="20" height="21" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M0.0180316 25H2.10969L10.296 15.3012L16.8054 25H24L14.299 10.6172L23.2066 0H21.0789L13.3434 9.18442L7.1405 0H0L9.37641 13.9236L0.0180316 25ZM2.88505 1.63483H6.1127L21.0969 23.457H17.8332L2.88505 1.63483Z" fill="#307df0"/>
            </svg>
        ),
        discord: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clip-path="url(#clip0_5_26)">
                    <path d="M24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12Z" fill="url(#paint0_linear_5_26)"/>
                    <path d="M17.6488 6.75727C16.6152 6.29239 15.496 5.95498 14.3303 5.76003C14.3201 5.75972 14.3099 5.76157 14.3005 5.76546C14.2911 5.76934 14.2827 5.77517 14.2759 5.78253C14.136 6.02996 13.9728 6.35238 13.864 6.59981C12.6275 6.41986 11.3701 6.41986 10.1336 6.59981C10.0248 6.34488 9.8616 6.02996 9.71393 5.78253C9.70616 5.76753 9.68285 5.76003 9.65953 5.76003C8.49379 5.95498 7.38244 6.29239 6.34104 6.75727C6.33327 6.75727 6.3255 6.76477 6.31773 6.77227C4.20384 9.82397 3.62097 12.7932 3.90852 15.7324C3.90852 15.7474 3.91629 15.7624 3.93183 15.7699C5.33073 16.7597 6.67522 17.3595 8.00417 17.7569C8.02749 17.7644 8.0508 17.7569 8.05857 17.7419C8.36944 17.3295 8.64922 16.8946 8.89014 16.4372C8.90568 16.4072 8.89014 16.3773 8.85905 16.3698C8.41607 16.2048 7.9964 16.0099 7.5845 15.7849C7.55342 15.7699 7.55342 15.7249 7.57673 15.7024C7.66222 15.6424 7.74771 15.575 7.8332 15.515C7.84874 15.5 7.87206 15.5 7.8876 15.5075C10.561 16.6847 13.4443 16.6847 16.0867 15.5075C16.1022 15.5 16.1255 15.5 16.1411 15.515C16.2266 15.5825 16.3121 15.6424 16.3975 15.7099C16.4286 15.7324 16.4286 15.7774 16.3898 15.7924C15.9856 16.0248 15.5582 16.2123 15.1152 16.3773C15.0841 16.3848 15.0764 16.4222 15.0841 16.4447C15.3328 16.9021 15.6126 17.337 15.9157 17.7494C15.939 17.7569 15.9623 17.7644 15.9856 17.7569C17.3224 17.3595 18.6669 16.7597 20.0658 15.7699C20.0813 15.7624 20.0891 15.7474 20.0891 15.7324C20.431 12.3358 19.5217 9.38908 17.6799 6.77227C17.6721 6.76477 17.6643 6.75727 17.6488 6.75727ZM9.29427 13.9404C8.49379 13.9404 7.82542 13.2281 7.82542 12.3508C7.82542 11.4735 8.47824 10.7612 9.29427 10.7612C10.1181 10.7612 10.7709 11.481 10.7631 12.3508C10.7631 13.2281 10.1103 13.9404 9.29427 13.9404ZM14.7111 13.9404C13.9106 13.9404 13.2423 13.2281 13.2423 12.3508C13.2423 11.4735 13.8951 10.7612 14.7111 10.7612C15.5349 10.7612 16.1877 11.481 16.1799 12.3508C16.1799 13.2281 15.5349 13.9404 14.7111 13.9404Z" fill="white"/>
                </g>
                <defs>
                    <linearGradient id="paint0_linear_5_26" x1="12" y1="0" x2="12" y2="24" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#307df0"/>
                        <stop offset="1" stop-color="#307df0"/>
                    </linearGradient>
                    <clipPath id="clip0_5_26">
                        <rect width="24" height="24" fill="#307df0"/>
                    </clipPath>
                </defs>
            </svg>
        ),
    };

    return (
        <>
            <div className="layout">
                <div className="browse-page">
                    <div className="subsite-header" style={{ width: "300px", maxWidth: "300px" }}>
                        <div className="subsite-header__padding">
                                <div className="subsite-header__header">
                                    <div className="subsite-avatar subsite-header__avatar">
                                        <div className="andropov-media andropov-media--rounded andropov-media--bordered andropov-media--cropped andropov-image andropov-image--zoom subsite-avatar__image" style={{ backgroundColor: "#151824", aspectRatio: "1.5 / 1", maxWidth: "none" }} aria-label={t("openAvatar")} {...getLightboxTriggerProps({ url: authorAva, title: authorTitle })}>
                                            <img className="magnify" src={authorAva} alt={authorTitle} />
                                        </div>
                                    </div>

                                {isLoggedIn && (
                                    <div className="subsite-header__controls">
                                        {currentUser.id === user.id ? (
                                            <Link href="/settings" className="button button--size-m button--type-minimal">{t("edit")}</Link>
                                        ) : (
                                            <>
                                                <button data-blog-id={user.id} className="button button--size-m button--type-primary" style={{ display: isSubscribed ? "none" : "block" }} onClick={handleSubscribe}>{t("subscribe")}</button>

                                                <button data-blog-id={user.id} className="button button--size-m button--type-minimal" style={{ display: isSubscribed ? "block" : "none" }} onClick={handleSubscribe}>{t("subscribed")}</button>
                                            </>
                                        )}

                                        {!isOwnProfile && (
                                            <div className="content-header__actions" style={{ position: "relative", right: "0" }}>
                                                <button ref={buttonRef} className="icon-button content__etc" type="button" onClick={togglePopover} aria-label={t("moreActionsAria")}>
                                                    <svg viewBox="0 0 24 24" className="icon icon--dots" height="24" width="24">
                                                        <path fillRule="evenodd" clipRule="evenodd" d="M5 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM19 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" fill="currentColor" />
                                                    </svg>
                                                </button>

                                                {isPopoverOpen && (
                                                    <div id="popover-overlay" className="popover-overlay">
                                                        <div ref={popoverRef} className="popover" tabIndex={0} style={{ "--width": "207px", "--top": "45px", "--position": "absolute", "--left": "auto", "--right": "15px", "--bottom": "auto", "--distance": "8px" }}>
                                                            <div className="popover__scrollable" style={{ "--max-height": "auto" }}>
                                                                <div className="context-list-option">
                                                                    <div className="context-list-option__label">{t("moreActionsPlaceholder")}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <h1 className="subsite-header__name" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                <UserName showVerifiedIcon={false} user={isBanned ? { username: authorTitle } : user} />

                                {user.isVerified === 1 && (
                                    <img onClick={() => setIsVerifiedModalOpen(true)} src="/badges/verified.png" alt="Verified" style={{ width: "18px", height: "18px", cursor: "pointer" }} />
                                )}

                            </h1>

                            <RoleBadge
                                role={user.isRole}
                                labels={{
                                    developer: t("role.developer"),
                                    team: t("role.team"),
                                }}
                            />

                            <p className="subsite-header__description">{desc}</p>

                            <div class="subsite-header__cols">
                                <div class="subsite-header__date-created">{t("joined")} {formatDate(user.created_at, locale)}</div>
                            </div>

                            <div class="subsite-followers">
                                <div class="subsite-followers__item">
                                    <span>{countSubs}</span> {t("subscribersLabel", { count: countSubs })}
                                </div>

                                <div class="subsite-followers__item">
                                    <span>{countUserSubs}</span> {t("subscriptionsLabel", { count: countUserSubs })}
                                </div>
                            </div>

                            {user.social_links && Object.keys(user.social_links).length > 0 && (
                                <div className="subsite-social-links">
                                    <div className="social-links__list">
                                        {Object.entries(user.social_links).map(([key, url]) => {
                                            const safeUrl = getSafeExternalUrl(url);
                                            return safeUrl ? (
                                                <a key={key} href={safeUrl} target="_blank" rel="noopener noreferrer" className="social-links__item" title={key.charAt(0).toUpperCase() + key.slice(1)}>
                                                    {socialIcons[key] || (
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                                                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                                                        </svg>
                                                    )}
                                                </a>
                                            ) : null;
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        <ImageLightbox isOpen={lightboxOpen} image={lightboxImage} onClose={closeLightbox} dialogLabel={t("lightboxLabel")} closeLabel={t("close")} openInNewTabLabel={t("openInNewTab")} fallbackAlt={authorTitle} />
                    </div>

                    <div className="browse-content">
                        {loading ? (
                            <div className="subsite-empty-feed">
                                <p className="subsite-empty-feed__title">{t("loading")}</p>
                            </div>
                        ) : projects.length > 0 ? (
                            <div className="browse-project-list">
                                {projects.map((project) => (
                                    <ProjectCard key={project.id} project={project} />
                                ))}
                            </div>
                        ) : (
                            <div className="subsite-empty-feed">
                                <p className="subsite-empty-feed__title">{t("noProjects")}</p>
                            </div>
                        )}

                        {totalPages > 1 && (
                            <div className="pagination-controls">
                                <button className="button button--size-m button--type-secondary" onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))} disabled={currentPage === 1} aria-disabled={currentPage === 1}>
                                    {t("previous")}
                                </button>

                                {getPageButtons()}

                                <button className="button button--size-m button--type-secondary" onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} aria-disabled={currentPage === totalPages}>
                                    {t("next")}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Modal isOpen={isVerifiedModalOpen} onRequestClose={() => setIsVerifiedModalOpen(false)} className="modal active" overlayClassName="modal-overlay">
                <div className="modal-window">
                    <div className="modal-window__header">
                        <button className="icon-button modal-window__close" type="button" onClick={() => setIsVerifiedModalOpen(false)} aria-label="Close">
                            <svg className="icon icon--cross" height="24" width="24">
                                <path fillRule="evenodd" clipRule="evenodd" d="M5.293 5.293a1 1 0 0 1 1.414 0L12 10.586l5.293-5.293a1 1 0 0 1 1.414 1.414L13.414 12l5.293 5.293a1 1 0 0 1-1.414 1.414L12 13.414l-5.293 5.293a1 1 0 0 1-1.414-1.414L10.586 12 5.293 6.707a1 1 0 0 1 0-1.414Z"></path>
                            </svg>
                        </button>
                    </div>

                    <div className="modal-window__content">
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                            <img src="/badges/verified.png" alt="Verified" style={{ width: "72px", height: "72px" }} />
                            
                            <p style={{ margin: 0, textAlign: "center" }}>This user is verified by the Modifold team.</p>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
}