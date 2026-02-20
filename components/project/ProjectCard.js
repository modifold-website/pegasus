import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import UserName from "../ui/UserName";
import ProjectTags from "../ui/ProjectTags";
const DEFAULT_PROJECT_ICON_URL = "https://media.modifold.com/static/no-project-icon.svg";

export default function ProjectCard({ project }) {
    const t = useTranslations("ProjectCard");
    const locale = useLocale();
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = date - now;
        const seconds = Math.round(diffMs / 1000);
        const minutes = Math.round(seconds / 60);
        const hours = Math.round(minutes / 60);
        const days = Math.round(hours / 24);
        const months = Math.round(days / 30);
        const years = Math.round(days / 365);

        if(Math.abs(seconds) < 60) {
            return rtf.format(seconds, "second");
        }

        if(Math.abs(minutes) < 60) {
            return rtf.format(minutes, "minute");
        }

        if(Math.abs(hours) < 24) {
            return rtf.format(hours, "hour");
        }

        if(Math.abs(days) < 30) {
            return rtf.format(days, "day");
        }

        if(Math.abs(months) < 12) {
            return rtf.format(months, "month");
        }

        return rtf.format(years, "year");
    };

    const formatNumber = (num) => {
        if(num >= 1000000) {
            return `${(num / 1000000).toFixed(2)}M`;
        }

        if(num >= 1000) {
            return `${(num / 1000).toFixed(2)}K`;
        }

        return num;
    };

    return (
        <Link className="new-project-card" href={`/mod/${project.slug}`} id={project.slug}>
            <img className="new-project-icon" alt={t("projectIconAlt", { title: project.title })} src={project.icon_url || DEFAULT_PROJECT_ICON_URL} />

            <div className="new-project-info">
                <div className="new-project-header">
                    <span className="new-project-title">{project.title}</span>
                    <span className="new-project-author">
                        {t("by")} <Link href={`/user/${project.owner.slug}`}><UserName user={project.owner} /></Link>
                    </span>
                </div>

                <p className="new-project-description">{project.summary}</p>

                {project.tags?.length > 0 && (
                    <div className="new-project-tags">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-tags-icon lucide-tags"><path d="M13.172 2a2 2 0 0 1 1.414.586l6.71 6.71a2.4 2.4 0 0 1 0 3.408l-4.592 4.592a2.4 2.4 0 0 1-3.408 0l-6.71-6.71A2 2 0 0 1 6 9.172V3a1 1 0 0 1 1-1z"/><path d="M2 7v6.172a2 2 0 0 0 .586 1.414l6.71 6.71a2.4 2.4 0 0 0 3.191.193"/><circle cx="10.5" cy="6.5" r=".5" fill="currentColor"/></svg>

                        <ProjectTags tags={project.tags} />
                    </div>
                )}
            </div>

            <div className="new-project-stats">
                <div className="new-stat">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-download-icon lucide-download"><path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/></svg>

                    {formatNumber(project.downloads)} <span className="new-label">{t("downloads")}</span>
                </div>

                <div className="new-stat">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-heart-icon lucide-heart"><path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"/></svg>

                    {formatNumber(project.followers || 0)} <span className="new-label">{t("followers")}</span>
                </div>

                <div className="new-stat new-updated">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" class="lucide lucide-heart-icon lucide-update"><path d="M3 3v5h5"></path><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"></path><path d="M12 7v5l4 2"></path></svg>

                    <div><span>{t("updated")}</span> {formatDate(project.updated_at)}</div>
                </div>
            </div>
        </Link>
    );
}