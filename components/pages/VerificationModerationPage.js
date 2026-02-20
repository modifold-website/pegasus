"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../providers/AuthProvider";
import { useRouter, usePathname } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import UserName from "../ui/UserName";

export default function VerificationModerationPage({ authToken, initialRequests, initialTotalPages }) {
    const t = useTranslations("VerificationModerationPage");
    const locale = useLocale();
    const { isLoggedIn, user } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const isActive = (href) => pathname === href;
    const [requests, setRequests] = useState(initialRequests || []);
    const [totalPages, setTotalPages] = useState(initialTotalPages || 1);
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState("pending");
    const [isStatusPopoverOpen, setIsStatusPopoverOpen] = useState(false);
    const statusPopoverRef = useRef(null);

    useEffect(() => {
        if(!isLoggedIn || (user.isRole !== "admin" && user.isRole !== "moderator")) {
            router.push("/");
            return;
        }

        const fetchRequests = async () => {
            try {
                const params = { page, limit: 15 };
                if(statusFilter !== "all") {
                    params.status = statusFilter;
                }

                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/moderation/verification`, {
                    headers: { Authorization: `Bearer ${authToken}` },
                    params,
                });

                setRequests(response.data.requests);
                setTotalPages(response.data.totalPages);
            } catch (err) {
                toast.error(t("errors.fetch"));
            }
        };

        fetchRequests();
    }, [isLoggedIn, user, router, authToken, page, statusFilter, t]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if(statusPopoverRef.current && !statusPopoverRef.current.contains(event.target)) {
                setIsStatusPopoverOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleDecision = async (requestId, status) => {
        const note = prompt(t("actions.notePrompt"));
        if(note === null) {
            return;
        }

        try {
            await axios.post(
                `${process.env.NEXT_PUBLIC_API_BASE}/moderation/verification/${requestId}/decision`,
                { status, note: note || "" },
                { headers: { Authorization: `Bearer ${authToken}` } }
            );

            toast.success(status === "approved" ? t("success.approved") : t("success.rejected"));
            setRequests((prev) => prev.filter((item) => item.id !== requestId));
        } catch (err) {
            toast.error(t("errors.update"));
        }
    };

    return (
        <div className="layout">
            <div className="page-content moderation-page">
                <h1 className="moderation--title">{t("title")}</h1>

                <nav className="pagination">
                    <Link href={`/moderation`} className={`pagination__button ${isActive(`/moderation`) ? "pagination__button--active" : ""}`}>
                        {t("tabs.projects")}
                    </Link>

                    <Link href={`/moderation/users`} className={`pagination__button ${isActive(`/moderation/users`) ? "pagination__button--active" : ""}`}>
                        {t("tabs.users")}
                    </Link>

                    <Link href={`/moderation/verification`} className={`pagination__button ${isActive(`/moderation/verification`) ? "pagination__button--active" : ""}`}>
                        {t("tabs.verification")}
                    </Link>
                </nav>

                <div className="field field--default blog-settings__input" style={{ width: "220px", marginBottom: "12px" }} ref={statusPopoverRef}>
                    <label className="field__wrapper" onClick={() => setIsStatusPopoverOpen(!isStatusPopoverOpen)} style={{ cursor: "pointer", background: "var(--theme-color-background-content)" }}>
                        <div className="field__wrapper-body">
                            <div className="select">
                                <div className="select__selected">{t(`filters.${statusFilter}`)}</div>
                            </div>
                        </div>

                        <svg style={{ fill: "none" }} className={`icon icon--chevron_down ${isStatusPopoverOpen ? "rotate" : ""}`} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"></path></svg>
                    </label>

                    {isStatusPopoverOpen && (
                        <div className="popover">
                            <div className="context-list" data-scrollable style={{ maxHeight: "200px", overflowY: "auto" }}>
                                {["pending", "approved", "rejected", "all"].map((status) => (
                                    <div key={status} className={`context-list-option ${statusFilter === status ? "context-list-option--selected" : ""}`} onClick={() => { setStatusFilter(status); setPage(1); setIsStatusPopoverOpen(false); }}>
                                        <div className="context-list-option__label">{t(`filters.${status}`)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="content content--padding" style={{ marginBottom: "15px" }}>
                    {requests.length === 0 ? (
                        <p>{t("empty")}</p>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {requests.map((request) => (
                                <div key={request.id} className="content content--padding" style={{ display: "flex", flexDirection: "column", gap: "8px", background: "var(--theme-color-background)" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                                        <Link href={`/user/${request.slug}`} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                            <img src={request.avatar || "/images/user/default_ava.png"} alt={request.username} width={36} height={36} style={{ borderRadius: "8px" }} />
                                            <UserName user={{ username: request.username, slug: request.slug, isVerified: 0 }} />
                                        </Link>

                                        <span style={{ color: "var(--theme-color-text-secondary)" }}>{t(`statuses.${request.status}`)}</span>
                                    </div>

                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "8px" }}>
                                        <div>
                                            <div style={{ fontWeight: "500" }}>{t("fields.xUrl")}</div>
                                            {request.x_url ? (
                                                <a href={request.x_url} target="_blank" rel="noreferrer" style={{ color: "#1f68c0" }}>{request.x_url}</a>
                                            ) : (
                                                <span style={{ color: "var(--theme-color-text-secondary)" }}>—</span>
                                            )}
                                        </div>

                                        <div>
                                            <div style={{ fontWeight: "500" }}>{t("fields.youtubeUrl")}</div>
                                            {request.youtube_url ? (
                                                <a href={request.youtube_url} target="_blank" rel="noreferrer" style={{ color: "#1f68c0" }}>{request.youtube_url}</a>
                                            ) : (
                                                <span style={{ color: "var(--theme-color-text-secondary)" }}>—</span>
                                            )}
                                        </div>

                                        <div>
                                            <div style={{ fontWeight: "500" }}>{t("fields.curseforgeUrl")}</div>
                                            {request.curseforge_url ? (
                                                <a href={request.curseforge_url} target="_blank" rel="noreferrer" style={{ color: "#1f68c0" }}>{request.curseforge_url}</a>
                                            ) : (
                                                <span style={{ color: "var(--theme-color-text-secondary)" }}>—</span>
                                            )}
                                        </div>

                                        <div>
                                            <div style={{ fontWeight: "500" }}>{t("fields.createdAt")}</div>
                                            <div>{new Date(request.created_at).toLocaleDateString(locale)}</div>
                                        </div>
                                    </div>

                                    {request.note && (
                                        <div>
                                            <div style={{ fontWeight: "500" }}>{t("fields.note")}</div>
                                            <div>{request.note}</div>
                                        </div>
                                    )}

                                    {request.status === "pending" && (
                                        <div style={{ display: "flex", gap: "8px" }}>
                                            <button className="button button--size-m button--type-positive" onClick={() => handleDecision(request.id, "approved")}>{t("actions.approve")}</button>
                                            <button className="button button--size-m button--type-negative" onClick={() => handleDecision(request.id, "rejected")}>{t("actions.reject")}</button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div className="pagination" style={{ marginTop: "20px", alignItems: "center" }}>
                            <button className="button button--size-m button--type-minimal" disabled={page === 1} onClick={() => setPage(page - 1)}>
                                {t("pagination.previous")}
                            </button>

                            <span style={{ margin: "0 10px" }}>
                                {t("pagination.pageOf", { page, totalPages })}
                            </span>

                            <button className="button button--size-m button--type-minimal" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                                {t("pagination.next")}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}