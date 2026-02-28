"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import UserName from "../ui/UserName";
const DEFAULT_PROJECT_ICON_URL = "https://media.modifold.com/static/no-project-icon.svg";

export default function HomePage({ news = [], locale, projects = [], projectsLimit = 20 }) {
    const t = useTranslations("HomePage");
    const activeLocale = useLocale();
    const greetings = [
        { label: "Русский", text: "Привет!" },
        { label: "English", text: "Hello!" },
        { label: "Español", text: "¡Hola!" },
        { label: "Português", text: "Olá!" },
        { label: "Türkçe", text: "Merhaba!" },
        { label: "Українська", text: "Привіт!" },
    ];

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(activeLocale || locale, { month: "long", day: "numeric", year: "numeric" });
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

    const creatorSpotlight = useMemo(() => {
        const creators = new Map();

        projects.forEach((project) => {
            if(!project.owner?.slug) {
                return;
            }

            const existing = creators.get(project.owner.slug);
            if(existing) {
                existing.count += 1;
            } else {
                creators.set(project.owner.slug, {
                    slug: project.owner.slug,
                    username: project.owner.username,
                    avatar: project.owner.avatar,
                    profile_url: project.owner.profile_url || `/user/${project.owner.slug}`,
                    count: 1,
                });
            }
        });

        return Array.from(creators.values()).sort((a, b) => b.count - a.count).slice(0, projectsLimit);
    }, [projects]);

    return (
        <>
            <img src="/images/content-upper-1920 (1).jpg" className="fixed-background-teleport" style={{ opacity: ".5 !important" }} alt="" />

            <div className="layout">
                <section className="hero-section">
                    <div className="hero-container">
                        <div className="hero-content animated">
                            <svg width="300" height="708" viewBox="0 0 627 708" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "240px", height: "240px", marginLeft: "auto", marginRight: "auto", marginBottom: "30px" }}>
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

                            <p className="hero-description">
                                {t("heroDescription")}
                            </p>

                            <div className="hero-actions">
                                <Link href="/mods" className="button button--size-xl button--type-primary button--with-icon button--active-transform">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-compass-icon lucide-compass"><circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z"/></svg>
                                    
                                    {t("exploreMods")}
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="stats-section">
                    <div className="stats-header">
                        <h2 className="stats-title">{t("statsTitle", { count: projects.length })}</h2>
                    </div>

                    <div className="mods-marquee">
                        <div className="marquee-content">
                            {displayedProjects.length === 0 && (
                                <div className="mod-badge" style={{ cursor: "default" }}>
                                    <span className="mod-name">{t("noProjects")}</span>
                                </div>
                            )}

                            {displayedProjects.map((project) => (
                                <Link href={`/mod/${project.slug}`} key={project.id} className="mod-badge">
                                    <img src={project.icon_url || DEFAULT_PROJECT_ICON_URL} alt="" className="mod-avatar" width={64} height={64} />
                                    <span className="mod-name">{project.title}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="features-grid">
                    <div className="features-container">
                        <div className="feature-card">
                            <h3 className="feature-title">{t("creatorsSpotlightTitle")}</h3>
                            <p className="feature-text">{t("creatorsSpotlightDescription")}</p>
                        </div>

                        <div className="mods-marquee">
                            <div className="marquee-content">
                                {creatorSpotlight.length === 0 && (
                                    <div className="mod-badge" style={{ cursor: "default" }}>
                                        <span className="mod-name">{t("noCreators")}</span>
                                    </div>
                                )}

                                {creatorSpotlight.map((creator) => (
                                    <Link href={creator.profile_url || `/user/${creator.slug}`} key={creator.slug} className="mod-badge">
                                        <img src={creator.avatar} alt={creator.username} className="mod-avatar" width={64} height={64} />
                                        <span className="mod-name"><UserName user={creator} /></span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="features-grid">
                    <div className="features-container" style={{ flexDirection: "row", justifyContent: "center" }}>
                        <div className="feature-card">
                            <img src="/images/kweebec.png" style={{ width: "345px" }}></img>

                            <h3 className="feature-title">{t("forPlayersTitle")}</h3>
                            <p className="feature-text">
                                {t("forPlayersDescription")}
                            </p>
                        </div>

                        <div className="feature-card">
                            <img src="/images/player.png" style={{ width: "280px" }}></img>

                            <h3 className="feature-title">{t("forCreatorsTitle")}</h3>
                            <p className="feature-text">
                                {t("forCreatorsDescription")}
                            </p>
                        </div>
                    </div>
                </section>

                <section className="features-grid" style={{ paddingTop: "0" }}>
                    <div className="features-container" style={{ flexDirection: "row", justifyContent: "center" }}>
                        <div className="feature-card">
                            <h3 className="feature-title">{t("commentsTitle")}</h3>
                            <p className="feature-text" style={{ marginBottom: "12px" }}>{t("commentsDescription")}</p>

                            <div class="comments" style={{ textAlign: "left" }}>
                                <div class="comment-list">
                                    <div class="comment-item">
                                        <div class="comment" style={{ "--branches-count": "0" }}>
                                            <div class="comment__branches">
                                                <div class="comment-branches"></div>
                                            </div>

                                            <div class="comment__content">
                                                <div class="author" style={{ "--1ebedaf6": "36px" }}>
                                                    <div class="author__avatar">
                                                        <div class="andropov-media andropov-media--rounded andropov-media--bordered andropov-media--loaded andropov-media--has-preview andropov-image" style={{ aspectRatio: "1.77778 / 1", width: "36px", height: "36px", maxWidth: "none", "--background-color": "#33302c" }}>
                                                            <picture>
                                                                <img alt="bogdan" src="/images/Simon.jpg" />
                                                            </picture>
                                                        </div>
                                                    </div>
                                                    
                                                    <div class="author__main" style={{ fontWeight: "500" }}>
                                                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                                            <span>Simon</span>
                                                        </span>
                                                    </div>

                                                    <div class="author__details">
                                                        <span class="comment__detail"><time>Feb 5, 2026, 10:23 PM</time></span>
                                                    </div>
                                                </div>

                                                <div class="comment__break comment__break--author"></div>
                                                
                                                <div class="comment__text">
                                                    <p>I will be the first to leave a comment here. Very good mod! :)</p>
                                                </div>

                                                <div class="comment__actions">
                                                    <button type="button" class="comment__action comment__action--reply">Reply</button>
                                                    
                                                    <div class="comment-menu" style={{ height: "26px" }}>
                                                        <button type="button" class="icon-button" aria-label="More actions">
                                                            <svg viewBox="0 0 24 24" class="icon icon--dots" height="20" width="20">
                                                                <path fill-rule="evenodd" clip-rule="evenodd" d="M5 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM19 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" fill="currentColor"></path>
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="feature-card">
                            <div className="animate-strong">
                                <span>
                                    {greetings.map((item, index) => (
                                        <strong key={item.label} className="main-header-strong">
                                            {item.text}
                                            {index < greetings.length - 1 && <br />}
                                        </strong>
                                    ))}
                                </span>
                            </div>

                            <p className="feature-text" style={{ marginBottom: "12px" }}>{t("localesDescription")}</p>

                            <div class="field field--default" style={{ textAlign: "left", width: "250px" }}>
                                <label class="field__wrapper" style={{ backgroundColor: "var(--theme-color-background-content)" }}>
                                    <div class="field__wrapper-body">
                                        <div class="select">
                                            <div class="select__selected">English</div>
                                        </div>
                                    </div>

                                    <svg class="icon icon--chevron_down rotate" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style={{ fill: "none" }}>
                                        <path d="m6 9 6 6 6-6"></path>
                                    </svg>
                                </label>

                                <div class="popover">
                                    <div class="context-list" data-scrollable="true" style={{ maxHeight: "200px", overflowY: "auto" }}>
                                        <div class="context-list-option context-list-option--selected">
                                            <div class="context-list-option__label">English</div>
                                        </div>

                                        <div class="context-list-option">
                                            <div class="context-list-option__label">Spanish</div>
                                        </div>

                                        <div class="context-list-option">
                                            <div class="context-list-option__label">Portuguese</div>
                                        </div>

                                        <div class="context-list-option">
                                            <div class="context-list-option__label">Russian</div>
                                        </div>

                                        <div class="context-list-option">
                                            <div class="context-list-option__label">Ukrainian</div>
                                        </div>

                                        <div class="context-list-option">
                                            <div class="context-list-option__label">Turkish</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="latest-news">
                    <h2 className="latest-title">{t("latestNewsTitle")}</h2>

                    <div className="news-cards">
                        {news.slice(0, 3).map((article) => (
                            <Link href={`${article.slug}`} className="news-card" key={article.slug}>
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
                        <Link href="/news" className="button button--size-xl button--type-primary">{t("viewAllNews")}</Link>
                    </div>
                </section>
            </div>
        </>
    );
}