"use client";

import Link from "next/link";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useLocale, useTranslations } from "next-intl";
import ProjectSettingsSidebar from "@/components/ui/ProjectSettingsSidebar";

const RANGE_OPTIONS = ["7d", "30d", "90d"];

const formatChartDate = (date, locale) => {
    const value = new Date(`${date}T00:00:00Z`);
    return value.toLocaleDateString(locale, { day: "numeric", month: "short" });
};

function AnalyticsTooltip({ active, payload, locale, labelKey, t }) {
    if(!active || !payload?.length) {
        return null;
    }

    const point = payload[0]?.payload;
    if(!point) {
        return null;
    }

    return (
        <div className="project-analytics-tooltip">
            <p>{formatChartDate(point.date, locale)}</p>
            <span>{t(labelKey, { count: point.count })}</span>
        </div>
    );
}

function AnalyticsChart({ title, description, total, data, locale, lineColor, gradientId, tooltipLabelKey, t }) {
    return (
        <section className="content content--padding project-analytics-card">
            <div className="project-analytics-card__header">
                <div>
                    <p className="project-analytics-card__eyebrow">{description}</p>
                    <h2 className="project-analytics-card__title">{title}</h2>
                </div>
            </div>

            <div className="project-analytics-chart">
                <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={lineColor} stopOpacity={0.32} />
                                <stop offset="95%" stopColor={lineColor} stopOpacity={0.02} />
                            </linearGradient>
                        </defs>

                        <CartesianGrid stroke="var(--theme-color-text-primary)" strokeDasharray="4 4" strokeOpacity={0.1} vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickFormatter={(value) => formatChartDate(value, locale)}
                            minTickGap={24}
                            tickLine={false}
                            axisLine={false}
                            style={{ fontSize: "12px" }}
                        />
                        <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={36} style={{ fontSize: "12px" }} />
                        <Tooltip content={<AnalyticsTooltip locale={locale} labelKey={tooltipLabelKey} t={t} />} />
                        <Area type="monotone" dataKey="count" stroke={lineColor} strokeWidth={3} fill={`url(#${gradientId})`} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </section>
    );
}

export default function ProjectAnalyticsSettingsPage({ project, analytics, selectedTimeRange }) {
    const t = useTranslations("SettingsProjectPage");
    const locale = useLocale();
    const regionNames = typeof Intl.DisplayNames === "function" ? new Intl.DisplayNames([locale], { type: "region" }) : null;
    const downloads = Array.isArray(analytics?.downloads) ? analytics.downloads : [];
    const views = Array.isArray(analytics?.views) ? analytics.views : [];
    const countries = Array.isArray(analytics?.countries) ? analytics.countries : [];
    const totals = analytics?.totals || {};

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
                        analytics: t("sidebar.analytics"),
                        moderation: t("sidebar.moderation"),
                    }}
                />

                <div className="content content--padding" style={{ width: "100%" }}>
                    <div className="project-analytics">
                        <div className="project-analytics__toolbar">
                            <h2 style={{ marginBottom: "0" }}>{t("analytics.title")}</h2>
                            
                            <div className="project-analytics__ranges">
                                {RANGE_OPTIONS.map((range) => (
                                    <Link key={range} href={`/mod/${project.slug}/settings/analytics?time_range=${range}`} className={`button button--size-m button--active-transform ${selectedTimeRange === range ? "button--type-primary" : "button--type-minimal"}`}>
                                        {t(`analytics.ranges.${range}`)}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="project-analytics__stats">
                            <div className="content content--padding project-analytics-stat">
                                <p>{t("analytics.stats.downloads")}</p>
                                <strong>{totals.downloads || 0}</strong>
                            </div>

                            <div className="content content--padding project-analytics-stat">
                                <p>{t("analytics.stats.views")}</p>
                                <strong>{totals.views || 0}</strong>
                            </div>

                            <div className="content content--padding project-analytics-stat">
                                <p>{t("analytics.stats.countries")}</p>
                                <strong>{countries.length}</strong>
                            </div>
                        </div>

                        <AnalyticsChart
                            title={t("analytics.downloads.title")}
                            description={t(`analytics.ranges.${selectedTimeRange}`)}
                            total={totals.downloads || 0}
                            data={downloads}
                            locale={locale}
                            lineColor="#00af5c"
                            gradientId="projectAnalyticsDownloads"
                            tooltipLabelKey="analytics.downloads.tooltip"
                            t={t}
                        />

                        <section className="content content--padding project-analytics-card">
                            <div className="project-analytics-card__header">
                                <div>
                                    <p className="project-analytics-card__eyebrow">{t("analytics.countries.eyebrow")}</p>
                                    <h2 className="project-analytics-card__title" style={{ marginBottom: "0" }}>{t("analytics.countries.title")}</h2>
                                </div>
                            </div>

                            {countries.length ? (
                                <div className="project-analytics-countries">
                                    {countries.map((country) => (
                                        <div key={country.country_code} className="project-analytics-country">
                                            <div className="project-analytics-country__identity">
                                                <img src={`https://flagcdn.com/${country.country_code}.svg`} alt={country.country_code.toUpperCase()} className="project-analytics-country__flag" loading="lazy" />

                                                <div>
                                                    <strong>{regionNames?.of(country.country_code.toUpperCase()) || country.country_code.toUpperCase()}</strong>
                                                    <p>{t("analytics.countries.countryCode", { code: country.country_code.toUpperCase() })}</p>
                                                </div>
                                            </div>

                                            <strong>{t("analytics.countries.downloads", { count: country.count })}</strong>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="project-analytics-empty">{t("analytics.countries.empty")}</p>
                            )}
                        </section>

                        <AnalyticsChart
                            title={t("analytics.views.title")}
                            description={t(`analytics.ranges.${selectedTimeRange}`)}
                            total={totals.views || 0}
                            data={views}
                            locale={locale}
                            lineColor="#307df0"
                            gradientId="projectAnalyticsViews"
                            tooltipLabelKey="analytics.views.tooltip"
                            t={t}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}