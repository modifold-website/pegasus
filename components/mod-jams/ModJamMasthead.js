"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "next-intl";
import UserName from "@/components/ui/UserName";
import ModJamSubmitProjectModal from "@/modal/ModJamSubmitProjectModal";

export default function ModJamMasthead({ jam, permissions = {}, submissionsCount = 0, authToken, submissions = [] }) {
	const t = useTranslations("ModJamsPage");
	const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
	const owner = jam.owner;
	const ownerHref = owner?.profile_url || (owner?.slug ? `/user/${owner.slug}` : null);
	const hasCover = Boolean(jam.cover_url);
	const canSubmitProject = jam.lifecycle === "submissions_open";

	return (
		<>
			{hasCover && (
				<img src={jam.cover_url} className="mod-jam-masthead_cover" alt="" loading="lazy" />
			)}
			
			<section className="masthead" style={hasCover ? { borderTopRightRadius: 0, borderTopLeftRadius: 0 } : undefined}>
				<div className="masthead-info">
					<div className="masthead-avatar">
						<div className="avatar avatar-s-masthead">
							<Image src={jam.avatar_url || "https://media.modifold.com/static/no-project-icon.svg"} className="avatar-image" alt={jam.title} width={100} height={100} priority />
						</div>
					</div>

					<div className="masthead-wrapper">
						<div className="masthead-name">
							<span>{jam.title}</span>
						</div>

						<div className="masthead-desc">{jam.summary}</div>

						<div className="masthead-short">
							<div className="masthead-stats">
								<div className="masthead-stats__item">
									<svg className="masthead-stats__icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
										<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
										<path d="m3.3 7 8.7 5 8.7-5"></path>
										<path d="M12 22V12"></path>
									</svg>

									<div className="masthead-stats__quantity">{submissionsCount}</div>
								</div>

								{owner && ownerHref && (
									<div className="masthead-stats__item">
										<svg className="masthead-stats__icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
											<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
											<path d="M16 3.128a4 4 0 0 1 0 7.744"></path>
											<path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
											<circle cx="9" cy="7" r="4"></circle>
										</svg>

										<Link className="mod-jam-masthead-owner__link" href={ownerHref} aria-label={t("detail.creatorProfile", { username: owner.username })}>
											<UserName user={owner} className="mod-jam-masthead-owner__name" />
										</Link>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>

				<div className="masthead-buttons">
					{canSubmitProject && (
						<button className="button button--size-l button--with-icon button--active-transform button--type-minimal" type="button" onClick={() => setIsSubmitModalOpen(true)}>
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon lucide lucide-plus-icon lucide-plus">
								<path d="M5 12h14"></path>
								<path d="M12 5v14"></path>
							</svg>

							{t("submit.title")}
						</button>
					)}

					{permissions.can_edit && (
						<Link className="button button--size-l button--with-icon button--active-transform button--type-primary" href={`/jams/${jam.slug}/settings`}>
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon lucide lucide-settings-icon lucide-settings">
								<path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"></path>
								<circle cx="12" cy="12" r="3"></circle>
							</svg>

							{t("detail.editSettings")}
						</Link>
					)}
				</div>
			</section>

			<ModJamSubmitProjectModal isOpen={isSubmitModalOpen} jam={jam} authToken={authToken} submissions={submissions} onRequestClose={() => setIsSubmitModalOpen(false)} />
		</>
	);
}