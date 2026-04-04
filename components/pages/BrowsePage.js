"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import axios from "axios";
import ProjectCard from "../project/ProjectCard";
import ProjectCardMedia from "../project/ProjectCardMedia";
import ProjectCardSkeleton from "../ui/ProjectCardSkeleton";
import ProjectCardMediaSkeleton from "../ui/ProjectCardMediaSkeleton";
import BrowseFiltersSidebar from "./browse/BrowseFiltersSidebar";
import BrowseToolbar from "./browse/BrowseToolbar";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

const tagSets = {
    mod: [
        "Adventure",
        "Cursed",
        "Decoration",
        "Economy",
        "Equipment",
        "Food",
        "Game Mechanics",
        "Library",
        "Magic",
        "Management",
        "Minigame",
        "Mobs",
        "Optimization",
        "Social",
        "Storage",
        "Technology",
        "Transportation",
        "Utility",
        "World Generation",
        "Texture Packs"
    ],
};

function parseQueryString(queryString) {
    const params = new URLSearchParams(queryString || "");
    const rawSort = params.get("sort");
    const rawPage = Number.parseInt(params.get("page"), 10);

    return {
        tags: params.getAll("c"),
        sort: ["downloads", "recent"].includes(rawSort) ? rawSort : "downloads",
        search: params.get("q") || "",
        page: Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1,
    };
}

function buildQueryString({ sort, search, selectedTags, currentPage }) {
    const params = new URLSearchParams();

    if(search) {
        params.set("q", search);
    }

    if(sort && sort !== "downloads") {
        params.set("sort", sort);
    }

    if(currentPage > 1) {
        params.set("page", String(currentPage));
    }

    [...selectedTags].sort().forEach((tag) => params.append("c", tag));

    return params.toString();
}

function normalizeInitialState(initialState) {
    return {
        tags: Array.isArray(initialState?.tags) ? initialState.tags : [],
        sort: ["downloads", "recent"].includes(initialState?.sort) ? initialState.sort : "downloads",
        search: typeof initialState?.search === "string" ? initialState.search : "",
        page: Number.isFinite(initialState?.page) && initialState.page > 0 ? initialState.page : 1,
    };
}

export default function BrowsePage({ projectType, initialState = null, initialData = null, initialCardView = "list" }) {
    const t = useTranslations("BrowsePage");
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const urlQueryString = searchParams.toString();
    const normalizedInitialState = useMemo(() => normalizeInitialState(initialState), [initialState]);
    const hasInitialData = Boolean(initialData?.apiKey);

    const [projects, setProjects] = useState(() => initialData?.projects || []);
    const [sort, setSort] = useState(normalizedInitialState.sort);
    const [search, setSearch] = useState(normalizedInitialState.search);
    const [searchInput, setSearchInput] = useState(normalizedInitialState.search);
    const [selectedTags, setSelectedTags] = useState(normalizedInitialState.tags);
    const [loading, setLoading] = useState(!hasInitialData);
    const [currentPage, setCurrentPage] = useState(normalizedInitialState.page);
    const [totalPages, setTotalPages] = useState(() => initialData?.totalPages || 1);
    const [cardView, setCardView] = useState(initialCardView === "media" ? "media" : "list");
    const tabsRef = useRef(null);
    const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0, opacity: 0 });
    const apiCacheRef = useRef(hasInitialData ? new Map([
        [initialData.apiKey, {
            projects: initialData.projects || [],
            totalPages: initialData.totalPages || 1,
            fetchedAt: initialData.timestamp || Date.now(),
        }],
    ]) : new Map());

    useEffect(() => {
        try {
            document.cookie = `browse_card_view_${projectType}=${encodeURIComponent(cardView)}; path=/; max-age=31536000; samesite=lax`;
        } catch {}
    }, [projectType, cardView]);

    useEffect(() => {
        const parsed = parseQueryString(urlQueryString);

        setSelectedTags(parsed.tags);
        setSort(parsed.sort);
        setSearch(parsed.search);
        setSearchInput(parsed.search);
        setCurrentPage(parsed.page);
    }, [urlQueryString]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if(search !== searchInput) {
                setCurrentPage(1);
                setSearch(searchInput);
            }
        }, 350);

        return () => clearTimeout(timer);
    }, [searchInput, search]);

    useEffect(() => {
        const updateIndicator = () => {
            const container = tabsRef.current;
            if(!container) {
                return;
            }

            const activeTab = container.querySelector(".tabs__tab--active");
            if(!activeTab) {
                setIndicatorStyle({ width: 0, left: 0, opacity: 0 });
                return;
            }

            const containerRect = container.getBoundingClientRect();
            const tabRect = activeTab.getBoundingClientRect();
            const left = tabRect.left - containerRect.left;
            setIndicatorStyle({ width: tabRect.width, left, opacity: 1 });
        };

        const raf = requestAnimationFrame(updateIndicator);
        window.addEventListener("resize", updateIndicator);
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", updateIndicator);
        };
    }, [pathname]);

    const nextQueryString = useMemo(() => buildQueryString({
        sort,
        search,
        selectedTags,
        currentPage,
    }), [sort, search, selectedTags, currentPage]);

    useEffect(() => {
        if(nextQueryString === urlQueryString) {
            return;
        }

        router.replace(`${pathname}${nextQueryString ? `?${nextQueryString}` : ""}`, { scroll: false });
    }, [nextQueryString, urlQueryString, router, pathname]);

    const apiParams = useMemo(() => ({
        type: projectType,
        sort,
        search,
        tags: [...selectedTags].sort().join(","),
        page: currentPage,
        limit: 20,
    }), [projectType, sort, search, selectedTags, currentPage]);

    const apiKey = useMemo(() => JSON.stringify(apiParams), [apiParams]);

    useEffect(() => {
        const cached = apiCacheRef.current.get(apiKey);
        const now = Date.now();
        const cacheFresh = cached && now - cached.fetchedAt < 30000;

        if(cached) {
            setProjects(cached.projects);
            setTotalPages(cached.totalPages);
            setLoading(false);
        } else {
            setLoading(true);
        }

        if(cacheFresh) {
            return;
        }

        const controller = new AbortController();

        const fetchProjects = async () => {
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/projects`, {
                    params: apiParams,
                    signal: controller.signal,
                });

                const nextProjects = res.data.projects || [];
                const nextTotalPages = res.data.totalPages || 1;

                setProjects(nextProjects);
                setTotalPages(nextTotalPages);

                apiCacheRef.current.set(apiKey, {
                    projects: nextProjects,
                    totalPages: nextTotalPages,
                    fetchedAt: Date.now(),
                });
            } catch (err) {
                if(!controller.signal.aborted && !cached) {
                    console.error("Error fetching projects:", err);
                }
            } finally {
                if(!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        fetchProjects();

        return () => {
            controller.abort();
        };
    }, [apiKey, apiParams]);

    const toggleCardView = () => {
        setCardView((prev) => (prev === "media" ? "list" : "media"));
    };

    const toggleTag = (tag) => {
        setSelectedTags((prev) => prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]);
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setSelectedTags([]);
        setSearch("");
        setSearchInput("");
        setSort("downloads");
        setCurrentPage(1);
    };

    const clearSelectedTags = () => {
        setSelectedTags([]);
        setCurrentPage(1);
    };

    const handleSortSelect = (sortOption) => {
        setSort(sortOption);
        setCurrentPage(1);
    };

    const handleSearchChange = (event) => {
        setSearchInput(event.target.value);
    };

    const getPageButtons = () => {
        const maxButtons = 10;
        let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxButtons - 1);

        if(endPage - startPage + 1 < maxButtons) {
            startPage = Math.max(1, endPage - maxButtons + 1);
        }

        const buttons = [];
        for(let i = startPage; i <= endPage; i++) {
            buttons.push(
                <button key={i} className={`button button--size-m pagination-button ${currentPage === i ? "button--type-primary" : "button--type-secondary"}`} onClick={() => setCurrentPage(i)} aria-current={currentPage === i ? "page" : undefined}>
                    {i}
                </button>
            );
        }

        return buttons;
    };

    return (
        <>
            <img src="/images/content-upper-1920 (1).jpg" className="fixed-background-teleport"></img>

            <div className="layout">
                <div className="tabs" ref={tabsRef} style={{ paddingLeft: "16px", "--40010a00": "46px", "--58752bc5": "0px", "--b2a58f2e": "0" }}>
                    <Link href="/mods" className={`tabs__tab ${pathname === "/mods" ? "tabs__tab--active" : ""}`}>
                        {t("mods")}
                    </Link>

                    <Link href="/modpacks" className={`tabs__tab ${pathname === "/modpacks" ? "tabs__tab--active" : ""}`}>
                        {t("modpacks")}
                    </Link>

                    <span className="tabs__indicator" aria-hidden="true" style={{ width: `${indicatorStyle.width}px`, transform: `translateX(${indicatorStyle.left}px)`, opacity: indicatorStyle.opacity }} />
                </div>

                <div className="browse-page">
                    <BrowseFiltersSidebar t={t} tags={tagSets[projectType] || []} selectedTags={selectedTags} onToggleTag={toggleTag} onClearFilters={clearFilters} />

                    <div className="browse-content">
                        <BrowseToolbar t={t} searchInput={searchInput} onSearchChange={handleSearchChange} cardView={cardView} onToggleCardView={toggleCardView} sort={sort} onSortSelect={handleSortSelect} />

                        {selectedTags.length > 0 && (
                            <div className="browse-selected-filters">
                                {selectedTags.length > 1 && (
                                    <button className="browse-selected-filter-chip" type="button" onClick={clearSelectedTags}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-x-icon lucide-circle-x">
                                            <circle cx="12" cy="12" r="10"/>
                                            <path d="m15 9-6 6"/>
                                            <path d="m9 9 6 6"/>
                                        </svg>

                                        {t("clearAllFilters")}
                                    </button>
                                )}

                                {selectedTags.map((tag) => (
                                    <button key={tag} className="browse-selected-filter-chip" type="button" onClick={() => toggleTag(tag)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x-icon lucide-x">
                                            <path d="M18 6 6 18"/>
                                            <path d="m6 6 12 12"/>
                                        </svg>

                                        {tag}
                                    </button>
                                ))}
                            </div>
                        )}

                        {loading ? (
                            <div className={cardView === "media" ? "browse-project-grid" : "browse-project-list"} aria-label={t("loading")} aria-busy="true">
                                {Array.from({ length: 10 }).map((_, index) => (
                                    cardView === "media" ? <ProjectCardMediaSkeleton key={index} /> : <ProjectCardSkeleton key={index} />
                                ))}
                            </div>
                        ) : projects.length > 0 ? (
                            <div className={cardView === "media" ? "browse-project-grid" : "browse-project-list"}>
                                {projects.map((project) => (
                                    cardView === "media" ? <ProjectCardMedia key={project.id} project={project} /> : <ProjectCard key={project.id} project={project} />
                                ))}
                            </div>
                        ) : (
                            <div className="subsite-empty-feed">
                                <img src="/images/kweebec.png" style={{ width: "200px" }} />
                                <p className="subsite-empty-feed__title">{t("noProjects")}</p>
                            </div>
                        )}

                        {totalPages > 1 && (
                            <div className="pagination-controls">
                                <button className="button button--size-m button--type-secondary" onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))} disabled={currentPage === 1} aria-disabled={currentPage === 1}>
                                    {t("previous")}
                                </button>

                                {getPageButtons()}

                                <button className="button button--size-m button--type-secondary" onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} aria-disabled={currentPage === totalPages}>
                                    {t("next")}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}