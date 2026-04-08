"use client";

import CategoryIcon from "@/utils/CategoryIcon";

const normalizeTags = (tags) => tags.map((tag) => (typeof tag === "string" ? { name: tag } : tag)).filter((tag) => tag && typeof tag.name === "string");

export default function BrowseFiltersSidebar({ t, tags = [], selectedTags = [], onToggleTag, onClearFilters, getCategoryLabel = (label) => label }) {
    const normalizedTags = normalizeTags(tags);

    return (
        <div className="content content--padding sidebar--browse">
            <h2 style={{ fontSize: "18px", marginBottom: "6px", fontWeight: "700" }}>{t("categories")}</h2>

            <ul className="category-list" role="list">
                {normalizedTags.map((tag) => (
                    <li key={tag.name} className="category-list__item">
                        <button className={`category-option ${selectedTags.includes(tag.name) ? "category-option--active" : ""}`} onClick={() => onToggleTag(tag.name)} aria-pressed={selectedTags.includes(tag.name)}>
                            <span className="category-option__left">
                                <span className="category-option__icon">
                                    {tag.icon ? (
                                        <span aria-hidden="true" dangerouslySetInnerHTML={{ __html: tag.icon }} />
                                    ) : (
                                        <CategoryIcon category={tag.name} />
                                    )}
                                </span>

                                <span className="category-option__label">{getCategoryLabel(tag.name)}</span>
                            </span>

                            {selectedTags.includes(tag.name) && (
                                <svg className="category-option__check" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 6 9 17l-5-5"/>
                                </svg>
                            )}
                        </button>
                    </li>
                ))}
            </ul>

            {selectedTags.length > 0 && (
                <button className="button button--size-m button--type-primary" onClick={onClearFilters} style={{ width: "100%", marginTop: "18px" }}>
                    {t("clearFilters")}
                </button>
            )}
        </div>
    );
}