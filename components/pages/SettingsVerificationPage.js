"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../providers/AuthProvider";
import { useRouter, usePathname } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { toast } from "react-toastify";
import { useLocale, useTranslations } from "next-intl";
import UserName from "../ui/UserName";
import VerificationRequestModal from "../../modal/VerificationRequestModal";

export default function SettingsVerificationPage() {
    const t = useTranslations("SettingsVerificationPage");
    const locale = useLocale();
    const pathname = usePathname();
    const { isLoggedIn, user } = useAuth();
    const router = useRouter();

    const [verificationStatus, setVerificationStatus] = useState({ isVerified: false, request: null, loading: true });
    const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);

    const fetchVerificationStatus = async () => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/verification/me`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
            });

            setVerificationStatus({
                isVerified: res.data.isVerified === 1,
                request: res.data.request || null,
                loading: false,
            });
        } catch (err) {
            setVerificationStatus((prev) => ({ ...prev, loading: false }));
            toast.error(t("errors.fetch"));
        }
    };

    useEffect(() => {
        if(!isLoggedIn) {
            router.push("/403");
            return;
        }

        fetchVerificationStatus();
    }, [isLoggedIn, router]);

    if(!isLoggedIn) {
        return null;
    }

    const isActive = (href) => pathname === href;
    const verificationRequest = verificationStatus.request;
    const hasPendingRequest = verificationRequest?.status === "pending";
    const hasRejectedRequest = verificationRequest?.status === "rejected";
    const cooldownDaysLeft = (() => {
        if(!hasRejectedRequest || !verificationRequest?.reviewed_at) {
            return 0;
        }

        const reviewedAt = new Date(verificationRequest.reviewed_at);
        if(Number.isNaN(reviewedAt.getTime())) {
            return 0;
        }

        const now = new Date();
        const diffMs = 7 * 24 * 60 * 60 * 1000 - (now - reviewedAt);
        return diffMs > 0 ? Math.ceil(diffMs / (24 * 60 * 60 * 1000)) : 0;
    })();

    const statusLabel = verificationStatus.isVerified ? t("status.verified") : hasPendingRequest ? t("status.pending") : hasRejectedRequest ? t("status.rejected") : t("status.notVerified");

    return (
        <div className="layout">
            <div className="page-content settings-page">
                <div className="sidebar">
                    <div className="sidebar__main">
                        <Link href={`/user/${user.slug}`} className="sidebar-item">
                            <img src={user.avatar} alt={t("sidebar.profileIconAlt")} className="icon" width="28" height="28" style={{ borderRadius: "8px" }} />
                            <UserName user={user} />
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

                <div className="settings-wrapper blog-settings" style={{ height: "max-content" }}>
                    <div className="blog-settings__body">
                        <p class="blog-settings__field-title">{t("title")}</p>
                        
                        <p style={{ marginBottom: "14px", color: "var(--theme-color-text-secondary)" }}>
                            {t("benefitsNote")}
                        </p>

                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                            <div>
                                <p class="blog-settings__field-title" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                    <span>{t("statusLabel")}: {statusLabel}</span>
                                    {verificationStatus.isVerified && (
                                        <img src="/badges/verified.png" alt={t("status.verified")} width="18" height="18" style={{ display: "inline-block" }} />
                                    )}
                                </p>

                                <div style={{ color: "var(--theme-color-text-secondary)" }}>{t("requirements")}</div>
                                
                                {verificationRequest?.created_at && (
                                    <div style={{ color: "var(--theme-color-text-secondary)", marginTop: "6px" }}>
                                        {t("lastRequest", { date: new Date(verificationRequest.created_at).toLocaleDateString(locale) })}
                                    </div>
                                )}
                            </div>

                            {!verificationStatus.isVerified && (
                                <button type="button" className="button button--size-m button--type-primary" onClick={() => setIsVerificationModalOpen(true)} disabled={hasPendingRequest || cooldownDaysLeft > 0}>
                                    {hasPendingRequest ? t("requestPending") : cooldownDaysLeft > 0 ? t("cooldown", { days: cooldownDaysLeft }) : hasRejectedRequest ? t("reapply") : t("request")}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <VerificationRequestModal isOpen={isVerificationModalOpen} onRequestClose={() => setIsVerificationModalOpen(false)} onSubmitted={fetchVerificationStatus} />
        </div>
    );
}