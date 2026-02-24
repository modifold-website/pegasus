"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../providers/AuthProvider";
import { useRouter, usePathname } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import Link from "next/link";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { useLocale, useTranslations } from "next-intl";

const formatDate = (isoDate, locale) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString(locale, { day: "numeric", month: "short" });
};

const CustomTooltip = ({ active, payload, chartType, locale, t }) => {
    if(active && payload && payload.length) {
        const dataPoint = payload[0].payload;
        const formattedDate = formatDate(dataPoint.date, locale);
        const label = chartType === "registrations" ? t("charts.registrations") : t("charts.projects");

        return (
            <div className="custom-tooltip" style={{ background: "var(--theme-color-background)", padding: "14px", borderRadius: "12px" }}>
                <p className="label">{t("charts.date", { date: formattedDate })}</p>
                <p className="intro">{label}: {dataPoint.count}</p>
            </div>
        );
    }

    return null;
};

const EMPTY_ANALYTICS = {
    approvedProjects: [],
    pendingProjects: [],
    userRegistrations: [],
    totalApproved: 0,
    totalPending: 0,
    totalUsers: 0,
};

export default function StatisticsModerationPage({ authToken, initialAnalytics }) {
    const t = useTranslations("ModerationPage");
    const locale = useLocale();
    const { isLoggedIn, user } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [analytics, setAnalytics] = useState(initialAnalytics || EMPTY_ANALYTICS);
    const isActive = (href) => pathname === href;

    useEffect(() => {
        if(!isLoggedIn || (user.isRole !== "admin" && user.isRole !== "moderator")) {
            router.push("/");
            return;
        }

        const fetchAnalytics = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/moderation/analytics`, {
                    headers: { Authorization: `Bearer ${authToken}` },
                    params: { time_range: "30d" },
                });

                setAnalytics(response.data);
            } catch (err) {
                toast.error(t("errors.fetchAnalytics"));
            }
        };

        fetchAnalytics();
    }, [isLoggedIn, user, router, authToken, t]);

    return (
        <div className="layout">
            <div className="page-content moderation-page">
                <h1 className="moderation--title">{t("title")}</h1>

                <nav className="pagination">
                    <Link href="/moderation" className={`pagination__button ${isActive("/moderation") ? "pagination__button--active" : ""}`}>
                        {t("tabs.projects")}
                    </Link>

                    <Link href="/moderation/reports" className={`pagination__button ${isActive("/moderation/reports") ? "pagination__button--active" : ""}`}>
                        {t("tabs.reports")}
                    </Link>

                    <Link href="/moderation/statistics" className={`pagination__button ${isActive("/moderation/statistics") ? "pagination__button--active" : ""}`}>
                        {t("tabs.statistics")}
                    </Link>

                    <Link href="/moderation/users" className={`pagination__button ${isActive("/moderation/users") ? "pagination__button--active" : ""}`}>
                        {t("tabs.users")}
                    </Link>

                    <Link href="/moderation/verification" className={`pagination__button ${isActive("/moderation/verification") ? "pagination__button--active" : ""}`}>
                        {t("tabs.verification")}
                    </Link>
                </nav>

                <div className="content content--padding" style={{ marginBottom: "15px" }}>
                    <h3>{t("charts.approvedProjects")}</h3>

                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={analytics.approvedProjects}>
                            <defs>
                                <linearGradient id="colorApprovedProjects" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#307df0" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#307df0" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid stroke="var(--theme-color-text-primary)" strokeDasharray="5 5" strokeOpacity={0.1} />
                            <XAxis dataKey="date" tickFormatter={(date) => formatDate(date, locale)} style={{ fontSize: "12px" }} stroke="var(--theme-color-text-primary)" strokeOpacity={0.1} />
                            <YAxis dataKey="count" style={{ fontSize: "12px" }} stroke="var(--theme-color-text-primary)" strokeOpacity={0.1} />
                            <Tooltip content={<CustomTooltip chartType="projects" locale={locale} t={t} />} />
                            <Area type="monotone" dataKey="count" stroke="#307df0" fillOpacity={1} fill="url(#colorApprovedProjects)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="analytics-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(auto, 1fr))", gap: "15px", marginBottom: "15px" }}>
                    <div className="content content--padding">
                        <h3>{t("stats.totalApproved")}</h3>
                        <p style={{ fontSize: "2rem", margin: "10px 0" }}>{analytics.totalApproved}</p>
                    </div>

                    <div className="content content--padding">
                        <h3>{t("stats.totalUsers")}</h3>
                        <p style={{ fontSize: "2rem", margin: "10px 0" }}>{analytics.totalUsers}</p>
                    </div>

                    <div className="content content--padding">
                        <h3>{t("stats.pending")}</h3>
                        <p style={{ fontSize: "2rem", margin: "10px 0" }}>{analytics.totalPending}</p>
                    </div>
                </div>

                <div className="content content--padding" style={{ marginBottom: "15px" }}>
                    <h3>{t("charts.userRegistrations")}</h3>

                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={analytics.userRegistrations}>
                            <defs>
                                <linearGradient id="colorUserRegistrations" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#307df0" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#307df0" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid stroke="var(--theme-color-text-primary)" strokeDasharray="5 5" strokeOpacity={0.1} />
                            <XAxis dataKey="date" tickFormatter={(date) => formatDate(date, locale)} style={{ fontSize: "12px" }} stroke="var(--theme-color-text-primary)" strokeOpacity={0.1} />
                            <YAxis dataKey="count" style={{ fontSize: "12px" }} stroke="var(--theme-color-text-primary)" strokeOpacity={0.1} />
                            <Tooltip content={<CustomTooltip chartType="registrations" locale={locale} t={t} />} />
                            <Area type="monotone" dataKey="count" stroke="#307df0" fillOpacity={1} fill="url(#colorUserRegistrations)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}