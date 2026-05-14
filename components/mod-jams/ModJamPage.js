"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import ModJamExternalLinks from "@/components/mod-jams/ModJamExternalLinks";
import ModJamMasthead from "@/components/mod-jams/ModJamMasthead";
import ModJamMarkdownBlock from "@/components/mod-jams/ModJamMarkdownBlock";
import ModJamSubmissionProjectCard from "@/components/mod-jams/ModJamSubmissionProjectCard";
import ModJamTimeline from "@/components/mod-jams/ModJamTimeline";

function getColorHex(value) {
	if(value === null || value === undefined || value === "") {
		return null;
	}

	const color = Number(value);
	return Number.isFinite(color) ? `#${Math.max(0, Math.min(0xFFFFFF, Math.round(color))).toString(16).padStart(6, "0").toUpperCase()}` : null;
}

export default function ModJamPage({ jam, submissions = [], authToken, permissions = {} }) {
	const t = useTranslations("ModJamsPage");
	const jamColorHex = getColorHex(jam.color);
	const hasKnownResults = jam.lifecycle === "completed";
	const [hasUserVoteInJam, setHasUserVoteInJam] = useState(() => submissions.some((submission) => submission.has_user_vote_in_jam));

	useEffect(() => {
		setHasUserVoteInJam(submissions.some((submission) => submission.has_user_vote_in_jam));
	}, [submissions]);

	const submissionResultRanks = useMemo(() => {
		if(!hasKnownResults) {
			return new Map();
		}

		return new Map([...submissions].sort((first, second) => {
			const votesDelta = (Number(second.votes_count) || 0) - (Number(first.votes_count) || 0);

			if(votesDelta !== 0) {
				return votesDelta;
			}

			return new Date(first.created_at).getTime() - new Date(second.created_at).getTime();
		}).map((submission, index) => [submission.id, index + 1]));
	}, [hasKnownResults, submissions]);

	const sortedSubmissions = useMemo(() => {
		const nextSubmissions = [...submissions];

		nextSubmissions.sort((first, second) => {
			if(hasKnownResults) {
				return (submissionResultRanks.get(first.id) || 0) - (submissionResultRanks.get(second.id) || 0);
			}

			const firstProject = {
				...first.project,
				project_type: "mod",
				downloads: first.project.downloads || 0,
				updated_at: first.project.updated_at || first.created_at,
				tags: first.project.tags || [],
				owner: first.submitter,
			};

			const secondProject = {
				...second.project,
				project_type: "mod",
				downloads: second.project.downloads || 0,
				updated_at: second.project.updated_at || second.created_at,
				tags: second.project.tags || [],
				owner: second.submitter,
			};

			return (Number(secondProject.downloads) || 0) - (Number(firstProject.downloads) || 0);
		});

		return nextSubmissions;
	}, [hasKnownResults, submissionResultRanks, submissions]);

	const handleVoted = () => {
		setHasUserVoteInJam(true);
	};

	return (
		<>
			{jamColorHex && (
				<div className="fixed-background-teleport-color" style={{ "--_color": jamColorHex }} />
			)}

			<div className="layout">
				<div className="page-content mod-jam-detail-page">
					<ModJamMasthead jam={jam} permissions={permissions} submissionsCount={submissions.length} authToken={authToken} submissions={submissions} />

					<div className="project__general">
						<div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
							<div className="content content--padding">
								<h2>{t("detail.description")}</h2>

								<ModJamMarkdownBlock>{jam.description}</ModJamMarkdownBlock>
							</div>
							
							<ModJamTimeline jam={jam} />

							<section className="mod-jam-submissions-section">
								{submissions.length > 0 ? (
									<div className="browse-project-grid mod-jam-submissions-list">
										{sortedSubmissions.map((submission) => (
											<ModJamSubmissionProjectCard
												key={submission.id}
												submission={submission}
												cardView="media"
												jam={jam}
												authToken={authToken}
												canVote={Boolean(permissions.can_vote && !hasUserVoteInJam)}
												onVoted={handleVoted}
												rank={submissionResultRanks.get(submission.id)}
												showResult={hasKnownResults}
											/>
										))}
									</div>
								) : (
									<p>{t("detail.emptySubmissions")}</p>
								)}
							</section>
						</div>

						<aside className="mod-jam-sidebar">
							<div className="content content--padding">
								<h2>{t("detail.rules")}</h2>

								<ModJamMarkdownBlock>{jam.rules}</ModJamMarkdownBlock>
							</div>

							<ModJamExternalLinks links={jam.external_links} t={t} />
						</aside>
					</div>
				</div>
			</div>
		</>
	);
}