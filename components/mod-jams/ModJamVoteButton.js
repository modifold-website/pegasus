"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";

export default function ModJamVoteButton({ authToken, jamSlug, submissionId, onVoted, disabled = false, selected = false, visibleWhenDisabled = false, buttonType = "minimal" }) {
	const t = useTranslations("ModJamsPage");
	const router = useRouter();
	const [isVoting, setIsVoting] = useState(false);
	const [hasVoted, setHasVoted] = useState(false);
	const isDisabled = disabled || isVoting || hasVoted || selected || !authToken;
	const currentButtonType = selected ? "positive" : buttonType;

	if(!jamSlug || !submissionId || (!visibleWhenDisabled && (!authToken || hasVoted))) {
		return null;
	}

	const vote = async (event) => {
		event.preventDefault();
		event.stopPropagation();

		if(isDisabled) {
			return;
		}

		setIsVoting(true);

		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/mod-jams/${jamSlug}/votes`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${authToken}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ submission_id: submissionId }),
			});
			const data = await response.json().catch(() => ({}));

			if(!response.ok) {
				throw new Error(data?.message || t("vote.error"));
			}

			setHasVoted(true);
			onVoted?.();
			toast.success(t("vote.success"));
			router.refresh();
		} catch (error) {
			toast.error(error.message);
		} finally {
			setIsVoting(false);
		}
	};

	return (
		<button className={`button button--size-m button--type-${currentButtonType} button--active-transform button--with-icon mod-jam-vote-button`} type="button" onClick={vote} disabled={isDisabled} data-ripple="true">
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon lucide lucide-plus-icon lucide-plus">
				<path d="M5 12h14"></path>
				<path d="M12 5v14"></path>
			</svg>
			
			{isVoting || selected || hasVoted ? t("vote.voted") : t("vote.action")}
		</button>
	);
}