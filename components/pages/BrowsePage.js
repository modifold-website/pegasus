
"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import axios from "axios";
import ProjectCard from "../project/ProjectCard";
import ProjectCardMedia from "../project/ProjectCardMedia";
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

const CategoryIcon = ({ category }) => {
    switch(category) {
        case "Adventure":
            return (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-compass-icon lucide-compass"><circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z"/></svg>
            );
        case "Cursed":
            return (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-skull-icon lucide-skull"><path d="m12.5 17-.5-1-.5 1h1z"/><path d="M15 22a1 1 0 0 0 1-1v-1a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20v1a1 1 0 0 0 1 1z"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="12" r="1"/></svg>
            );
        case "Decoration":
            return (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-house-icon lucide-house"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
            );
        case "Economy":
            return (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-dollar-sign-icon lucide-dollar-sign"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            );
        case "Equipment":
            return (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-swords-icon lucide-swords"><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" x2="19" y1="19" y2="13"/><line x1="16" x2="20" y1="16" y2="20"/><line x1="19" x2="21" y1="21" y2="19"/><polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5"/><line x1="5" x2="9" y1="14" y2="18"/><line x1="7" x2="4" y1="17" y2="20"/><line x1="3" x2="5" y1="19" y2="21"/></svg>
            );
        case "Food":
            return (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-carrot-icon lucide-carrot"><path d="M2.27 21.7s9.87-3.5 12.73-6.36a4.5 4.5 0 0 0-6.36-6.37C5.77 11.84 2.27 21.7 2.27 21.7zM8.64 14l-2.05-2.04M15.34 15l-2.46-2.46"/><path d="M22 9s-1.33-2-3.5-2C16.86 7 15 9 15 9s1.33 2 3.5 2S22 9 22 9z"/><path d="M15 2s-2 1.33-2 3.5S15 9 15 9s2-1.84 2-3.5C17 3.33 15 2 15 2z"/></svg>
            );
        case "Game Mechanics":
            return (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sliders-horizontal-icon lucide-sliders-horizontal"><path d="M10 5H3"/><path d="M12 19H3"/><path d="M14 3v4"/><path d="M16 17v4"/><path d="M21 12h-9"/><path d="M21 19h-5"/><path d="M21 5h-7"/><path d="M8 10v4"/><path d="M8 12H3"/></svg>
            );
        case "Library":
            return (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-book-icon lucide-book"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/></svg>
            );
        case "Magic":
            return (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-wand-sparkles-icon lucide-wand-sparkles"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72"/><path d="m14 7 3 3"/><path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 2v2"/><path d="M7 8H3"/><path d="M21 16h-4"/><path d="M11 3H9"/></svg>
            );
        case "Management":
            return (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-server-icon lucide-server"><rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/></svg>
            );
        case "Minigame":
            return (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trophy-icon lucide-trophy"><path d="M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978"/><path d="M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978"/><path d="M18 9h1.5a1 1 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z"/><path d="M6 9H4.5a1 1 0 0 1 0-5H6"/></svg>
            );
        case "Mobs":
            return (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bug-icon lucide-bug"><path d="M12 20v-9"/><path d="M14 7a4 4 0 0 1 4 4v3a6 6 0 0 1-12 0v-3a4 4 0 0 1 4-4z"/><path d="M14.12 3.88 16 2"/><path d="M21 21a4 4 0 0 0-3.81-4"/><path d="M21 5a4 4 0 0 1-3.55 3.97"/><path d="M22 13h-4"/><path d="M3 21a4 4 0 0 1 3.81-4"/><path d="M3 5a4 4 0 0 0 3.55 3.97"/><path d="M6 13H2"/><path d="m8 2 1.88 1.88"/><path d="M9 7.13V6a3 3 0 1 1 6 0v1.13"/></svg>
            );
        case "Optimization":
            return (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-zap-icon lucide-zap"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>
            );
        case "Social":
            return (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-circle-icon lucide-message-circle"><path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719"/></svg>
            );
        case "Storage":
            return (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-archive-icon lucide-archive"><rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/></svg>
            );
        case "Technology":
            return (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cpu-icon lucide-cpu"><path d="M12 20v2"/><path d="M12 2v2"/><path d="M17 20v2"/><path d="M17 2v2"/><path d="M2 12h2"/><path d="M2 17h2"/><path d="M2 7h2"/><path d="M20 12h2"/><path d="M20 17h2"/><path d="M20 7h2"/><path d="M7 20v2"/><path d="M7 2v2"/><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="8" y="8" width="8" height="8" rx="1"/></svg>
            );
        case "Transportation":
            return (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-truck-icon lucide-truck"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
            );
        case "Utility":
            return (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-wrench-icon lucide-wrench"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z"/></svg>
            );
        case "World Generation":
            return (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-earth-icon lucide-earth"><path d="M21.54 15H17a2 2 0 0 0-2 2v4.54"/><path d="M7 3.34V5a3 3 0 0 0 3 3a2 2 0 0 1 2 2c0 1.1.9 2 2 2a2 2 0 0 0 2-2c0-1.1.9-2 2-2h3.17"/><path d="M11 21.95V18a2 2 0 0 0-2-2a2 2 0 0 1-2-2v-1a2 2 0 0 0-2-2H2.05"/><circle cx="12" cy="12" r="10"/></svg>
            );
        case "Texture Packs":
            return (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image-icon lucide-image"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
            );
        default:
            return (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-minimize-icon lucide-minimize"><path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/></svg>
            );
    }
};

export default function BrowsePage({ projectType }) {
    const t = useTranslations("BrowsePage");
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const searchParamsString = useMemo(() => searchParams.toString(), [searchParams]);

    const cardViewStorageKey = `browse:cardView:${projectType}`;
    const [projects, setProjects] = useState([]);
    const [sort, setSort] = useState("downloads");
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [selectedTags, setSelectedTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isSortOpen, setIsSortOpen] = useState(false);
    const sortRef = useRef(null);
    const [cardView, setCardView] = useState("list");
    const syncingFromUrlRef = useRef(true);
    const lastQueryRef = useRef(null);
    const apiCacheRef = useRef(new Map());
    const apiRequestIdRef = useRef(0);

    const toggleCardView = () => {
        setCardView((prev) => (prev === "media" ? "list" : "media"));
    };

    useEffect(() => {
        try {
            const saved = localStorage.getItem(cardViewStorageKey);
            if(saved === "list" || saved === "media") {
                setCardView(saved);
            } else {
                setCardView("list");
            }
        } catch {}
    }, [cardViewStorageKey]);

    useEffect(() => {
        try {
            localStorage.setItem(cardViewStorageKey, cardView);
        } catch {}
    }, [cardViewStorageKey, cardView]);

    const parseSearchParams = (sp) => {
        const params = new URLSearchParams(sp);

        return {
            tags: params.getAll("c"),
            sort: params.get("sort") || "downloads",
            search: params.get("q") || "",
            page: parseInt(params.get("page")) || 1,
        };
    };

    const buildQueryString = () => {
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

        [...selectedTags].sort().forEach(tag => params.append("c", tag));

        return params.toString();
    };

    useEffect(() => {
        const query = searchParamsString;

        if(query === lastQueryRef.current) {
            syncingFromUrlRef.current = false;
            return;
        }

        syncingFromUrlRef.current = true;
        const parsed = parseSearchParams(searchParamsString);

        setSelectedTags(parsed.tags);
        setSort(parsed.sort);
        setSearch(parsed.search);
        setSearchInput(parsed.search);
        setCurrentPage(parsed.page);

        setTimeout(() => {
            syncingFromUrlRef.current = false;
        }, 0);
    }, [searchParamsString]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if(search !== searchInput) {
                setSearch(searchInput);
            }
        }, 350);

        return () => clearTimeout(timer);
    }, [searchInput, search]);

    useEffect(() => {
        if(syncingFromUrlRef.current) {
            return;
        }

        const query = buildQueryString();
        if(query === searchParamsString) {
            return;
        }

        lastQueryRef.current = query;
        router.replace(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
    }, [sort, search, selectedTags, currentPage, router, pathname, searchParamsString]);

    const apiParams = useMemo(() => {
        const sortedTags = [...selectedTags].sort();

        return {
            type: projectType,
            sort,
            search,
            tags: sortedTags.join(","),
            page: currentPage,
            limit: 20,
        };
    }, [projectType, sort, search, selectedTags, currentPage]);

    const apiKey = useMemo(() => JSON.stringify(apiParams), [apiParams]);

    useEffect(() => {
        let isActive = true;
        const requestId = ++apiRequestIdRef.current;
        const cached = apiCacheRef.current.get(apiKey);
        const now = Date.now();
        const cacheTtlMs = 30000;
        const cacheFresh = cached && now - cached.timestamp < cacheTtlMs;

        if(cached) {
            setProjects(cached.projects);
            setTotalPages(cached.totalPages);
            if(cacheFresh) {
                setLoading(false);
            }
        } else {
            setLoading(true);
        }

        const fetchProjects = async () => {
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/projects`, {
                    params: apiParams,
                });

                if(!isActive || requestId !== apiRequestIdRef.current) {
                    return;
                }

                const nextProjects = res.data.projects || [];
                const nextTotalPages = res.data.totalPages || 1;
                const nextSignature = JSON.stringify([nextProjects, nextTotalPages]);
                const prevSignature = cached ? JSON.stringify([cached.projects, cached.totalPages]) : null;

                if(nextSignature !== prevSignature) {
                    setProjects(nextProjects);
                    setTotalPages(nextTotalPages);
                }

                apiCacheRef.current.set(apiKey, {
                    projects: nextProjects,
                    totalPages: nextTotalPages,
                    timestamp: Date.now(),
                });
            } catch (err) {
                if(!cached) {
                    console.error("Error fetching projects:", err);
                }
            } finally {
                if(isActive && requestId === apiRequestIdRef.current) {
                    setLoading(false);
                }
            }
        };

        if(!cacheFresh) {
            fetchProjects();
        }

        return () => {
            isActive = false;
        };
    }, [apiKey, apiParams]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if(sortRef.current && !sortRef.current.contains(event.target)) {
                setIsSortOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleTag = (tag) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setSelectedTags([]);
        setSearch("");
        setSearchInput("");
        setSort("downloads");
        setCurrentPage(1);
        lastQueryRef.current = "";
        router.replace(pathname, { scroll: false });
    };

    const handleSortSelect = (sortOption) => {
        setSort(sortOption);
        setCurrentPage(1);
        setIsSortOpen(false);
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchInput(value);
        setCurrentPage(1);
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

    const isActive = (href) => pathname === href;

    return (
        <>
            <img src="/images/content-upper-1920 (1).jpg" className="fixed-background-teleport"></img>

            <div className="layout">
                <div className="tabs" style={{ paddingLeft: "16px", "--40010a00": "46px", "--58752bc5": "0px", "--b2a58f2e": "0" }}>
                    <Link href={`/mods`} className={`tabs__tab ${isActive(`/mods`) ? "tabs__tab--active" : ""}`}>
                        {t("mods")}
                    </Link>
                </div>

                <div className="browse-page">
                    <div className="content content--padding sidebar--browse" style={{ width: "300px", maxWidth: "300px" }}>
                        <h2 style={{ fontSize: "18px", marginBottom: "6px", fontWeight: "700" }}>{t("categories")}</h2>

                        <ul className="category-list" role="list">
                            {tagSets[projectType]?.map((tag) => (
                                <li key={tag} className="category-list__item">
                                    <button className={`category-option ${selectedTags.includes(tag) ? "category-option--active" : ""}`} onClick={() => toggleTag(tag)} aria-pressed={selectedTags.includes(tag)}>
                                        <span className="category-option__left">
                                            <span className="category-option__icon">
                                                <CategoryIcon category={tag} />
                                            </span>

                                            <span className="category-option__label">{tag}</span>
                                        </span>

                                        {selectedTags.includes(tag) && (
                                            <svg className="category-option__check" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                                        )}
                                    </button>
                                </li>
                            ))}
                        </ul>
                        
                        {selectedTags.length > 0 && (
                            <button className="button button--size-m button--type-primary" onClick={clearFilters} style={{ width: "100%", marginTop: "18px" }}>
                                {t("clearFilters")}
                            </button>
                        )}
                    </div>

                    <div className="browse-content">
                        <div className="sort-controls">
                            <div className="field field--large" style={{ width: "100%" }}>
                                <label className="field__wrapper" style={{ background: "var(--theme-color-background-content)" }}>
                                    <div className="field__wrapper-body">
                                        <svg className="icon icon--search field__icon field__icon--left" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="m21 21-4.34-4.34" />
                                            <circle cx="11" cy="11" r="8" />
                                        </svg>
                                        
                                        <input type="text" placeholder={t("placeholders.search")} value={searchInput} onChange={handleSearchChange} className="text-input" />
                                    </div>
                                </label>
                            </div>

                            <div style={{ display: "flex", gap: "12px", flexDirection: "row", alignItems: "center" }}>
                                <div className="browse-view-toggle">
                                    <button className="button button--size-m button--type-secondary" onClick={toggleCardView} aria-pressed={cardView === "media"} aria-label={cardView === "media" ? "Media view" : "List view"} title={cardView === "media" ? "Media view" : "List view"} style={{ "--button-padding": "0 7px" }} type="button">
                                        {cardView === "media" ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24"><path d="M3 14h7v7H3zM3 3h7v7H3zM14 4h7M14 9h7M14 15h7M14 20h7"></path></svg>
                                        )}
                                    </button>
                                </div>

                                <div className="sort-wrapper" ref={sortRef}>
                                    <div class="dropdown">
                                        <button class="dropdown__label" onClick={() => setIsSortOpen(!isSortOpen)} aria-expanded={isSortOpen}>
                                            {sort === "downloads" ? t("sort.downloads") : t("sort.recent")}

                                            <svg style={{ fill: 'none' }} xmlns="http://www.w3.org/2000/svg" className={`icon icon--chevron_up ${isSortOpen ? "open" : ""}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                        </button>
                                    </div>

                                    {isSortOpen && (
                                        <div className="popover popover--sort">
                                            <div className="context-list" data-scrollable="" style={{ maxHeight: "none" }}>
                                                <div className={`context-list-option ${sort === "downloads" ? "context-list-option--selected" : ""}`} onClick={() => handleSortSelect("downloads")}>
                                                    <div className="context-list-option__label">{t("sort.downloads")}</div>
                                                </div>

                                                <div className={`context-list-option ${sort === "recent" ? "context-list-option--selected" : ""}`} onClick={() => handleSortSelect("recent")}>
                                                    <div className="context-list-option__label">{t("sort.recent")}</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {loading ? (
                            <div className="subsite-empty-feed">
                                <p className="subsite-empty-feed__title">{t("loading")}</p>
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
