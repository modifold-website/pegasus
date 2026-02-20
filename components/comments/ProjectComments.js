import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { useAuth } from "../providers/AuthProvider";
import { toast } from "react-toastify";
import UserName from "../ui/UserName";

export default function ProjectComments({ project, authToken }) {
    const t = useTranslations("ProjectPage");
    const locale = useLocale();
    const { isLoggedIn, user } = useAuth();
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isPosting, setIsPosting] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [replyTo, setReplyTo] = useState(null);
    const [replyText, setReplyText] = useState("");
    const [canModerate, setCanModerate] = useState(false);
    const [menuOpenId, setMenuOpenId] = useState(null);

    const formatDate = (timestamp) => {
        if(!timestamp) {
            return "";
        }

        const date = new Date(Number(timestamp));
        return date.toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" });
    };

    const fetchComments = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/projects/${project.slug}/comments`, {
                headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
            });

            if(!res.ok) {
                throw new Error("Failed");
            }

            const data = await res.json();
            setComments(data.comments || []);
            setCanModerate(!!data.canModerate);
        } catch (error) {
            toast.error(t("comments.errors.load"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [project.slug]);

    useEffect(() => {
        if(menuOpenId === null) {
            return;
        }

        const handleClick = (event) => {
            if(event.target.closest(".comment-menu") || event.target.closest(".comment-menu__button")) {
                return;
            }

            setMenuOpenId(null);
        };

        document.addEventListener("click", handleClick);
        return () => document.removeEventListener("click", handleClick);
    }, [menuOpenId]);

    const commentTree = useMemo(() => {
        const map = new Map();
        const roots = [];

        comments.forEach((comment) => {
            map.set(comment.id, { ...comment, children: [] });
        });

        comments.forEach((comment) => {
            const node = map.get(comment.id);
            if(comment.parent_id && map.has(comment.parent_id)) {
                map.get(comment.parent_id).children.push(node);
            } else {
                roots.push(node);
            }
        });

        return roots;
    }, [comments]);

    const submitComment = async (content, parentId) => {
        if(!isLoggedIn || !authToken) {
            toast.error(t("comments.loginHint"));
            return;
        }

        if(!content.trim()) {
            return;
        }

        try {
            setIsPosting(true);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/projects/${project.slug}/comments`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ content, parent_id: parentId || null }),
            });

            if(res.status === 429) {
                toast.error(t("comments.rateLimited"));
                return;
            }

            if(!res.ok) {
                throw new Error("Failed");
            }

            setCommentText("");
            setReplyText("");
            setReplyTo(null);
            await fetchComments();
        } catch (error) {
            toast.error(t("comments.errors.submit"));
        } finally {
            setIsPosting(false);
        }
    };

    const moderateComment = async (commentId, action) => {
        if(!authToken) {
            return;
        }

        try {
            setMenuOpenId(null);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/projects/${project.slug}/comments/${commentId}`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ action }),
            });

            if(!res.ok) {
                throw new Error("Failed");
            }

            await fetchComments();
        } catch (error) {
            toast.error(t("comments.errors.moderate"));
        }
    };

    const renderComment = (comment, depth = 0) => {
        const isDeleted = comment.status === "deleted" && !comment.content;
        const isHidden = comment.status !== "visible";
        const isOwn = user?.id === comment.author?.id;
        const showAuthorBadge = comment.isAuthor;
        const canDelete = isOwn || canModerate;
        const canShowMenu = canDelete || canModerate;
        const branchDepth = Math.min(depth, 10);
        const indent = branchDepth * 20;

        return (
            <div key={comment.id} className={`comment-item`}>
                <div class="comment" style={{ "--branches-count": branchDepth }}>
                    <div class="comment__branches">
                        <div class="comment-branches"></div>
                    </div>

                    <div class="comment__content">
                        <div class="author" style={{ "--1ebedaf6": "36px" }}>
                            <Link class="author__avatar" href={`/user/${comment.author?.slug || ""}`}>
                                <div class="andropov-media andropov-media--rounded andropov-media--bordered andropov-media--loaded andropov-media--has-preview andropov-image" style={{ aspectRatio: "1.77778 / 1", width: "36px", height: "36px", maxWidth: "none", "--background-color": "#33302c" }}>
                                    <picture>
                                        <img src={comment.author?.avatar || "https://cdn.modifold.com/default_avatar.png"} alt={comment.author?.username || ""} />
                                    </picture>
                                </div>
                            </Link>

                            <Link class="author__main" href={`/user/${comment.author?.slug || ""}`} style={{ fontWeight: "500" }}>
                                <UserName user={comment.author} />
                            </Link>

                            <div class="author__details">
                                <span class="comment__detail">
                                    <time>{formatDate(comment.created_at)}</time>
                                </span>

                                {showAuthorBadge && (
                                    <span className="comment__detail--accent">{t("comments.authorLabel")}</span>
                                )}

                                {isHidden && canModerate && (
                                    <span className="comment-status-badge">{t(`comments.status.${comment.status}`)}</span>
                                )}
                            </div>
                        </div>

                        <div class="comment__break comment__break--author"></div>

                        {isDeleted ? (
                            <div class="comment__text">
                                <p>{t("comments.deleted")}</p>
                            </div>
                        ) : (
                            <div class="comment__text">
                                <p>{comment.content}</p>
                            </div>
                        )}

                        <div class="comment__actions">
                            {isLoggedIn && !isDeleted && (
                                <button type="button" class="comment__action comment__action--reply" onClick={() => setReplyTo(comment.id)}>
                                    {t("comments.reply")}
                                </button>
                            )}

                            {canShowMenu && !isDeleted && (
                                <div class="comment-menu" style={{ height: "26px" }}>
                                    <button type="button" class="icon-button" aria-label="More actions" onClick={() => setMenuOpenId(menuOpenId === comment.id ? null : comment.id)}>
                                        <svg viewBox="0 0 24 24" class="icon icon--dots" height="20" width="20"><path fill-rule="evenodd" clip-rule="evenodd" d="M5 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM19 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" fill="currentColor"></path></svg>
                                    </button>

                                    {menuOpenId === comment.id && (
                                        <div id="popover-overlay" class="popover-overlay">
                                            <div class="popover" tabindex="0" style={{ "--width": "210px", "--top": "40px", "--position": "absolute", "--left": "auto", "--right": "0", "--bottom": "auto", "--distance": "8px" }}>
                                                <div class="popover__scrollable" style={{ "--max-height": "auto" }}>
                                                    {canDelete && (
                                                        <div class="context-list-option context-list-option--with-art" onClick={() => moderateComment(comment.id, "delete")}>
                                                            <div class="context-list-option__art context-list-option__art--icon">
                                                                <svg style={{ fill: "none" }} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon lucide lucide-trash2-icon lucide-trash-2"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                                            </div>
                                                            
                                                            <div class="context-list-option__label">{t("comments.delete")}</div>
                                                        </div>
                                                    )}

                                                    {canModerate && (
                                                        <>
                                                            {comment.status === "visible" ? (
                                                                <div class="context-list-option context-list-option--with-art" onClick={() => moderateComment(comment.id, "hide")}>
                                                                    <div class="context-list-option__art context-list-option__art--icon">
                                                                        <svg style={{ fill: "none" }} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon lucide lucide-eye-off-icon lucide-eye-off"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/></svg>
                                                                    </div>

                                                                    <div class="context-list-option__label">{t("comments.hide")}</div>
                                                                </div>
                                                            ) : (
                                                                <div class="context-list-option context-list-option--with-art" onClick={() => moderateComment(comment.id, "show")}>
                                                                    <div class="context-list-option__art context-list-option__art--icon">
                                                                        <svg style={{ fill: "none" }}xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon lucide lucide-eye-icon lucide-eye"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>
                                                                    </div>

                                                                    <div class="context-list-option__label">{t("comments.show")}</div>
                                                                </div>
                                                            )}
                                                        </>
                                                    )}

                                                    <div class="context-list-option context-list-option--with-art">
                                                        <div class="context-list-option__art context-list-option__art--icon">
                                                            <svg style={{ fill: "none" }} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon lucide lucide-languages-icon lucide-languages"><path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/></svg>
                                                        </div>

                                                        <div class="context-list-option__label">Test</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {replyTo === comment.id && (
                    <div class="comment comment--writing comment--writing-main comment--writing-reply" style={{ "--branches-count": branchDepth, "--comment-display-level": "1" }}>
                        <div class="comment__branches">
                            <div class="comment-branches"></div>
                        </div>

                        <div class="comment__content">
                            <div class="comments-form">
                                <textarea name="comment" class="autosize comments-form__field" value={replyText} onChange={(event) => setReplyText(event.target.value)} placeholder={t("comments.placeholder")} style={{ height: "54px" }} rows="1"></textarea>

                                <div class="comments-form__footer">
                                    <div class="comments-form__buttons">
                                        <button class="button button--size-m button--type-secondary" type="button" onClick={() => { setReplyTo(null); setReplyText(""); }}>{t("comments.cancel")}</button>
                                        
                                        <button class="button button--size-m button--type-primary" type="button" disabled={isPosting} onClick={() => submitComment(replyText, comment.id)}>{t("comments.submit")}</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {comment.children.length > 0 && (
                    comment.children.map((child) => renderComment(child, depth + 1))
                )}
            </div>
        );
    };

    return (
        <div className="project-comments">
            <div class="comments">
                <div class="comments__header">
                    <div class="comments__title">{t("comments.title")}</div>
                </div>

                {isLoggedIn && (
                    <div class="comment comment--writing comment--writing-main" style={{ "--branches-count": "0" }}>
                        <div class="comment-branches"></div>
                        
                        <div class="comment__content">
                            <div class="comments-form">
                                <textarea name="comment" value={commentText} onChange={(event) => setCommentText(event.target.value)} class="autosize comments-form__field" placeholder={t("comments.placeholder")} style={{ height: "54px" }} rows="1"></textarea>
                                
                                <div class="comments-form__buttons">
                                    <button type="submit" disabled={isPosting} onClick={() => submitComment(commentText)} class="button button--size-m button--type-primary">
                                        {t("comments.submit")}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="comment-list">
                        <p className="comment-item__placeholder">{t("comments.loading")}</p>
                    </div>
                ) : (
                    <>
                        {commentTree.length === 0 ? (
                            <div className="comment-list">
                                <p className="comment-item__placeholder">
                                    {isLoggedIn ? t("comments.emptyLoggedIn") : t("comments.emptyGuest")}
                                </p>
                            </div>
                        ) : (
                            <div className="comment-list">
                                {commentTree.map((comment) => renderComment(comment))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}