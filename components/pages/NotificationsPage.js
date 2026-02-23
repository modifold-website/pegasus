"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAuth } from "../providers/AuthProvider";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import UserName from "../ui/UserName";
import UserSettingsSidebar from "@/components/ui/UserSettingsSidebar";

const PAGE_LIMIT = 20;
const DEFAULT_AVATAR_URL = "https://media.modifold.com/static/no-project-icon.svg";

const getDayKey = (date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

export default function NotificationsPage({ authToken }) {
    const t = useTranslations("NotificationsPage");
    const tSidebar = useTranslations("SettingsBlogPage.sidebar");
    const locale = useLocale();
    const { isLoggedIn, user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const router = useRouter();

    const dateFormatter = useMemo(() => (
        new Intl.DateTimeFormat(locale || undefined, {
            day: "numeric",
            month: "short",
            year: "numeric",
        })
    ), [locale]);

    const timeFormatter = useMemo(() => (
        new Intl.DateTimeFormat(locale || undefined, {
            hour: "2-digit",
            minute: "2-digit",
        })
    ), [locale]);

    const loadNotifications = async (nextPage = 1, append = false) => {
        const token = authToken || localStorage.getItem("authToken");
        if(!token) {
            setError(t("errors.noToken"));
            setLoading(false);
            return;
        }

        if(append) {
            setLoadingMore(true);
        } else {
            setLoading(true);
        }

        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/notifications`, {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    page: nextPage,
                    limit: PAGE_LIMIT,
                },
            });

            const nextNotifications = Array.isArray(res.data?.notifications) ? res.data.notifications : [];
            const nextTotalPages = Number(res.data?.pagination?.totalPages) || 1;

            setNotifications((prev) => append ? [...prev, ...nextNotifications] : nextNotifications);
            setPage(nextPage);
            setTotalPages(nextTotalPages);
            setError("");

            if(!append && nextPage === 1) {
                try {
                    await axios.post(`${process.env.NEXT_PUBLIC_API_BASE}/notifications/mark-all-read`, {}, {
                        headers: { Authorization: `Bearer ${token}` },
                    });

                    window.dispatchEvent(new CustomEvent("notifications:updated", {
                        detail: { unreadCount: 0 },
                    }));
                } catch (markReadError) {
                    console.error("Error marking notifications as read:", markReadError);
                }
            }
        } catch (fetchError) {
            console.error("Error fetching notifications:", fetchError);
            setError(t("errors.fetch"));
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        if(!isLoggedIn) {
            router.push("/403");
            return;
        }

        loadNotifications(1, false);
    }, [isLoggedIn, router]);

    const sections = useMemo(() => {
        const now = new Date();
        const todayKey = getDayKey(now);
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        const yesterdayKey = getDayKey(yesterday);

        const grouped = [];
        const indexByLabel = new Map();

        for(const notification of notifications) {
            const date = new Date((notification.latestAt || 0) * 1000);
            const dayKey = getDayKey(date);
            let label = dateFormatter.format(date);

            if(dayKey === todayKey) {
                label = t("sections.today");
            } else if(dayKey === yesterdayKey) {
                label = t("sections.yesterday");
            }

            if(!indexByLabel.has(label)) {
                indexByLabel.set(label, grouped.length);
                grouped.push({ label, items: [] });
            }

            grouped[indexByLabel.get(label)].items.push(notification);
        }

        return grouped;
    }, [notifications, dateFormatter, t]);

    const canLoadMore = page < totalPages;

    const renderText = (notification) => {
        const firstActor = notification.actors?.[0];
        const firstActorView = firstActor ? (
            firstActor.slug ? (
                <Link href={`/user/${firstActor.slug}`}><b><UserName user={firstActor} /></b></Link>
            ) : (
                <b><UserName user={firstActor} /></b>
            )
        ) : <b>{t("unknownUser")}</b>;
        const othersCount = Math.max(0, (notification.totalCount || 0) - 1);

        if(notification.eventType === "follow") {
            if(othersCount > 0) {
                return (
                    <>
                        {firstActorView} {t("messages.followManyTail", { count: othersCount })}
                    </>
                );
            }

            return (
                <>
                    {firstActorView} {t("messages.followOneTail")}
                </>
            );
        }

        if(notification.eventType === "project_like") {
            const projectTitle = notification.project?.title || t("messages.projectFallback");
            const projectTitleView = notification.project?.slug ? (
                <Link href={`/mod/${notification.project.slug}`}><b>{projectTitle}</b></Link>
            ) : (
                <b>{projectTitle}</b>
            );

            if(othersCount > 0) {
                return (
                    <>
                        {firstActorView} {t("messages.projectLikeManyMiddle", { count: othersCount })} {projectTitleView}
                    </>
                );
            }

            return (
                <>
                    {firstActorView} {t("messages.projectLikeOneMiddle")} {projectTitleView}
                </>
            );
        }

        return t("messages.unknown");
    };

    const renderNotificationItem = (notification) => {
        const content = (
            <>
                <div className="notification-item__image">
                    <div className="notification-avatars-stack">
                        {notification.actors?.slice(0, 3).map((actor) => (
                            actor.slug ? (
                                <Link key={actor.id} href={`/user/${actor.slug}`}>
                                    <img src={actor.avatar || DEFAULT_AVATAR_URL} alt={actor.username} className="notification-avatars-stack__avatar" loading="lazy" />
                                </Link>
                            ) : (
                                <img key={actor.id} src={actor.avatar || DEFAULT_AVATAR_URL} alt={actor.username} className="notification-avatars-stack__avatar" loading="lazy" />
                            )
                        ))}

                        {notification.eventType === "project_like" && (
                            <svg className="icon icon--tick_filled notification-item__icon notification-item__icon--red" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                                <circle cx="8" cy="8" r="8"/><path fill="#fff" d="M3.115 6.122C3.408 5.1 4.262 4.2 5.705 4.2c.87 0 1.469.306 1.887.533.17.093.31.201.408.267.098-.066.238-.174.408-.267.418-.227 1.018-.533 1.888-.533 1.442 0 2.296.9 2.59 1.922.288 1.007.024 2.266-.711 3.145-.678.81-1.56 1.498-2.345 2.019-.394.262-.76.478-1.048.63-.233.122-.508.284-.782.284-.279 0-.547-.16-.782-.285a13 13 0 0 1-1.049-.629c-.785-.521-1.666-1.21-2.344-2.02-.735-.878-1-2.137-.71-3.144"/>
                            </svg>
                        )}

                        {notification.eventType === "follow" && (
                            <svg className="icon icon--tick_filled notification-item__icon notification-item__icon--blue" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                                <circle cx="8" cy="8" r="8"></circle>
                                <path fill="#fff" d="M3.603 8.308a.34.34 0 0 1 0-.485l.485-.485c.162-.161.373-.111.52.035L6.51 9.415c.07.07.173.07.242 0l4.674-4.811a.335.335 0 0 1 .484 0l.485.484a.335.335 0 0 1 0 .485L6.857 11.32a.31.31 0 0 1-.242.104.31.31 0 0 1-.242-.104z"></path>
                            </svg>
                        )}
                    </div>
                </div>

                <div className="notification-item__body">
                    <div className="notification-item__text">{renderText(notification)}</div>
                    <div className="notification-item__date">
                        {timeFormatter.format(new Date((notification.latestAt || 0) * 1000))}
                    </div>
                </div>

                {notification.eventType === "project_like" && notification.project?.iconUrl && (
                    <div className="notification-item__etc">
                        {notification.project?.slug ? (
                            <Link href={`/mod/${notification.project.slug}`}>
                                <img src={notification.project.iconUrl} alt={notification.project.title} className="notification-project-thumb" loading="lazy" />
                            </Link>
                        ) : (
                            <img src={notification.project.iconUrl} alt={notification.project.title} className="notification-project-thumb" loading="lazy" />
                        )}
                    </div>
                )}
            </>
        );

        return (
            <div key={notification.id} className="notification-item">
                {content}
            </div>
        );
    };

    return (
        <div className="layout">
            <div className="page-content settings-page">
                <UserSettingsSidebar
                    user={user}
                    profileIconAlt={t("sidebarAvatarAlt", { username: user?.username || "" })}
                    labels={{
                        projects: tSidebar("projects"),
                        notifications: tSidebar("notifications"),
                        settings: tSidebar("settings"),
                        apiTokens: tSidebar("apiTokens"),
                        verification: tSidebar("verification"),
                    }}
                />

                <div className="notifications">
                    <div className="notifications__header">
                        <span className="notifications__header-text">{t("title")}</span>
                    </div>

                    {loading ? (
                        <div className="subsite-empty-feed">
                            <p className="subsite-empty-feed__title">{t("loading")}</p>
                        </div>
                    ) : error ? (
                        <div className="subsite-empty-feed">
                            <p className="subsite-empty-feed__title">{error}</p>
                        </div>
                    ) : sections.length === 0 ? (
                        <div className="subsite-empty-feed">
                            <p className="subsite-empty-feed__title">{t("empty")}</p>
                        </div>
                    ) : (
                        <div className="notifications-feed">
                            {sections.map((section) => (
                                <section key={section.label} className="notifications-day-group">
                                    <h3 className="notifications-day-group__title">{section.label}</h3>

                                    <div className="notifications-day-group__items">
                                        {section.items.map(renderNotificationItem)}
                                    </div>
                                </section>
                            ))}

                            {canLoadMore && (
                                <div className="notifications-feed__load-more">
                                    <button className="button button--size-m button--type-secondary" onClick={() => loadNotifications(page + 1, true)} disabled={loadingMore}>
                                        {loadingMore ? t("loadingMore") : t("loadMore")}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}