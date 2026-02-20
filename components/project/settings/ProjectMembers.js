"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../providers/AuthProvider";
import { useRouter, usePathname } from "next/navigation";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";
import { useTranslations } from "next-intl";
import UserName from "../../ui/UserName";

const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
};

export default function ProjectMembers({ project }) {
    const t = useTranslations("SettingsProjectPage");
    const { isLoggedIn, user } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const [username, setUsername] = useState("");
    const [members, setMembers] = useState(project.members || []);
    const [editedRoles, setEditedRoles] = useState({});

    const fetchMembers = async () => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/projects/${project.slug}/members`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                },
            });

            setMembers(response.data);
            setEditedRoles({});
        } catch (err) {
            toast.error(t("members.errors.fetch"));
        }
    };

    useEffect(() => {
        if(!isLoggedIn) {
            router.push("/403");
        } else if(project && project.user_id !== user.id) {
            router.push("/403");
        } else {
            fetchMembers();
        }
    }, [isLoggedIn, project, user, router]);

    const handleInvite = async (e) => {
        e.preventDefault();
        if(!username) {
            toast.error(t("members.errors.enterUsername"));
            return;
        }

        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_BASE}/projects/${project.slug}/members`,
                { username, role: "Member" },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if(response.data.success) {
                await fetchMembers();
                setUsername("");
                toast.success(t("members.success.inviteSent"));
            } else {
                toast.error(response.data.message || t("members.errors.invite"));
            }
        } catch (err) {
            toast.error(err.response?.data?.message || t("members.errors.invite"));
        }
    };

    const debouncedHandleRoleChange = useCallback(debounce(handleRoleChange, 500), []);

    const handleRoleInputChange = (userId, newRole, originalRole) => {
        setEditedRoles((prev) => ({
            ...prev,
            [userId]: newRole,
        }));
    };

    const handleRoleChange = async (userId, newRole, username) => {
        if(!newRole.trim()) {
            toast.error(t("members.errors.roleEmpty"));
            return;
        }

        if(newRole.length > 50) {
            toast.error(t("members.errors.roleTooLong"));
            return;
        }

        try {
            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_API_BASE}/projects/${project.slug}/members/${userId}`,
                { role: newRole },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if(response.data.success) {
                await fetchMembers();
                toast.success(t("members.success.roleUpdated"));
            } else {
                toast.error(response.data.message || t("members.errors.updateRole"));
            }
        } catch (err) {
            toast.error(err.response?.data?.message || t("members.errors.updateRole"));
        }
    };

    const handleRemove = async (userId, username) => {
        if(!confirm(t("members.confirmRemove", { username }))) {
            return;
        }

        try {
            const response = await axios.delete(
                `${process.env.NEXT_PUBLIC_API_BASE}/projects/${project.slug}/members/${userId}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                    },
                }
            );

            if(response.data.success) {
                await fetchMembers();
                toast.success(t("members.success.removed"));
            } else {
                toast.error(response.data.message || t("members.errors.remove"));
            }
        } catch (err) {
            toast.error(err.response?.data?.message || t("members.errors.remove"));
        }
    };

    const handleLeave = async () => {
        if(!confirm(t("members.confirmLeave", { title: project.title }))) {
            return;
        }

        try {
            const response = await axios.delete(
                `${process.env.NEXT_PUBLIC_API_BASE}/projects/${project.slug}/members/${user.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                    },
                }
            );

            if(response.data.success) {
                toast.success(t("members.success.left"));
                router.push("/");
            } else {
                toast.error(response.data.message || t("members.errors.leave"));
            }
        } catch (err) {
            toast.error(err.response?.data?.message || t("members.errors.leave"));
        }
    };

    if(!isLoggedIn || !project) {
        return null;
    }

    const isActive = (href) => pathname === href;

    const getStatusLabel = (status) => {
        try {
            return t(`members.status.${status}`);
        } catch (err) {
            return status;
        }
    };

    return (
        <div className="layout">
            <div className="page-content settings-page">
                <div className="sidebar">
                    <div className="sidebar__main">
                        <Link href={`/mod/${project.slug}`} className="sidebar-item">
                            <img src={project.icon_url} alt={t("general.iconAlt")} className="icon" width="28" height="28" style={{ borderRadius: "8px" }} />

                            {project.title}
                        </Link>

                        <div className="sidebar-separator-view _theme_default _size_s"></div>

                        <Link href={`/mod/${project.slug}/settings`} className={`sidebar-item ${isActive(`/mod/${project.slug}/settings`) ? "sidebar-item--active" : ""}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon lucide-settings-icon lucide-settings">
                                <path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>

                            {t("sidebar.general")}
                        </Link>

                        <Link href={`/mod/${project.slug}/settings/description`} className={`sidebar-item ${isActive(`/mod/${project.slug}/settings/description`) ? "sidebar-item--active" : ""}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon lucide-type-icon lucide-type">
                                <path d="M12 4v16" />
                                <path d="M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2" />
                                <path d="M9 20h6" />
                            </svg>

                            {t("sidebar.description")}
                        </Link>

                        <Link href={`/mod/${project.slug}/settings/links`} className={`sidebar-item ${isActive(`/mod/${project.slug}/settings/links`) ? "sidebar-item--active" : ""}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon lucide-link-icon lucide-link">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                            </svg>

                            {t("sidebar.links")}
                        </Link>

                        <Link href={`/mod/${project.slug}/settings/versions`} className={`sidebar-item ${isActive(`/mod/${project.slug}/settings/versions`) ? "sidebar-item--active" : ""}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon lucide-arrow-down-to-line-icon lucide-arrow-down-to-line">
                                <path d="M12 17V3" />
                                <path d="m6 11 6 6 6-6" />
                                <path d="M19 21H5" />
                            </svg>

                            {t("sidebar.versions")}
                        </Link>

                        <Link href={`/mod/${project.slug}/settings/gallery`} className={`sidebar-item ${isActive(`/mod/${project.slug}/settings/gallery`) ? "sidebar-item--active" : ""}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon lucide-image-icon lucide-image">
                                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                                <circle cx="9" cy="9" r="2" />
                                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                            </svg>

                            {t("sidebar.gallery")}
                        </Link>

                        <Link href={`/mod/${project.slug}/settings/tags`} className={`sidebar-item ${isActive(`/mod/${project.slug}/settings/tags`) ? "sidebar-item--active" : ""}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon lucide lucide-tag-icon lucide-tag">
                                <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
                                <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
                            </svg>

                            {t("sidebar.tags")}
                        </Link>

                        <Link href={`/mod/${project.slug}/settings/license`} className={`sidebar-item ${isActive(`/mod/${project.slug}/settings/license`) ? "sidebar-item--active" : ""}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon--settings"><circle cx="12" cy="12" r="10"/><path d="M14.83 14.83a4 4 0 1 1 0-5.66"/></svg>

                            {t("sidebar.license")}
                        </Link>

                        <Link href={`/mod/${project.slug}/settings/moderation`} className={`sidebar-item ${isActive(`/mod/${project.slug}/settings/moderation`) ? "sidebar-item--active" : ""}`}>
                            <svg className="icon icon--settings" height="24" width="24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m3 6 3 1m0 0-3 9a5 5 0 0 0 6.001 0M6 7l3 9M6 7l6-2m6 2 3-1m-3 1-3 9a5 5 0 0 0 6.001 0M18 7l3 9m-3-9-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                            </svg>

                            {t("sidebar.moderation")}
                        </Link>

                        <Link href={`/mod/${project.slug}/settings/members`} className={`sidebar-item ${isActive(`/mod/${project.slug}/settings/members`) ? "sidebar-item--active" : ""}`}>
                            <svg className="icon icon--settings" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><path d="M16 3.128a4 4 0 0 1 0 7.744"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/></svg>

                            {t("sidebar.members")}
                        </Link>
                    </div>
                </div>

                <div className="settings-wrapper" style={{ width: "100%" }}>
                    <div className="settings-content">
                        <form onSubmit={handleInvite}>
                            <div className="blog-settings">
                                <div className="blog-settings__body">
                                    <p className="blog-settings__field-title">{t("members.inviteTitle")}</p>

                                    <p style={{ marginBottom: "10px" }}>{t("members.inviteDescription")}</p>

                                    <div className="field field--default blog-settings__input">
                                        <label style={{ marginBottom: "10px" }} className="field__wrapper">
                                            <input type="text" name="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder={t("members.placeholders.username")} className="text-input" />
                                        </label>
                                    </div>

                                    <button type="submit" className="button button--size-m button--type-primary">
                                        {t("members.actions.invite")}
                                    </button>
                                </div>
                            </div>
                        </form>

                        {user.id !== project.user_id && (
                            <div className="blog-settings">
                                <div className="blog-settings__body">
                                    <p className="blog-settings__field-title">{t("members.leaveTitle")}</p>

                                    <p style={{ marginBottom: "10px" }}>{t("members.leaveDescription")}</p>

                                    <button type="button" className="button button--size-m button--type-negative" onClick={handleLeave}>
                                        {t("members.actions.leave")}
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="blog-settings">
                            <div className="blog-settings__body">
                                {members.length === 0 ? (
                                    <p>{t("members.none")}</p>
                                ) : (
                                    members.map((member) => (
                                        <div key={member.user_id} className="author-card" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                            <div className="author" style={{ "--1ebedaf6": "40px" }}>
                                                <Link className="author__avatar" href={`/user/${member.slug}`}>
                                                    <div className="andropov-media andropov-media--rounded andropov-media--bordered andropov-media--loaded andropov-media--has-preview andropov-image" style={{ aspectRatio: "1.77778 / 1", width: "40px", height: "40px", maxWidth: "none" }}>
                                                        <img src={member.avatar || "/default-avatar.png"} className="magnify" alt={t("members.avatarAlt", { username: member.username })} />
                                                    </div>
                                                </Link>

                                                <div className="author__main">
                                                    <Link className="author__name" href={`/user/${member.slug}`}>
                                                        <UserName user={member} />
                                                    </Link>
                                                </div>

                                                <div className="author__details">
                                                    <div className="comment__detail" style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                                                        <span>{getStatusLabel(member.status)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="blog-settings__input">
                                                <p className="blog-settings__field-title" style={{ marginBottom: "6px" }}>{t("members.roleLabel")}</p>

                                                <div className="field field--default blog-settings__input">
                                                    <label className="field__wrapper">
                                                        <input
                                                            type="text"
                                                            onChange={(e) => handleRoleInputChange(member.user_id, e.target.value, member.role)}
                                                            placeholder={t("members.placeholders.role")}
                                                            disabled={user.id !== project.user_id}
                                                            maxLength={50}
                                                            className="text-input"
                                                            name="role"
                                                            value={editedRoles[member.user_id] || member.role}
                                                        />
                                                    </label>
                                                </div>
                                            </div>

                                            {user.id === project.user_id && (
                                                <div className="blog-settings__input" style={{ display: "flex", gap: "10px" }}>
                                                    {member.status === "pending" && (
                                                        <button type="button" className="button button--size-m button--type-negative" onClick={() => handleRemove(member.user_id, member.username)}>
                                                            {t("members.actions.remove")}
                                                        </button>
                                                    )}

                                                    {editedRoles[member.user_id] && editedRoles[member.user_id] !== member.role && (
                                                        <button type="button" className="button button--size-m button--type-primary" onClick={() => debouncedHandleRoleChange(member.user_id, editedRoles[member.user_id], member.username)}>
                                                            {t("members.actions.saveRole")}
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
            </div>
        </div>
    );
}