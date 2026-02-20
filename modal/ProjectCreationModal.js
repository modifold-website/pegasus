"use client";

import { useState } from "react";
import Modal from "react-modal";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

Modal.setAppElement("body");

export default function ProjectCreationModal({ isOpen, authToken, onRequestClose }) {
    const t = useTranslations("ProjectCreationModal");
    const { isLoggedIn } = useAuth();
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: "",
        summary: "",
        visibility: "public",
        project_type: "",
    });
    const [loading, setLoading] = useState(false);

    if(!isLoggedIn && isOpen) {
        router.push("/");
        return null;
    }

    const handleProjectTypeClick = (type) => {
        setFormData({ ...formData, project_type: type });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if(!formData.project_type) {
            toast.error(t("errors.noProjectType"));
            setLoading(false);
            return;
        }

        const data = new FormData();
        data.append("title", formData.title);
        data.append("summary", formData.summary);
        data.append("visibility", formData.visibility);
        data.append("project_type", formData.project_type);

        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE}/projects`, data, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            toast.success(t("success"));
            onRequestClose();
            router.push(`/mod/${res.data.slug}/settings`);
        } catch (err) {
            toast.error(err.response?.data?.message || t("errors.generic"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onRequestClose={onRequestClose} className="modal active" overlayClassName="modal-overlay">
            <div className="modal-window">
                <div className="modal-window__header">
                    <button className="icon-button modal-window__close" type="button" onClick={onRequestClose} aria-label={t("close")}>
                        <svg className="icon icon--cross" height="24" width="24">
                            <path fillRule="evenodd" clipRule="evenodd" d="M5.293 5.293a1 1 0 0 1 1.414 0L12 10.586l5.293-5.293a1 1 0 0 1 1.414 1.414L13.414 12l5.293 5.293a1 1 0 0 1-1.414 1.414L12 13.414l-5.293 5.293a1 1 0 0 1-1.414-1.414L10.586 12 5.293 6.707a1 1 0 0 1 0-1.414Z"></path>
                        </svg>
                    </button>
                </div>

                <div className="modal-window__content">
                    <form onSubmit={handleSubmit}>
                        <p className="blog-settings__field-title">{t("name")}</p>
                        <div className="field field--default">
                            <label className="field__wrapper">
                                <input type="text" name="title" placeholder={t("placeholders.name")} value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required className="text-input" maxLength="30" disabled={loading} />
                            </label>
                        </div>

                        <p className="blog-settings__field-title" style={{ marginBottom: "4px" }}>{t("summary")}</p>

                        <p style={{ marginBottom: "8px", color: "var(--theme-color-text-secondary)" }}>{t("summaryHint")}</p>
                        
                        <div className="field field--default textarea">
                            <label className="field__wrapper">
                                <textarea name="summary" value={formData.summary} onChange={(e) => setFormData({ ...formData, summary: e.target.value })} placeholder={t("placeholders.summary")} className="autosize textarea__input" style={{ height: "128px" }} required minLength={30} disabled={loading} />
                            </label>
                        </div>

                        <p className="blog-settings__field-title">{t("projectType")}</p>
                        <div className="field field--default blog-settings__input project-type-buttons">
                            {["mod"].map((type) => (
                                <button key={type} type="button" className={`button button--size-m ${formData.project_type === type ? "button--type-positive" : "button--type-minimal"}`} onClick={() => handleProjectTypeClick(type)} aria-pressed={formData.project_type === type} disabled={loading}>
                                    {t(`projectTypes.${type}`)}
                                </button>
                            ))}

                            <input type="hidden" name="project_type" value={formData.project_type} required />
                        </div>

                        <div style={{ display: "flex", gap: "8px", marginTop: "18px" }}>
                            <button type="submit" className="button button--size-m button--type-primary" disabled={loading}>
                                {loading ? t("creating") : t("createProject")}
                            </button>

                            <button type="button" className="button button--size-m button--type-minimal" onClick={onRequestClose} disabled={loading}>
                                {t("cancel")}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Modal>
    );
}