"use client";

import CategoryIcon from "@/utils/CategoryIcon";

export default function BrowseFiltersSidebar({ t, tags = [], selectedTags = [], onToggleTag, onClearFilters }) {
    return (
        <div className="content content--padding sidebar--browse">
            <h2 style={{ fontSize: "18px", marginBottom: "6px", fontWeight: "700" }}>{t("categories")}</h2>

            <ul className="category-list" role="list">
                {tags.map((tag) => (
                    <li key={tag} className="category-list__item">
                        <button className={`category-option ${selectedTags.includes(tag) ? "category-option--active" : ""}`} onClick={() => onToggleTag(tag)} aria-pressed={selectedTags.includes(tag)}>
                            <span className="category-option__left">
                                <span className="category-option__icon">
                                    <CategoryIcon category={tag} />
                                </span>

                                <span className="category-option__label">{tag}</span>
                            </span>

                            {selectedTags.includes(tag) && (
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