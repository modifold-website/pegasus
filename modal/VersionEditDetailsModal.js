"use client";

import { useEffect, useRef, useState } from "react";
import Modal from "react-modal";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { getSafeMarkdownHref, getSafeMarkdownImageSrc } from "@/utils/projectDescriptionContent";

if(typeof window !== "undefined") {
    Modal.setAppElement("body");
}

export default function VersionEditDetailsModal({ isOpen, onRequestClose, editLoading, onSubmit, t, tProject, editFormData, handleEditInputChange, handleSelectEditReleaseChannel, releaseChannels }) {
    const [isPreviewVisible, setIsPreviewVisible] = useState(false);
    const textareaRef = useRef(null);
    const changelog = editFormData.changelog || "";

    useEffect(() => {
        if(!isOpen) {
            setIsPreviewVisible(false);
        }
    }, [isOpen]);

    const setChangelog = (nextValue) => {
        handleEditInputChange({
            target: {
                name: "changelog",
                value: nextValue,
            },
        });
    };

    const withSelection = (transform) => {
        const textarea = textareaRef.current;
        if(!textarea) {
            return;
        }

        const start = textarea.selectionStart ?? 0;
        const end = textarea.selectionEnd ?? 0;
        const next = transform(changelog, start, end);
        setChangelog(next.value);

        requestAnimationFrame(() => {
            if(!textareaRef.current) {
                return;
            }

            textareaRef.current.focus();
            if(typeof next.selectionStart === "number" && typeof next.selectionEnd === "number") {
                textareaRef.current.setSelectionRange(next.selectionStart, next.selectionEnd);
            }
        });
    };

    const wrapSelection = (prefix, suffix = prefix) => {
        withSelection((value, start, end) => {
            const selected = value.slice(start, end);
            const nextValue = `${value.slice(0, start)}${prefix}${selected}${suffix}${value.slice(end)}`;
            const selectionStart = start + prefix.length;
            const selectionEnd = selectionStart + selected.length;
            return { value: nextValue, selectionStart, selectionEnd };
        });
    };

    const prefixLines = (prefix) => {
        withSelection((value, start, end) => {
            if(start === end) {
                const nextValue = `${value.slice(0, start)}${prefix}${value.slice(end)}`;
                const caret = start + prefix.length;
                return { value: nextValue, selectionStart: caret, selectionEnd: caret };
            }

            const lineStart = value.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
            const selectedText = value.slice(lineStart, end);
            const transformed = selectedText.split("\n").map((line) => (line.trim() ? `${prefix}${line}` : line)).join("\n");
            const nextValue = `${value.slice(0, lineStart)}${transformed}${value.slice(end)}`;
            return {
                value: nextValue,
                selectionStart: lineStart,
                selectionEnd: lineStart + transformed.length,
            };
        });
    };

    const insertAtSelection = (text) => {
        withSelection((value, start, end) => {
            const nextValue = `${value.slice(0, start)}${text}${value.slice(end)}`;
            const caret = start + text.length;
            return { value: nextValue, selectionStart: caret, selectionEnd: caret };
        });
    };

    return (
        <Modal isOpen={isOpen} onRequestClose={onRequestClose} className="modal active" overlayClassName="modal-overlay">
            <div className="modal-window version-upload-modal">
                <div className="modal-window__header">
                    <p className="modal-window__title">Edit details</p>

                    <button className="icon-button modal-window__close" type="button" onClick={onRequestClose} disabled={editLoading}>
                        <svg className="icon icon--cross" height="24" width="24">
                            <path fillRule="evenodd" clipRule="evenodd" d="M5.293 5.293a1 1 0 0 1 1.414 0L12 10.586l5.293-5.293a1 1 0 0 1 1.414 1.414L13.414 12l5.293 5.293a1 1 0 0 1-1.414 1.414L12 13.414l-5.293 5.293a1 1 0 0 1-1.414-1.414L10.586 12 5.293 6.707a1 1 0 0 1 0-1.414Z" />
                        </svg>
                    </button>
                </div>

                <div className="modal-window__content">
                    <form onSubmit={onSubmit}>
                        <p className="blog-settings__field-title">{t("versions.fields.releaseChannel")}</p>
                        <div className="version-release-channel-picker" role="group" aria-label={t("versions.fields.releaseChannel")}>
                            {releaseChannels.map((channel) => {
                                const isActive = editFormData.release_channel === channel;

                                return (
                                    <button key={channel} type="button" className={`version-release-channel-picker__option ${isActive ? "is-active" : ""}`} onClick={() => handleSelectEditReleaseChannel(channel)} disabled={editLoading} aria-pressed={isActive}>
                                        <svg className="version-release-channel-picker__check" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                            <path d="M20 6 9 17l-5-5" />
                                        </svg>

                                        {t(`versions.releaseChannels.${channel}`)}
                                    </button>
                                );
                            })}
                        </div>

                        <p className="blog-settings__field-title">{t("versions.fields.versionNumber")}</p>
                        <div className="field field--default">
                            <label className="field__wrapper">
                                <input type="text" name="version_number" value={editFormData.version_number} onChange={handleEditInputChange} className="text-input" required disabled={editLoading} />
                            </label>
                        </div>

                        <p className="blog-settings__field-title">{t("versions.fields.changelog")}</p>
                        <div className="markdown-editor">
                            <div className="markdown-editor__toolbar" role="toolbar" aria-label="Version changelog markdown toolbar">
                                <div className="markdown-editor__toolbar-buttons">
                                    <button type="button" className="markdown-editor__tool" onClick={() => prefixLines("# ")} aria-label="Heading 1" title="Heading 1" disabled={isPreviewVisible || editLoading}>H1</button>
                                    <button type="button" className="markdown-editor__tool" onClick={() => prefixLines("## ")} aria-label="Heading 2" title="Heading 2" disabled={isPreviewVisible || editLoading}>H2</button>
                                    <button type="button" className="markdown-editor__tool" onClick={() => prefixLines("### ")} aria-label="Heading 3" title="Heading 3" disabled={isPreviewVisible || editLoading}>H3</button>
                                    <button type="button" className="markdown-editor__tool" onClick={() => wrapSelection("**", "**")} aria-label="Bold" title="Bold" disabled={isPreviewVisible || editLoading}><strong>B</strong></button>
                                    <button type="button" className="markdown-editor__tool" onClick={() => wrapSelection("*", "*")} aria-label="Italic" title="Italic" disabled={isPreviewVisible || editLoading}><em>I</em></button>
                                    <button type="button" className="markdown-editor__tool" onClick={() => wrapSelection("~~", "~~")} aria-label="Strikethrough" title="Strikethrough" disabled={isPreviewVisible || editLoading}><s>S</s></button>
                                    <button type="button" className="markdown-editor__tool" onClick={() => wrapSelection("`", "`")} aria-label="Code" title="Code" disabled={isPreviewVisible || editLoading}>{"</>"}</button>
                                    <button type="button" className="markdown-editor__tool" onClick={() => prefixLines("- ")} aria-label="Bulleted list" title="Bulleted list" disabled={isPreviewVisible || editLoading}>UL</button>
                                    <button type="button" className="markdown-editor__tool" onClick={() => prefixLines("1. ")} aria-label="Ordered list" title="Ordered list" disabled={isPreviewVisible || editLoading}>1.</button>
                                    <button type="button" className="markdown-editor__tool" onClick={() => insertAtSelection("[link text](https://)")} aria-label="Link" title="Link" disabled={isPreviewVisible || editLoading}>Link</button>
                                    <button type="button" className="markdown-editor__tool" onClick={() => insertAtSelection("![alt text](https://)")} aria-label="Image" title="Image" disabled={isPreviewVisible || editLoading}>Image</button>

                                    <label className="markdown-editor__preview-toggle">
                                        <input type="checkbox" checked={isPreviewVisible} onChange={(event) => setIsPreviewVisible(event.target.checked)} disabled={editLoading} />
                                        <span className="markdown-editor__preview-toggle-ui" aria-hidden="true">
                                            <span className="markdown-editor__preview-toggle-thumb"></span>
                                        </span>
                                        <span>{t("description.preview")}</span>
                                    </label>
                                </div>
                            </div>

                            {!isPreviewVisible && (
                                <div className="field field--default textarea markdown-editor__panel">
                                    <label style={{ marginBottom: "0" }} className="field__wrapper">
                                        <textarea
                                            ref={textareaRef}
                                            name="changelog"
                                            value={changelog}
                                            onChange={handleEditInputChange}
                                            placeholder={t("versions.placeholders.changelog")}
                                            className="autosize textarea__input markdown-editor__textarea"
                                            style={{ minHeight: "220px" }}
                                            disabled={editLoading}
                                        />
                                    </label>
                                </div>
                            )}

                            {isPreviewVisible && (
                                <div className="markdown-editor__preview markdown-editor__panel markdown-body">
                                    <div className="markdown-editor__preview-scroll">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            rehypePlugins={[rehypeRaw]}
                                            components={{
                                                a: ({ href, children }) => {
                                                    const safeHref = getSafeMarkdownHref(href);
                                                    if(!safeHref) {
                                                        return <>{children}</>;
                                                    }

                                                    const isExternal = /^https?:\/\//i.test(safeHref);
                                                    return (
                                                        <a href={safeHref} target={isExternal ? "_blank" : undefined} rel={isExternal ? "noopener noreferrer" : undefined}>
                                                            {children}
                                                        </a>
                                                    );
                                                },
                                                img: ({ src, alt, title }) => {
                                                    const safeSrc = getSafeMarkdownImageSrc(src);
                                                    if(!safeSrc) {
                                                        return null;
                                                    }

                                                    return <img src={safeSrc} alt={alt || ""} title={title} loading="lazy" />;
                                                },
                                            }}
                                        >
                                            {changelog}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="version-upload-actions">
                            <button type="button" className="button button--size-m button--type-minimal" onClick={onRequestClose} disabled={editLoading}>
                                {tProject("cancel")}
                            </button>

                            <button type="submit" className="button button--size-m button--type-primary" disabled={editLoading}>
                                {editLoading ? tProject("updating") : tProject("update")}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Modal>
    );
}