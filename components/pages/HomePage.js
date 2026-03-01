"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import ProjectCard from "../project/ProjectCard";
import { useAuth } from "../providers/AuthProvider";
import LoginModal from "../../modal/LoginModal";

const DEFAULT_PROJECT_ICON_URL = "https://media.modifold.com/static/no-project-icon.svg";

export default function HomePage({ news = [], locale, projects = [], projectsLimit = 20 }) {
    const t = useTranslations("HomePage");
    const { isLoggedIn } = useAuth();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const activeLocale = useLocale();
    const currentLocale = activeLocale || locale || "en";

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(currentLocale, { month: "long", day: "numeric", year: "numeric" });
    };

    const hytaleToken = "__HYTALE__";
    const heroTitle = t("heroTitle", { hytale: hytaleToken });
    const [heroTitleBefore, heroTitleAfter] = heroTitle.split(hytaleToken);
    const heroHasToken = heroTitle.includes(hytaleToken);

    const displayedProjects = useMemo(() => {
        const sorted = [...projects];

        sorted.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        return sorted.slice(0, projectsLimit);
    }, [projects]);

    const showcaseProjects = displayedProjects.slice(0, 3);

    return (
        <>
            <img src="/images/hytale_cursebreaker_key_art.jpg" className="fixed-background-teleport" alt="" />

            <div className="layout">
                <section className="hero-section">
                    <div className="hero-container">
                        <div className="hero-content animated">
                            <svg width="300" height="708" viewBox="0 0 627 708" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "208px", height: "208px", marginLeft: "auto", marginRight: "auto", marginBottom: "40px" }}>
                                <path d="M306.947 1.82646C310.997 -0.537246 316.005 -0.537167 320.055 1.82646L620.556 177.239C624.548 179.569 627.003 183.843 627.003 188.465V521.495C627.003 526.14 624.524 530.432 620.502 532.754L320.001 706.248C315.979 708.57 311.023 708.571 307.001 706.248L6.5 532.754C2.47779 530.432 0 526.14 0 521.495V188.465C8.86154e-05 183.843 2.45453 179.569 6.44629 177.239L306.947 1.82646ZM34.6426 200.501V509.501L313.503 671.001L592.363 509.501V200.501L313.503 37.0013L34.6426 200.501ZM560.32 216.501V494.501L313.503 635.001L66.6855 494.501V216.501L313.503 73.0013L560.32 216.501ZM99.502 478.001L300.502 593.001V366.001L99.502 252.001V478.001ZM329.502 366.332V592.001L529.502 477.676V251.001L329.502 366.332ZM279.502 516.004V552.173L249.502 535.004V499.004L279.502 516.004ZM379.502 535.003L349.502 552.172V516.003L379.502 499.003V535.003ZM151.502 444.004V480.004L120.502 463.004V427.004L151.502 444.004ZM508.502 463.003L477.502 480.003V444.003L508.502 427.003V463.003ZM225.502 392.004V459.004L169.502 428.004V361.004L225.502 392.004ZM459.502 428.003L403.502 459.003V392.003L459.502 361.003V428.003ZM280.502 383.004V421.004L249.502 404.004V366.004L280.502 383.004ZM379.502 404.003L348.502 421.003V383.003L379.502 366.003V404.003ZM151.502 313.004V349.004L120.502 332.004V296.004L151.502 313.004ZM508.502 332.003L477.502 349.003V313.003L508.502 296.003V332.003Z" fill="#2041DA"></path>
                            </svg>

                            <h1 className="hero-title">
                                {heroHasToken ? (
                                    <>
                                        {heroTitleBefore}
                                        <span className="highlight-text">Hytale</span>
                                        {heroTitleAfter}
                                    </>
                                ) : (
                                    heroTitle
                                )}
                            </h1>

                            <p className="hero-description">{t("heroDescription")}</p>

                            <div className="hero-actions">
                                <Link href="/mods" className="button button--size-xl button--type-primary button--with-icon button--active-transform">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10" />
                                        <path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z" />
                                    </svg>

                                    {t("exploreMods")}
                                </Link>

                                {isLoggedIn ? (
                                    <Link href="/dashboard" className="button button--size-xl button--type-secondary button--with-icon button--active-transform">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-layout-panel-left-icon lucide-layout-panel-left">
                                            <rect width="7" height="18" x="3" y="3" rx="1"/>
                                            <rect width="7" height="7" x="14" y="3" rx="1"/>
                                            <rect width="7" height="7" x="14" y="14" rx="1"/>
                                        </svg>
                                        
                                        {t("dashboardCta")}
                                    </Link>
                                ) : (
                                    <button className="button button--size-xl button--type-secondary button--with-icon button--active-transform" type="button" onClick={() => setIsLoginModalOpen(true)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-log-in-icon lucide-log-in">
                                            <path d="m10 17 5-5-5-5"/>
                                            <path d="M15 12H3"/>
                                            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                                        </svg>
                                        
                                        {t("loginCta")}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="stats-section">
                    <div className="mods-marquee">
                        <div className="marquee-content">
                            {displayedProjects.length === 0 && (
                                <div className="mod-badge" style={{ cursor: "default" }}>
                                    <span className="mod-name">{t("noProjects")}</span>
                                </div>
                            )}

                            {displayedProjects.map((project) => (
                                <Link href={`/mod/${project.slug}`} key={project.id} className="mod-badge button--active-transform">
                                    <img src={project.icon_url || DEFAULT_PROJECT_ICON_URL} alt="" className="mod-avatar" width={64} height={64} />
                                    <span className="mod-name">{project.title}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="home-showcase-section">
                    <div className="showcase-shell">
                        <div className="showcase-copy">
                            <span className="home-pill home-pill--players" style={{ width: "fit-content" }}>{t("showcase.playersBadge")}</span>

                            <h3>{t("showcase.playersTitle")}</h3>
                            
                            <p>{t("showcase.playersLead")}</p>
                        </div>

                        <div className="showcase-visual">
                            <div className="sort-controls">
                                <div className="field field--large" style={{ width: "100%" }}>
                                    <label className="field__wrapper" style={{ background: "var(--theme-color-background-content)" }}>
                                        <div className="field__wrapper-body">
                                            <svg className="icon icon--search field__icon field__icon--left" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="m21 21-4.34-4.34" />
                                                <circle cx="11" cy="11" r="8" />
                                            </svg>

                                            <input type="text" placeholder={t("showcase.searchPlaceholder")} value="" readOnly className="text-input" />
                                        </div>
                                    </label>
                                </div>

                                <div style={{ display: "flex", gap: "12px", flexDirection: "row", alignItems: "center" }}>
                                    <div className="sort-wrapper">
                                        <div className="dropdown">
                                            <button className="dropdown__label" type="button" disabled style={{ cursor: "default" }}>
                                                {t("showcase.sortRelevance")}
                                                <svg style={{ fill: "none" }} xmlns="http://www.w3.org/2000/svg" className="icon icon--chevron_up" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="m6 9 6 6 6-6" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="browse-project-list">
                                {showcaseProjects.length === 0 && (
                                    <div className="subsite-empty-feed">
                                        <p className="subsite-empty-feed__title">{t("noProjects")}</p>
                                    </div>
                                )}

                                {showcaseProjects.map((project) => (
                                    <ProjectCard key={`showcase-${project.id}`} maxTags={3} project={project} />
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="creator-features-section">
                    <div className="home-section-intro">
                        <span className="home-pill home-pill--creators">{t("creatorSection.badge")}</span>
                        
                        <h2 className="home-section-title">{t("creatorSection.title")}</h2>
                        
                        <p className="home-section-lead">{t("creatorSection.lead")}</p>
                    </div>

                    <div className="creator-features-grid">
                        <article className="creator-feature-card">
                            <div className="creator-feature-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users-round-icon lucide-users-round">
                                    <path d="M18 21a8 8 0 0 0-16 0"/>
                                    <circle cx="10" cy="8" r="5"/>
                                    <path d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3"/>
                                </svg>
                            </div>

                            <h3>{t("creatorCards.team.title")}</h3>
                            <p>{t("creatorCards.team.description")}</p>
                        </article>

                        <article className="creator-feature-card">
                            <div className="creator-feature-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-git-branch-icon lucide-git-branch">
                                    <path d="M15 6a9 9 0 0 0-9 9V3"/>
                                    <circle cx="18" cy="6" r="3"/>
                                    <circle cx="6" cy="18" r="3"/>
                                </svg>
                            </div>

                            <h3>{t("creatorCards.versions.title")}</h3>
                            <p>{t("creatorCards.versions.description")}</p>
                        </article>

                        <article className="creator-feature-card">
                            <div className="creator-feature-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-text-icon lucide-file-text">
                                    <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/>
                                    <path d="M14 2v5a1 1 0 0 0 1 1h5"/>
                                    <path d="M10 9H8"/>
                                    <path d="M16 13H8"/>
                                    <path d="M16 17H8"/>
                                </svg>
                            </div>

                            <h3>{t("creatorCards.pages.title")}</h3>
                            <p>{t("creatorCards.pages.description")}</p>
                        </article>

                        <article className="creator-feature-card">
                            <div className="creator-feature-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-circle-icon lucide-message-circle">
                                    <path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719"/>
                                </svg>
                            </div>

                            <h3>{t("creatorCards.feedback.title")}</h3>
                            <p>{t("creatorCards.feedback.description")}</p>
                        </article>

                        <article className="creator-feature-card">
                            <div className="creator-feature-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-check-icon lucide-shield-check">
                                    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
                                    <path d="m9 12 2 2 4-4"/>
                                </svg>
                            </div>

                            <h3>{t("creatorCards.moderation.title")}</h3>
                            <p>{t("creatorCards.moderation.description")}</p>
                        </article>

                        <article className="creator-feature-card">
                            <div className="creator-feature-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bell-ring-icon lucide-bell-ring">
                                    <path d="M10.268 21a2 2 0 0 0 3.464 0"/>
                                    <path d="M22 8c0-2.3-.8-4.3-2-6"/>
                                    <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>
                                    <path d="M4 2C2.8 3.7 2 5.7 2 8"/>
                                </svg>
                            </div>

                            <h3>{t("creatorCards.notifications.title")}</h3>
                            <p>{t("creatorCards.notifications.description")}</p>
                        </article>
                    </div>
                </section>

                <section className="latest-news">
                    <h2 className="latest-title">{t("latestNewsTitle")}</h2>

                    <div className="news-cards">
                        {news.slice(0, 3).map((article) => (
                            <Link href={`${article.slug}`} className="news-card button--active-transform" key={article.slug}>
                                <img src={article.image || "/images/placeholder.png"} alt={article.title} className="news-image" />
                                
                                <div className="news-content">
                                    <h3>{article.title}</h3>
                                    <p>{article.description}</p>
                                    <span>{formatDate(article.date)}</span>
                                </div>
                            </Link>
                        ))}
                    </div>

                    <div className="view-all">
                        <Link href="/news" className="button button--size-xl button--type-primary button--with-icon button--active-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon lucide lucide-newspaper-icon lucide-newspaper">
                                <path d="M15 18h-5"/>
                                <path d="M18 14h-8"/>
                                <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0v-9a2 2 0 0 1 2-2h2"/>
                                <rect width="8" height="4" x="10" y="6" rx="1"/>
                            </svg>
                            
                            {t("viewAllNews")}
                        </Link>
                    </div>
                </section>
            </div>

            <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
        </>
    );
}