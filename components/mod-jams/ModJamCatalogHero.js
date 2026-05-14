export default function ModJamCatalogHero({ t, onCreate }) {
	return (
		<section className="mod-jams-catalog-hero">
			<div className="mod-jams-catalog-hero__copy">
				<span className="mod-jams-catalog-hero__eyebrow">{t("eyebrow")}</span>
				
				<h1>{t("title")}</h1>
				
				<p>{t("description")}</p>
				
				<div className="mod-jams-catalog-hero__actions">
					<button className="button button--size-m button--type-secondary button--active-transform" type="button" onClick={onCreate}>{t("create")}</button>
				</div>
			</div>

			<img src="/images/modjam-golem.webp" className="mod-jams-catalog-hero__golem" />

			<img src="/images/modjam-background.svg" className="mod-jams-background" />
		</section>
	);
}