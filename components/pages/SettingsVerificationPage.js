"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../providers/AuthProvider";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import { useLocale, useTranslations } from "next-intl";
import VerificationRequestModal from "../../modal/VerificationRequestModal";
import UserSettingsSidebar from "@/components/ui/UserSettingsSidebar";

export default function SettingsVerificationPage() {
    const t = useTranslations("SettingsVerificationPage");
    const tSidebar = useTranslations("SettingsBlogPage.sidebar");
    const locale = useLocale();
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
                <UserSettingsSidebar
                    user={user}
                    profileIconAlt={t("sidebar.profileIconAlt")}
                    labels={{
                        projects: tSidebar("projects"),
                        organizations: tSidebar("organizations"),
                        notifications: tSidebar("notifications"),
                        settings: tSidebar("settings"),
                        apiTokens: tSidebar("apiTokens"),
                        verification: tSidebar("verification"),
                    }}
                />

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