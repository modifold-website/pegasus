"use client";

import { useState } from "react";
import Link from "next/link";
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useLocale, useTranslations } from "next-intl";
import { getProjectPath } from "@/utils/projectRoutes";
import AnalyticsOnlineInfoModal from "@/modal/AnalyticsOnlineInfoModal";

const RANGE_OPTIONS = ["3d", "7d", "30d", "90d"];
const getTimeRangeHref = (project, range) => {
    const base = getProjectPath(project, "/settings/analytics");
    return range === "7d" ? base : `${base}?time_range=${range}`;
};

const formatChartDate = (date, locale) => {
	const normalized = typeof date === "string" && date.includes("T") ? date : `${date}T00:00:00Z`;
	const value = new Date(normalized);
	return value.toLocaleDateString(locale, { day: "numeric", month: "short" });
};

const formatChartDateTime = (date, locale) => {
	const normalized = typeof date === "string" && date.includes("T") ? date : `${date}T00:00:00Z`;
	const value = new Date(normalized);
	return value.toLocaleString(locale, {
		day: "numeric",
		month: "short",
		hour: "2-digit",
		minute: "2-digit",
	});
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

function OnlineTooltip({ active, payload, locale, t, visibleSeries }) {
	if(!active || !payload?.length) {
		return null;
	}

	const point = payload[0]?.payload;
	if(!point) {
		return null;
	}

	return (
		<div className="project-analytics-tooltip">
			<p>{formatChartDateTime(point.date, locale)}</p>
			{visibleSeries.servers ? <span>{t("analytics.online.tooltipServers", { count: Number(point.servers) || 0 })}</span> : null}
			{visibleSeries.players ? <span>{t("analytics.online.tooltipPlayers", { count: Number(point.players) || 0 })}</span> : null}
		</div>
	);
}

function AnalyticsChart({ title, data, locale, lineColor, gradientId, tooltipLabelKey, t }) {
    return (
        <section className="content content--padding" style={{ padding: "24px" }}>
            <div className="project-analytics-card__header">
                <div>
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
                            tickMargin={8}
                            style={{ fontSize: "12px" }}
                        />
                        <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={24} tickMargin={4} style={{ fontSize: "12px" }} />
                        <Tooltip content={<AnalyticsTooltip locale={locale} labelKey={tooltipLabelKey} t={t} />} />
                        <Area type="monotone" dataKey="count" stroke={lineColor} strokeWidth={3} fill={`url(#${gradientId})`} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
		</section>
	);
}

function OnlineChart({ title, data, locale, t }) {
	const [visibleSeries, setVisibleSeries] = useState({ servers: true, players: true });

	const toggleSeries = (entry) => {
		const dataKey = entry?.dataKey;
		if(dataKey !== "servers" && dataKey !== "players") {
			return;
		}

		setVisibleSeries((prev) => ({
			...prev,
			[dataKey]: !prev[dataKey],
		}));
	};

	return (
		<section className="content content--padding" style={{ padding: "24px" }}>
			<div className="project-analytics-card__header">
				<div>
					<h2 className="project-analytics-card__title">{title}</h2>
				</div>
			</div>

			<div className="project-analytics-chart">
				<ResponsiveContainer width="100%" height={340}>
					<AreaChart data={data}>
						<defs>
							<linearGradient id="projectAnalyticsServers" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="#ff4f5e" stopOpacity={0.24} />
								<stop offset="95%" stopColor="#ff4f5e" stopOpacity={0.03} />
							</linearGradient>
							<linearGradient id="projectAnalyticsPlayers" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="#00af5c" stopOpacity={0.24} />
								<stop offset="95%" stopColor="#00af5c" stopOpacity={0.03} />
							</linearGradient>
						</defs>

						<CartesianGrid stroke="var(--theme-color-text-primary)" strokeDasharray="4 4" strokeOpacity={0.1} vertical={false} />
						<XAxis
							dataKey="date"
							tickFormatter={(value) => formatChartDateTime(value, locale)}
							interval="preserveStartEnd"
							minTickGap={42}
							padding={{ left: 12, right: 12 }}
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							style={{ fontSize: "12px" }}
						/>
						<YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} tickMargin={4} style={{ fontSize: "12px" }} />
						<Tooltip content={<OnlineTooltip locale={locale} t={t} visibleSeries={visibleSeries} />} />
						<Legend
							verticalAlign="bottom"
							iconType="circle"
							iconSize={12}
							onClick={toggleSeries}
							formatter={(value, entry) => (
								<span className={`project-analytics-legend__label ${visibleSeries[entry?.dataKey] === false ? "project-analytics-legend__label--inactive" : ""}`}>{value}</span>
							)}
						/>
						<Area
							name={t("analytics.online.legendServers")}
							type="monotone"
							dataKey="servers"
							stroke="#ff4f5e"
							strokeWidth={3}
							fill="url(#projectAnalyticsServers)"
							hide={!visibleSeries.servers}
						/>
						<Area
							name={t("analytics.online.legendPlayers")}
							type="monotone"
							dataKey="players"
							stroke="#00af5c"
							strokeWidth={3}
							fill="url(#projectAnalyticsPlayers)"
							hide={!visibleSeries.players}
						/>
					</AreaChart>
				</ResponsiveContainer>
			</div>
		</section>
	);
}

export default function ProjectAnalyticsSettingsPage({ project, analytics, selectedTimeRange, onlineSummary = null, onlineSeries = [] }) {
	const t = useTranslations("SettingsProjectPage");
	const locale = useLocale();
	const [isOnlineInfoModalOpen, setIsOnlineInfoModalOpen] = useState(false);
	const regionNames = typeof Intl.DisplayNames === "function" ? new Intl.DisplayNames([locale], { type: "region" }) : null;
	const downloads = Array.isArray(analytics?.downloads) ? analytics.downloads : [];
	const views = Array.isArray(analytics?.views) ? analytics.views : [];
	const countries = Array.isArray(analytics?.countries) ? analytics.countries : [];
	const hasOnline = onlineSeries.length > 0;
	const totals = analytics?.totals || {};
	const activeServersNow = Number(onlineSummary?.activeServersNow) || 0;
	const playersOnlineNow = Number(onlineSummary?.playersOnlineNow) || 0;

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div className="settings-wrapper">
                <div className="settings-content">
                    <div className="blog-settings">
                        <div className="blog-settings__body">
                            <div className="project-analytics">
                                <div className="project-analytics__toolbar">
                                    <p className="blog-settings__field-title" style={{ marginBottom: "0" }}>{t("analytics.title")}</p>
                                    
                                    <div className="project-analytics__ranges">
                                        {RANGE_OPTIONS.map((range) => (
                                            <Link key={range} href={getTimeRangeHref(project, range)} className={`button button--size-m button--active-transform ${selectedTimeRange === range ? "button--type-primary" : "button--type-minimal"}`}>
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
										<p>{t("analytics.live.activeServers")}</p>
										<strong>{activeServersNow}</strong>
									</div>

									<div className="content content--padding project-analytics-stat project-analytics-stat--online">
										<p className="project-analytics-stat__label">
											{t("analytics.stats.onlineNow")}
											
											{!hasOnline && (
												<span className="project-analytics-info" onClick={() => setIsOnlineInfoModalOpen(true)}>
													<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
														<circle cx="12" cy="12" r="10"/>
														<path d="M12 16v-4"/>
														<path d="M12 8h.01"/>
													</svg>
												</span>
											)}
										</p>
										<strong>{playersOnlineNow}</strong>
									</div>
								</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

			{hasOnline ? (
				<OnlineChart
					title={t("analytics.online.title")}
					data={onlineSeries}
					locale={locale}
					t={t}
				/>
			) : null}

			<AnalyticsOnlineInfoModal
				isOpen={isOnlineInfoModalOpen}
				onRequestClose={() => setIsOnlineInfoModalOpen(false)}
			/>

            <AnalyticsChart
                title={t("analytics.downloads.title")}
                data={downloads}
                locale={locale}
                lineColor="#00af5c"
                gradientId="projectAnalyticsDownloads"
                tooltipLabelKey="analytics.downloads.tooltip"
                t={t}
            />

			{countries.length ? (
				<section className="content content--padding" style={{ padding: "24px" }}>
					<div className="project-analytics-card__header">
						<div>
							<p className="project-analytics-card__eyebrow">{t("analytics.countries.eyebrow")}</p>
							<h2 className="project-analytics-card__title" style={{ marginBottom: "0" }}>{t("analytics.countries.title")}</h2>
						</div>
					</div>

					<div className="project-analytics-countries">
						{countries.map((country) => (
							<div key={country.country_code} className="project-analytics-country">
								<div className="project-analytics-country__identity">
									<img src={`https://flagcdn.com/${country.country_code}.svg`} alt={country.country_code.toUpperCase()} className="project-analytics-country__flag" loading="lazy" />

									<div>
										<strong>{regionNames?.of(country.country_code.toUpperCase()) || country.country_code.toUpperCase()}</strong>
									</div>
								</div>

								<strong>{country.count}</strong>
							</div>
						))}
					</div>
				</section>
			) : null}

            <AnalyticsChart
                title={t("analytics.views.title")}
                data={views}
                locale={locale}
                lineColor="#307df0"
                gradientId="projectAnalyticsViews"
                tooltipLabelKey="analytics.views.tooltip"
                t={t}
            />
        </div>
    );
}