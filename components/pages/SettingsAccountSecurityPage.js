"use client";

import { useEffect } from "react";
import { useAuth } from "../providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import UserSettingsSidebar from "@/components/ui/UserSettingsSidebar";
import DeleteAccountSection from "../DeleteAccountSection";

export default function SettingsAccountSecurityPage({ initialUser = null }) {
    const t = useTranslations("SettingsBlogPage");
    const tSidebar = useTranslations("SettingsBlogPage.sidebar");
    const { isLoggedIn, user } = useAuth();
    const router = useRouter();
    const effectiveUser = user || initialUser;

    useEffect(() => {
        if(!isLoggedIn && !initialUser) {
            router.push("/403");
        }
    }, [initialUser, isLoggedIn, router]);

    if(!isLoggedIn && !effectiveUser) {
        return null;
    }

    return (
        <div className="layout">
            <div className="page-content settings-page">
                <UserSettingsSidebar
                    user={effectiveUser}
                    profileIconAlt={t("sidebar.profileIconAlt")}
                    mode="settings"
                    labels={{
                        profile: tSidebar("profile"),
                        appearance: tSidebar("appearance"),
                        language: tSidebar("language"),
                        accountSecurity: tSidebar("accountSecurity"),
                        apiTokens: tSidebar("apiTokens"),
                        verification: tSidebar("verification"),
                    }}
                />

                <div className="settings-wrapper blog-settings">
                    <div className="blog-settings__body">
                        <p className="blog-settings__field-title">{t("accountSecurity.title")}</p>
                        <p style={{ marginBottom: "14px", color: "var(--theme-color-text-secondary)" }}>{t("accountSecurity.description")}</p>

                        <DeleteAccountSection />
                    </div>
                </div>
            </div>
        </div>
    );
}