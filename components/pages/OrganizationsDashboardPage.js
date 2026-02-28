"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../providers/AuthProvider";
import { useTranslations } from "next-intl";
import UserSettingsSidebar from "@/components/ui/UserSettingsSidebar";
import CreateOrganizationModal from "@/modal/CreateOrganizationModal";

const DEFAULT_ICON_URL = "https://media.modifold.com/static/no-project-icon.svg";

export default function OrganizationsDashboardPage({ authToken, initialOrganizations = [] }) {
    const { user } = useAuth();
    const t = useTranslations("Organizations");
    const tSidebar = useTranslations("SettingsBlogPage.sidebar");
    const [organizations, setOrganizations] = useState(initialOrganizations);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    return (
        <div className="layout">
            <div className="page-content settings-page">
                <UserSettingsSidebar
                    user={user}
                    profileIconAlt={tSidebar("profileIconAlt")}
                    labels={{
                        projects: tSidebar("projects"),
                        organizations: tSidebar("organizations"),
                        notifications: tSidebar("notifications"),
                        settings: tSidebar("settings"),
                        apiTokens: tSidebar("apiTokens"),
                        verification: tSidebar("verification"),
                    }}
                />

                <div className="settings-content">
                    <div className="content content--padding" style={{ width: "100%" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                            <p className="blog-settings__field-title" style={{ marginBottom: "0" }}>{t("dashboard.title")}</p>
                            
                            <button type="button" className="button button--size-m button--type-primary button--active-transform" onClick={() => setIsCreateModalOpen(true)}>
                                {t("dashboard.create")}
                            </button>
                        </div>

                        {organizations.length === 0 ? (
                            <div className="subsite-empty-feed">
                                <p className="subsite-empty-feed__title">{t("dashboard.empty")}</p>
                            </div>
                        ) : (
                            <div style={{ display: "grid", gap: "12px" }}>
                                {organizations.map((organization) => (
                                    <Link key={organization.id} href={`/organization/${organization.slug}`} className="new-project-card" style={{ textDecoration: "none", background: "var(--theme-color-background)" }}>
                                        <img className="new-project-icon" src={organization.icon_url || DEFAULT_ICON_URL} alt={organization.name} />
                                        
                                        <div className="new-project-info">
                                            <div className="new-project-header">
                                                <span className="new-project-title">{organization.name}</span>
                                            </div>

                                            <p className="new-project-description">{organization.summary || t("dashboard.noSummary")}</p>
                                            <p style={{ marginTop: "auto", color: "var(--theme-color-text-secondary)" }}>{t("dashboard.members", { count: organization.members_count || 0 })}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <CreateOrganizationModal
                isOpen={isCreateModalOpen}
                authToken={authToken}
                onRequestClose={() => setIsCreateModalOpen(false)}
                onCreated={(created) => {
                    if(!created?.id) {
                        return;
                    }

                    setOrganizations((prev) => ([
                        {
                            ...created,
                            members_count: 1,
                        },
                        ...prev,
                    ]));
                }}
            />
        </div>
    );
}