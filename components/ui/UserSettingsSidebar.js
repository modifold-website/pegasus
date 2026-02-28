"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import UserName from "./UserName";

const DEFAULT_AVATAR_URL = "https://media.modifold.com/static/no-project-icon.svg";

export default function UserSettingsSidebar({ user, labels, profileIconAlt }) {
    const pathname = usePathname();
    const isActive = (href) => pathname === href;

    return (
        <div className="sidebar">
            <div className="sidebar__main">
                <Link href={`/user/${user?.slug || ""}`} className="sidebar-item" data-ripple>
                    <img src={user?.avatar || DEFAULT_AVATAR_URL} alt={profileIconAlt} className="icon" width="28" height="28" style={{ borderRadius: "8px" }} />

                    <UserName user={user} />
                </Link>

                <div className="sidebar-separator-view _theme_default _size_s"></div>

                <Link href="/dashboard" className={`sidebar-item ${isActive("/dashboard") ? "sidebar-item--active" : ""}`} data-ripple>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon lucide lucide-box-icon lucide-box">
                        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                        <path d="m3.3 7 8.7 5 8.7-5" />
                        <path d="M12 22V12" />
                    </svg>

                    {labels.projects}
                </Link>

                <Link href="/dashboard/organizations" className={`sidebar-item ${isActive("/dashboard/organizations") ? "sidebar-item--active" : ""}`} data-ripple>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon lucide lucide-users-round-icon lucide-users-round">
                        <path d="M18 21a8 8 0 0 0-16 0"/>
                        <circle cx="10" cy="8" r="5"/>
                        <path d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3"/>
                    </svg>

                    {labels.organizations}
                </Link>

                <Link href="/notifications" className={`sidebar-item ${isActive("/notifications") ? "sidebar-item--active" : ""}`} data-ripple>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon lucide lucide-bell-icon lucide-bell">
                        <path d="M10.268 21a2 2 0 0 0 3.464 0" />
                        <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
                    </svg>

                    {labels.notifications}
                </Link>

                <Link href="/settings" className={`sidebar-item ${isActive("/settings") ? "sidebar-item--active" : ""}`} data-ripple>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon lucide lucide-settings-icon lucide-settings">
                        <path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" />
                        <circle cx="12" cy="12" r="3" />
                    </svg>

                    {labels.settings}
                </Link>

                <Link href="/settings/api" className={`sidebar-item ${isActive("/settings/api") ? "sidebar-item--active" : ""}`} data-ripple>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon lucide lucide-braces-icon lucide-braces">
                        <path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1"/>
                        <path d="M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1"/>
                    </svg>

                    {labels.apiTokens}
                </Link>

                <Link href="/settings/verification" className={`sidebar-item ${isActive("/settings/verification") ? "sidebar-item--active" : ""}`} data-ripple>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon lucide lucide-badge-check-icon lucide-badge-check">
                        <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/>
                        <path d="m9 12 2 2 4-4"/>
                    </svg>

                    {labels.verification}
                </Link>
            </div>
        </div>
    );
}
