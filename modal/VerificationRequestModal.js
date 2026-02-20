"use client";

import { useEffect, useState } from "react";
import Modal from "react-modal";
import axios from "axios";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

Modal.setAppElement("body");

export default function VerificationRequestModal({ isOpen, onRequestClose, onSubmitted }) {
    const t = useTranslations("VerificationRequestModal");
    const [xUrl, setXUrl] = useState("");
    const [youtubeUrl, setYoutubeUrl] = useState("");
    const [curseforgeUrl, setCurseforgeUrl] = useState("");
    const [note, setNote] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [confirmed, setConfirmed] = useState(false);

    useEffect(() => {
        if(isOpen) {
            setXUrl("");
            setYoutubeUrl("");
            setCurseforgeUrl("");
            setNote("");
            setConfirmed(false);
            setIsSubmitting(false);
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if(!xUrl && !youtubeUrl && !curseforgeUrl) {
            toast.error(t("errors.missingLinks"));
            return;
        }

        if(!confirmed) {
            toast.error(t("errors.confirmRequired"));
            return;
        }

        try {
            setIsSubmitting(true);
            await axios.post(
                `${process.env.NEXT_PUBLIC_API_BASE}/verification/request`,
                {
                    x_url: xUrl,
                    youtube_url: youtubeUrl,
                    curseforge_url: curseforgeUrl,
                    note,
                },
                { headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } }
            );

            toast.success(t("success"));
            onSubmitted?.();
            onRequestClose();
        } catch (error) {
            const message = error.response?.data?.message;
            if(message === "Pending request already exists") {
                toast.error(t("errors.pending"));
            } else if(message === "Reapply cooldown") {
                toast.error(t("errors.cooldown"));
            } else if(message === "At least one social link is required") {
                toast.error(t("errors.missingLinks"));
            } else {
                toast.error(t("errors.generic"));
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onRequestClose={onRequestClose} className="modal active" overlayClassName="modal-overlay">
            <div className="modal-window">
                <div className="modal-window__header">
                    <h2 className="modal-window__title">{t("title")}</h2>
                    <button className="icon-button modal-window__close" type="button" onClick={onRequestClose} aria-label={t("close")}>
                        <svg className="icon icon--cross" height="24" width="24">
                            <path fillRule="evenodd" clipRule="evenodd" d="M5.293 5.293a1 1 0 0 1 1.414 0L12 10.586l5.293-5.293a1 1 0 0 1 1.414 1.414L13.414 12l5.293 5.293a1 1 0 0 1-1.414 1.414L12 13.414l-5.293 5.293a1 1 0 0 1-1.414-1.414L10.586 12 5.293 6.707a1 1 0 0 1 0-1.414Z" />
                        </svg>
                    </button>
                </div>

                <div className="modal-window__content">
                    <p style={{ marginBottom: "15px" }}>{t("description")}</p>

                    <form onSubmit={handleSubmit}>
                        <p className="blog-settings__field-title">{t("xUrl")}</p>
                        <div className="field field--default blog-settings__input">
                            <label className="field__wrapper">
                                <input type="text" className="text-input" value={xUrl} onChange={(e) => setXUrl(e.target.value)} placeholder={t("placeholders.xUrl")} />
                            </label>
                        </div>

                        <p className="blog-settings__field-title">{t("youtubeUrl")}</p>
                        <div className="field field--default blog-settings__input">
                            <label className="field__wrapper">
                                <input type="text" className="text-input" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder={t("placeholders.youtubeUrl")} />
                            </label>
                        </div>

                        <p className="blog-settings__field-title">{t("curseforgeUrl")}</p>
                        <div className="field field--default blog-settings__input">
                            <label className="field__wrapper">
                                <input type="text" className="text-input" value={curseforgeUrl} onChange={(e) => setCurseforgeUrl(e.target.value)} placeholder={t("placeholders.curseforgeUrl")} />
                            </label>
                        </div>

                        <p className="blog-settings__field-title">{t("note")}</p>
                        <div className="field field--default textarea blog-settings__input">
                            <label className="field__wrapper">
                                <textarea className="autosize textarea__input" value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("placeholders.note")} style={{ height: "96px" }} />
                            </label>
                        </div>

                        <label style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px" }}>
                            <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />
                            <span>{t("confirm")}</span>
                        </label>

                        <div style={{ display: "flex", gap: "8px", marginTop: "18px" }}>
                            <button type="submit" className="button button--size-m button--type-primary" disabled={isSubmitting}>
                                {isSubmitting ? t("submitting") : t("submit")}
                            </button>

                            <button type="button" className="button button--size-m button--type-minimal" onClick={onRequestClose}>
                                {t("cancel")}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Modal>
    );
}