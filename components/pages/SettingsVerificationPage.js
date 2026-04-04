"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../providers/AuthProvider";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import { useLocale, useTranslations } from "next-intl";
import VerificationRequestModal from "../../modal/VerificationRequestModal";

export default function SettingsVerificationPage({ initialUser = null, initialVerification = null }) {
    const t = useTranslations("SettingsVerificationPage");
    const locale = useLocale();
    const { isLoggedIn, user } = useAuth();
    const router = useRouter();
    const effectiveUser = user || initialUser;

    const [verificationStatus, setVerificationStatus] = useState(() => ({
        isVerified: initialVerification?.isVerified || false,
        request: initialVerification?.request || null,
        loading: !initialVerification,
    }));
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
        if(!isLoggedIn && !initialUser) {
            router.push("/403");
            return;
        }

        if(!initialVerification) {
            fetchVerificationStatus();
        }
    }, [isLoggedIn, initialUser, initialVerification, router]);

    if(!isLoggedIn && !initialUser) {
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
        <>
            <div className="settings-wrapper blog-settings settings-wrapper--narrow">
                <div className="blog-settings__body">
                    <p className="blog-settings__field-title">{t("title")}</p>
                    
                    <p style={{ marginBottom: "14px", color: "var(--theme-color-text-secondary)" }}>
                        {t("benefitsNote")}
                    </p>

                    <div className="comment" style={{ "--branches-count": 0, padding: 0, marginBottom: "14px", background: "var(--theme-color-background)", borderRadius: "16px", padding: "16px 22px" }}>
                        <div className="comment__branches">
                            <div className="comment-branches"></div>
                        </div>

                        <div className="comment__content" style={{ padding: 0 }}>
                            <div className="author" style={{ "--1ebedaf6": "36px" }}>
                                <div className="author__avatar">
                                    <div className="andropov-media andropov-media--rounded andropov-media--bordered andropov-media--loaded andropov-media--has-preview andropov-image" style={{ aspectRatio: "1.77778 / 1", width: "36px", height: "36px", maxWidth: "none" }}>
                                        <picture>
                                            <img alt={t("promoCard.avatarAlt")} src={effectiveUser?.avatar || "https://media.modifold.com/static/no-project-icon.svg"} />
                                        </picture>
                                    </div>
                                </div>

                                <div className="author__main" style={{ fontWeight: 500 }}>
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                        <span>{effectiveUser?.username || effectiveUser?.slug || t("promoCard.usernameFallback")}</span>
                                        
                                        <img alt={t("status.verified")} src="/badges/verified.png" style={{ width: "18px", height: "18px", display: "inline-block" }} />
                                    </span>
                                </div>

                                <div className="author__details">
                                    <span className="comment__detail"><time>{t("promoCard.timeNow")}</time></span>
                                </div>
                            </div>

                            <div className="comment__break comment__break--author"></div>
                            <div className="comment__text">
                                <p>{t("promoCard.text")}</p>
                            </div>

                            <div className="comment__actions">
                                <div type="button" className="comment__action comment__action--reply">
                                    {t("promoCard.reply")}
                                </div>
                                
                                <div className="comment-menu" style={{ height: "26px" }}>
                                    <div type="button" className="icon-button" aria-label={t("promoCard.moreActions")}>
                                        <svg viewBox="0 0 24 24" className="icon icon--dots" height="20" width="20">
                                            <path fillRule="evenodd" clipRule="evenodd" d="M5 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM19 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" fill="currentColor"></path>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                        <div>
                            <p className="blog-settings__field-title" style={{ display: "flex", alignItems: "center", gap: "4px", ...(verificationStatus.isVerified ? { marginBottom: 0 } : {}) }}>
                                <span>{t("statusLabel")}: {statusLabel}</span>
                                
                                {verificationStatus.isVerified && (
                                    <img src="/badges/verified.png" alt={t("status.verified")} width="18" height="18" style={{ display: "inline-block" }} />
                                )}
                            </p>

                            {!verificationStatus.isVerified && (
                                <div style={{ color: "var(--theme-color-text-secondary)" }}>{t("requirements")}</div>
                            )}
                            
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

            <VerificationRequestModal isOpen={isVerificationModalOpen} onRequestClose={() => setIsVerificationModalOpen(false)} onSubmitted={fetchVerificationStatus} />
        </>
    );
}