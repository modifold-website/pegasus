import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import UserName from "../ui/UserName";
import ProjectTags from "../ui/ProjectTags";
const DEFAULT_PROJECT_ICON_URL = "https://media.modifold.com/static/no-project-icon.svg";

export default function ProjectCardMedia({ project }) {
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

    const featuredImage = project?.gallery?.find((image) => image?.featured === 1) || project?.gallery?.[0] || null;
    const coverUrl = featuredImage?.url || null;

    return (
        <Link className="media-project-card" href={`/mod/${project.slug}`} id={project.slug}>
            <div className="media-project-cover">
                {coverUrl && (
                    <img src={coverUrl} alt="" loading="lazy" />
                )}
            </div>

            <div className="media-project-body">
                <div className="media-project-header">
                    <img className="media-project-icon" alt={t("projectIconAlt", { title: project.title })} src={project.icon_url || DEFAULT_PROJECT_ICON_URL} />

                    <div className="media-project-header-text">
                        <div className="media-project-title-row">
                            <span className="media-project-title">{project.title}</span>
                            <span className="media-project-author">
                                {t("by")} <Link href={`/user/${project.owner.slug}`}><UserName user={project.owner} /></Link>
                            </span>
                        </div>

                        <p className="media-project-description">{project.summary}</p>
                    </div>
                </div>

                {project?.tags?.length > 0 && (
                    <div className="media-project-tags">
                        <ProjectTags tags={project.tags} />
                    </div>
                )}

                <div className="media-project-stats">
                    <div className="media-project-stat" title={t("downloads")}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-download-icon lucide-download"><path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/></svg>
                        <span>{formatNumber(project.downloads)}</span>
                    </div>

                    <div className="media-project-stat" title={t("followers")}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-heart-icon lucide-heart"><path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"/></svg>
                        <span>{formatNumber(project.followers || 0)}</span>
                    </div>

                    <div className="media-project-stat media-project-updated" title={t("updated")}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" class="lucide lucide-heart-icon lucide-update"><path d="M3 3v5h5"></path><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"></path><path d="M12 7v5l4 2"></path></svg>
                        <span>{formatDate(project.updated_at)}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}