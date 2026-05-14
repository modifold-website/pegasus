import ProjectCard from "@/components/project/ProjectCard";
import ProjectCardMedia from "@/components/project/ProjectCardMedia";
import ModJamVoteButton from "@/components/mod-jams/ModJamVoteButton";

export default function ModJamSubmissionProjectCard({ submission, cardView, jam, authToken, canVote, onVoted, rank, showResult = false }) {
	const project = {
		...submission.project,
		project_type: "mod",
		downloads: submission.project.downloads || 0,
		updated_at: submission.project.updated_at || submission.created_at,
		tags: submission.project.tags || [],
		owner: submission.submitter,
	};
	const voteButton = canVote ? <ModJamVoteButton authToken={authToken} jamSlug={jam.slug} submissionId={submission.id} onVoted={onVoted} /> : null;
	const resultRank = Number(rank) || null;
	const className = [
		"mod-jam-submission-item",
		`mod-jam-submission-item--${cardView === "media" ? "media" : "list"}`,
		showResult ? "mod-jam-submission-item--result" : null,
		resultRank ? `mod-jam-submission-item--rank-${Math.min(resultRank, 3)}` : null,
	].filter(Boolean).join(" ");

	return (
		<div className={className}>
			{showResult && resultRank && (
				<span className="mod-jam-submission-result-rank">#{resultRank}</span>
			)}

			{cardView === "media" ? <ProjectCardMedia project={project} actions={voteButton} showFollowers={false} /> : <ProjectCard project={project} actions={voteButton} />}
		</div>
	);
}