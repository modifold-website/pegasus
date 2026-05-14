export default function ModJamEmptyState({ hasJams, t, onCreate }) {
	return (
		<div className="mod-jams-empty">
			<div className="mod-jams-empty__icon" aria-hidden="true">
				<svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
					<path d="M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978"></path>
					<path d="M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978"></path>
					<path d="M18 9h1.5a1 1 0 0 0 0-5H18"></path>
					<path d="M4 22h16"></path>
					<path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z"></path>
					<path d="M6 9H4.5a1 1 0 0 1 0-5H6"></path>
				</svg>
			</div>

			<h2>{hasJams ? t("emptyFilteredTitle") : t("emptyTitle")}</h2>
			
			<p>{hasJams ? t("emptyFilteredDescription") : t("emptyDescription")}</p>
			
			<button className="button button--size-m button--type-primary" type="button" onClick={onCreate}>
				{t("createFirst")}
			</button>
		</div>
	);
}