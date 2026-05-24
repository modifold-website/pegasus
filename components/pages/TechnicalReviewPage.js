"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Modal from "react-modal";
import axios from "axios";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import { getProjectPath } from "@/utils/projectRoutes";

const statusOptions = ["needs_review", "pending", "scanning", "error", "blocked", "all"];
const sortOptions = ["oldest", "newest"];

const formatBytes = (value) => {
	const bytes = Number(value) || 0;
	if(bytes < 1024) {
		return `${bytes} B`;
	}

	if(bytes < 1024 * 1024) {
		return `${(bytes / 1024).toFixed(1)} KB`;
	}

	return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

const formatDate = (value) => {
	if(!value) {
		return "";
	}

	const date = new Date(value);
	if(Number.isNaN(date.getTime())) {
		return "";
	}

	return date.toLocaleString();
};

export default function TechnicalReviewPage({ authToken, initialVersions, initialTotalPages }) {
	const t = useTranslations("TechnicalReviewPage");
	const [versions, setVersions] = useState(initialVersions || []);
	const [totalPages, setTotalPages] = useState(initialTotalPages || 1);
	const [searchInput, setSearchInput] = useState("");
	const [search, setSearch] = useState("");
	const [status, setStatus] = useState("needs_review");
	const [sort, setSort] = useState("oldest");
	const [page, setPage] = useState(1);
	const [blockingVersion, setBlockingVersion] = useState(null);
	const [blockReason, setBlockReason] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isStatusPopoverOpen, setIsStatusPopoverOpen] = useState(false);
	const [isSortPopoverOpen, setIsSortPopoverOpen] = useState(false);
	const statusPopoverRef = useRef(null);
	const sortPopoverRef = useRef(null);

	useEffect(() => {
		Modal.setAppElement("body");
	}, []);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if(statusPopoverRef.current && !statusPopoverRef.current.contains(event.target)) {
				setIsStatusPopoverOpen(false);
			}

			if(sortPopoverRef.current && !sortPopoverRef.current.contains(event.target)) {
				setIsSortPopoverOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	useEffect(() => {
		const timer = setTimeout(() => {
			if(search !== searchInput) {
				setPage(1);
				setSearch(searchInput);
			}
		}, 350);

		return () => clearTimeout(timer);
	}, [searchInput, search]);

	useEffect(() => {
		const fetchVersions = async () => {
			try {
				const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/moderation/technical-review`, {
					headers: { Authorization: `Bearer ${authToken}` },
					params: {
						search: search || undefined,
						status,
						sort,
						page,
						limit: 20,
					},
				});

				setVersions(response.data.versions || []);
				setTotalPages(response.data.totalPages || 1);
			} catch (error) {
				toast.error(t("errors.fetch"));
			}
		};

		fetchVersions();
	}, [authToken, page, search, sort, status, t]);

	const sortedStatusOptions = useMemo(() => statusOptions, []);
	const statusLabel = t(`statuses.${status}`);
	const sortLabel = t(`filters.sort.${sort}`);

	const handleStatusSelect = (selectedStatus) => {
		setStatus(selectedStatus);
		setIsStatusPopoverOpen(false);
		setPage(1);
	};

	const handleSortSelect = (selectedSort) => {
		setSort(selectedSort);
		setIsSortPopoverOpen(false);
		setPage(1);
	};

	const submitDecision = async (version, decision, reason = "") => {
		setIsSubmitting(true);

		try {
			await axios.post(
				`${process.env.NEXT_PUBLIC_API_BASE}/moderation/technical-review/${version.id}/decision`,
				{ decision, reason },
				{ headers: { Authorization: `Bearer ${authToken}` } }
			);

			toast.success(decision === "approved" ? t("success.approved") : t("success.blocked"));
			setVersions((current) => current.filter((item) => item.id !== version.id));
			setBlockingVersion(null);
			setBlockReason("");
		} catch (error) {
			toast.error(t("errors.decision"));
		} finally {
			setIsSubmitting(false);
		}
	};

	const openBlockModal = (version) => {
		setBlockingVersion(version);
		setBlockReason(version.moderation_reason || "");
	};

	return (
		<>
			<div className="moderation-toolbar">
				<div className="field field--large" style={{ width: "100%", maxWidth: "420px" }}>
					<label className="field__wrapper" style={{ background: "var(--theme-color-background-content)" }}>
						<div className="field__wrapper-body">
							<svg className="icon icon--search field__icon field__icon--left" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
								<path d="m21 21-4.34-4.34"></path>
								<circle cx="11" cy="11" r="8"></circle>
							</svg>

							<input
								placeholder={t("filters.searchPlaceholder")}
								className="text-input"
								type="text"
								value={searchInput}
								onChange={(event) => setSearchInput(event.target.value)}
							/>
						</div>
					</label>
				</div>

				<div className="moderation-toolbar__controls">
					<div className="field field--default blog-settings__input" style={{ width: "200px" }} ref={statusPopoverRef}>
						<label className="field__wrapper" onClick={() => setIsStatusPopoverOpen(!isStatusPopoverOpen)} style={{ cursor: "pointer", background: "var(--theme-color-background-content)" }}>
							<div className="field__wrapper-body">
								<div className="select">
									<div className="select__selected">{statusLabel}</div>
								</div>
							</div>

							<svg style={{ fill: "none" }} className={`icon icon--chevron_down ${isStatusPopoverOpen ? "rotate" : ""}`} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"></path></svg>
						</label>

						{isStatusPopoverOpen && (
							<div className="popover">
								<div className="context-list" data-scrollable style={{ maxHeight: "200px", overflowY: "auto" }}>
									{sortedStatusOptions.map((option) => (
										<div key={option} className={`context-list-option ${status === option ? "context-list-option--selected" : ""}`} onClick={() => handleStatusSelect(option)}>
											<div className="context-list-option__label">{t(`statuses.${option}`)}</div>
										</div>
									))}
								</div>
							</div>
						)}
					</div>

					<div className="field field--default blog-settings__input" style={{ width: "200px" }} ref={sortPopoverRef}>
						<label className="field__wrapper" onClick={() => setIsSortPopoverOpen(!isSortPopoverOpen)} style={{ cursor: "pointer", background: "var(--theme-color-background-content)" }}>
							<div className="field__wrapper-body">
								<div className="select">
									<div className="select__selected">{sortLabel}</div>
								</div>
							</div>

							<svg style={{ fill: "none" }} className={`icon icon--chevron_down ${isSortPopoverOpen ? "rotate" : ""}`} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"></path></svg>
						</label>

						{isSortPopoverOpen && (
							<div className="popover">
								<div className="context-list" data-scrollable style={{ maxHeight: "200px", overflowY: "auto" }}>
									{sortOptions.map((option) => (
										<div key={option} className={`context-list-option ${sort === option ? "context-list-option--selected" : ""}`} onClick={() => handleSortSelect(option)}>
											<div className="context-list-option__label">{t(`filters.sort.${option}`)}</div>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			{versions.length === 0 ? (
				<div className="content content--padding">
					<p>{t("empty")}</p>
				</div>
			) : (
				<div className="projects-grid">
					{versions.map((version) => {
						const project = {
							project_type: version.project_type,
							slug: version.project_slug,
						};
						const report = version.argus_report || {};
						const reasons = Array.isArray(report.reasons) ? report.reasons : [];

						return (
							<div key={version.id} className="new-projects-list">
								<div className="new-project-card">
									<div style={{ display: "flex", gap: "12px", padding: "16px", borderBottom: "1px solid var(--theme-color-border)" }}>
										<Link href={getProjectPath(project)} style={{ height: "96px" }}>
											<img className="new-project-icon" alt={version.project_title} src={version.project_icon_url} />
										</Link>

										<div className="new-project-info">
											<div className="new-project-header">
												<Link href={getProjectPath(project)} className="new-project-title">
													{version.project_title}
												</Link>
											</div>

											<p className="new-project-description">{version.project_summary}</p>

											<div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px", color: "var(--theme-color-text-secondary)", fontSize: "13px" }}>
												<span>{t("fields.version")}: {version.version_number}</span>
												<span>{t("fields.fileSize")}: {formatBytes(version.file_size)}</span>
												<span>{t("fields.status")}: {t(`statuses.${version.moderation_status}`)}</span>
												{version.scan_requested_at && <span>{t("fields.scanRequested")}: {formatDate(version.scan_requested_at)}</span>}
											</div>
										</div>

										<div className="new-project-stats" style={{ minWidth: "220px" }}>
											<a className="button button--size-m button--type-secondary" href={version.file_url} target="_blank" rel="noreferrer">
												{t("actions.download")}
											</a>

											<button className="button button--size-m button--type-primary" type="button" onClick={() => submitDecision(version, "approved")} disabled={isSubmitting}>
												{t("actions.publish")}
											</button>

											<button className="button button--size-m button--type-minimal" type="button" onClick={() => openBlockModal(version)} disabled={isSubmitting}>
												{t("actions.block")}
											</button>
										</div>
									</div>

									<div style={{ padding: "12px 16px", display: "grid", gap: "8px" }}>
										{version.moderation_reason && (
											<div>
												<strong>{t("fields.reason")}:</strong> {version.moderation_reason}
											</div>
										)}

										{report.sha256 && (
											<div>
												<strong>SHA-256:</strong> <code>{report.sha256}</code>
											</div>
										)}

										{reasons.length > 0 && (
											<div>
												<strong>{t("fields.argusReasons")}:</strong>
												<ul style={{ margin: "6px 0 0", paddingLeft: "18px" }}>
													{reasons.map((reason) => <li key={reason}>{reason}</li>)}
												</ul>
											</div>
										)}
									</div>
								</div>
							</div>
						);
					})}
				</div>
			)}

			{totalPages > 1 && (
				<div className="pagination" style={{ marginTop: "20px", textAlign: "center" }}>
					<button className="button button--size-m" type="button" disabled={page === 1} onClick={() => setPage(page - 1)}>
						{t("pagination.previous")}
					</button>

					<span style={{ margin: "0 10px" }}>{t("pagination.pageOf", { page, totalPages })}</span>

					<button className="button button--size-m" type="button" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
						{t("pagination.next")}
					</button>
				</div>
			)}

			<Modal closeTimeoutMS={150} isOpen={Boolean(blockingVersion)} onRequestClose={() => setBlockingVersion(null)} className="modal active" overlayClassName="modal-overlay">
				<div className="modal-window">
					<div className="modal-window__header">
						<span style={{ fontSize: "18px", fontWeight: "500" }}>{t("modal.title")}</span>
						<button className="icon-button modal-window__close" type="button" onClick={() => setBlockingVersion(null)} disabled={isSubmitting} aria-label={t("modal.close")}>
							<svg className="icon icon--x" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
								<path d="M18 6 6 18"></path>
								<path d="m6 6 12 12"></path>
							</svg>
						</button>
					</div>

					<div className="modal-window__content">
						<label className="field field--default">
							<span className="field__label">{t("modal.reason")}</span>
							<textarea className="text-area" value={blockReason} onChange={(event) => setBlockReason(event.target.value)} rows={5} placeholder={t("modal.reasonPlaceholder")} />
						</label>

						<div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
							<button className="button button--size-m button--type-secondary" type="button" onClick={() => setBlockingVersion(null)} disabled={isSubmitting}>
								{t("modal.cancel")}
							</button>

							<button className="button button--size-m button--type-primary" type="button" onClick={() => blockingVersion && submitDecision(blockingVersion, "blocked", blockReason)} disabled={isSubmitting || !blockReason.trim()}>
								{t("modal.confirm")}
							</button>
						</div>
					</div>
				</div>
			</Modal>
		</>
	);
}