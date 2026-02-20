"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../providers/AuthProvider";
import { useRouter, usePathname } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";
import { useTranslations } from "next-intl";
import UserName from "../ui/UserName";
import CreateApiTokenModal from "../../modal/CreateApiTokenModal";

export default function SettingsAPIPage() {
    const t = useTranslations("SettingsAPIPage");
    const pathname = usePathname();
    const { isLoggedIn, user } = useAuth();
    const router = useRouter();

    const [tokens, setTokens] = useState([]);
    const [newToken, setNewToken] = useState(null);
    const [form, setForm] = useState({
        name: "",
        duration: "1m",
    });
    const [isTokensLoading, setIsTokensLoading] = useState(false);
    const [isCreatingToken, setIsCreatingToken] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    useEffect(() => {
        if(!isLoggedIn) {
            router.push("/403");
            return;
        }

        loadTokens();
    }, [isLoggedIn, router]);

    const loadTokens = async () => {
        try {
            setIsTokensLoading(true);
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/api-tokens`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
            });

            setTokens(res.data.tokens || []);
        } catch (err) {
            toast.error(t("errors.loadTokens"));
        } finally {
            setIsTokensLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectDuration = (val) => {
        setForm((prev) => ({ ...prev, duration: val }));
        setIsDurationPopoverOpen(false);
    };

    const handleCreateToken = async (e) => {
        e.preventDefault();
        if(!form.name.trim()) {
            toast.error(t("errors.tokenNameRequired"));
            return;
        }

        try {
            setIsCreatingToken(true);
            const res = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE}/api-tokens`, form, {
                headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
            });

            setNewToken(res.data);
            toast.success(t("success.created"));
            setIsCreateModalOpen(false);
            setForm({ name: "", duration: "1m" });
            await loadTokens();
        } catch (err) {
            toast.error(err.response?.data?.message || t("errors.createToken"));
        } finally {
            setIsCreatingToken(false);
        }
    };

    const handleCopyToken = () => {
        if(newToken?.token) {
            navigator.clipboard.writeText(newToken.token);
            toast.success(t("success.copied"));
        }
    };

    const handleRevokeToken = async (tokenId) => {
        if(!confirm(t("confirmRevoke"))) {
            return;
        }

        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE}/api-tokens/${tokenId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
            });

            toast.success(t("success.revoked"));
            loadTokens();
        } catch (err) {
            toast.error(t("errors.revokeToken"));
        }
    };

    const isActive = (href) => pathname === href;

    if(!isLoggedIn) {
        return null;
    }

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

                <div className="settings-wrapper blog-settings">
                    <div className="blog-settings__body">
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                            <p className="blog-settings__field-title" style={{ marginBottom: "0" }}>{t("title")}</p>
                            
                            <button type="button" className="button button--size-m button--type-primary" onClick={() => setIsCreateModalOpen(true)}>
                                {t("createToken")}
                            </button>
                        </div>

                        <p>{t("description")}</p>

                        {newToken && (
                            <div className="new-token-alert">
                                <h3>{t("newTokenTitle")}</h3>
                                <div className="token-display">
                                    <code>{newToken.token}</code>

                                    <button onClick={handleCopyToken} className="button button--size-s button--type-primary">
                                        {t("copy")}
                                    </button>
                                </div>

                                <p style={{ marginBottom: "12px" }}>
                                    <strong>{t("importantLabel")}</strong> {t("importantBody")}
                                </p>

                                <p>
                                    {t("expiresLabel")} {newToken.expires_at ? new Date(newToken.expires_at).toLocaleString() : t("never")}
                                </p>
                            </div>
                        )}

                        <div className="tokens-list" style={{ marginTop: "16px" }}>
                            <p className="blog-settings__field-title">{t("tokensTitle")}</p>

                            {isTokensLoading ? (
                                <p style={{ marginBottom: "12px" }}>{t("loadingTokens")}</p>
                            ) : tokens.length === 0 ? (
                                <p style={{ marginBottom: "12px" }}>{t("noTokens")}</p>
                            ) : (
                                <table className="tokens-table">
                                    <thead>
                                        <tr>
                                            <th>{t("table.name")}</th>
                                            <th>{t("table.token")}</th>
                                            <th>{t("table.created")}</th>
                                            <th>{t("table.expires")}</th>
                                            <th>{t("table.lastUsed")}</th>
                                            <th></th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {tokens.map((token) => (
                                            <tr key={token.id}>
                                                <td>{token.name}</td>
                                                <td>
                                                    <code>{token.token}</code>
                                                </td>
                                                <td>{new Date(token.created_at).toLocaleDateString()}</td>
                                                <td>
                                                    {token.expires_at ? new Date(token.expires_at).toLocaleDateString() : t("never")}
                                                </td>
                                                <td>
                                                    {token.last_used_at ? new Date(token.last_used_at).toLocaleString() : t("never")}
                                                </td>
                                                <td>
                                                    <button onClick={() => handleRevokeToken(token.id)} className="button button--size-s button--type-danger">
                                                        {t("revoke")}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        <div className="api-docs-link">
                            <p>
                                {t("docsPrompt")} {" "}
                                <a href={`${process.env.NEXT_PUBLIC_API_BASE}/api-docs`} target="_blank">
                                    {t("docsLink")}
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <CreateApiTokenModal isOpen={isCreateModalOpen} onRequestClose={() => setIsCreateModalOpen(false)} form={form} onInputChange={handleInputChange} onSelectDuration={handleSelectDuration} onSubmit={handleCreateToken} isCreatingToken={isCreatingToken} />
        </div>
    );
}