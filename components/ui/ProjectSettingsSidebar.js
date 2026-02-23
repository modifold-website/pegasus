"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ProjectSettingsSidebar({ project, labels, iconAlt }) {
    const pathname = usePathname();
    const isActive = (href) => pathname === href;
    const base = `/mod/${project.slug}/settings`;

    return (
        <div className="sidebar">
            <div className="sidebar__main">
                <Link href={`/mod/${project.slug}`} className="sidebar-item">
                    <img src={project.icon_url} alt={iconAlt} className="icon" width="28" height="28" style={{ borderRadius: "8px" }} />
                    
                    {project.title}
                </Link>

                <div className="sidebar-separator-view _theme_default _size_s"></div>

                <Link href={base} className={`sidebar-item ${isActive(base) ? "sidebar-item--active" : ""}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon lucide-settings-icon lucide-settings">
                        <path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" />
                        <circle cx="12" cy="12" r="3" />
                    </svg>

                    {labels.general}
                </Link>

                <Link href={`${base}/description`} className={`sidebar-item ${isActive(`${base}/description`) ? "sidebar-item--active" : ""}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon lucide-type-icon lucide-type">
                        <path d="M12 4v16" />
                        <path d="M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2" />
                        <path d="M9 20h6" />
                    </svg>

                    {labels.description}
                </Link>

                <Link href={`${base}/links`} className={`sidebar-item ${isActive(`${base}/links`) ? "sidebar-item--active" : ""}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon lucide-link-icon lucide-link">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>

                    {labels.links}
                </Link>

                <Link href={`${base}/versions`} className={`sidebar-item ${isActive(`${base}/versions`) ? "sidebar-item--active" : ""}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon lucide-arrow-down-to-line-icon lucide-arrow-down-to-line">
                        <path d="M12 17V3" />
                        <path d="m6 11 6 6 6-6" />
                        <path d="M19 21H5" />
                    </svg>

                    {labels.versions}
                </Link>

                <Link href={`${base}/gallery`} className={`sidebar-item ${isActive(`${base}/gallery`) ? "sidebar-item--active" : ""}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon lucide-image-icon lucide-image">
                        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                        <circle cx="9" cy="9" r="2" />
                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                    </svg>

                    {labels.gallery}
                </Link>

                <Link href={`${base}/tags`} className={`sidebar-item ${isActive(`${base}/tags`) ? "sidebar-item--active" : ""}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon lucide lucide-tag-icon lucide-tag">
                        <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
                        <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
                    </svg>

                    {labels.tags}
                </Link>

                <Link href={`${base}/license`} className={`sidebar-item ${isActive(`${base}/license`) ? "sidebar-item--active" : ""}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon--settings"><circle cx="12" cy="12" r="10"/><path d="M14.83 14.83a4 4 0 1 1 0-5.66"/></svg>
                    
                    {labels.license}
                </Link>

                <Link href={`${base}/moderation`} className={`sidebar-item ${isActive(`${base}/moderation`) ? "sidebar-item--active" : ""}`}>
                    <svg className="icon icon--settings" height="24" width="24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m3 6 3 1m0 0-3 9a5 5 0 0 0 6.001 0M6 7l3 9M6 7l6-2m6 2 3-1m-3 1-3 9a5 5 0 0 0 6.001 0M18 7l3 9m-3-9-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                    </svg>

                    {labels.moderation}
                </Link>
            </div>
        </div>
    );
}