"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
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
    totalProjectVersions: 0,
    totalProjectDownloads: 0,
};

export default function StatisticsModerationPage({ authToken, initialAnalytics }) {
    const t = useTranslations("ModerationPage");
    const locale = useLocale();
    const [analytics, setAnalytics] = useState(initialAnalytics || EMPTY_ANALYTICS);

    useEffect(() => {
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
    }, [authToken, t]);

    return (
        <>
            <div className="analytics-grid">
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

                <div className="content content--padding">
                    <h3>{t("stats.totalProjectVersions")}</h3>
                    <p style={{ fontSize: "2rem", margin: "10px 0" }}>{analytics.totalProjectVersions}</p>
                </div>

                <div className="content content--padding">
                    <h3>{t("stats.totalProjectDownloads")}</h3>
                    <p style={{ fontSize: "2rem", margin: "10px 0" }}>{analytics.totalProjectDownloads}</p>
                </div>
            </div>

            <div className="content content--padding moderation-chart-card" style={{ marginBottom: "15px" }}>
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

            <div className="content content--padding moderation-chart-card" style={{ marginBottom: "15px" }}>
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
        </>
    );
}