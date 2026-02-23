"use client";

import React, { useEffect, useRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslations } from "next-intl";
import Modal from "react-modal";
import ProjectSettingsSidebar from "@/components/ui/ProjectSettingsSidebar";

Modal.setAppElement("body");

export default function GallerySettings({ project, authToken }) {
    const t = useTranslations("SettingsProjectPage");
    const tProject = useTranslations("ProjectPage");

    const images = Array.isArray(project?.gallery) ? project.gallery : [];
    const [galleryImages, setGalleryImages] = useState(images);

    const uploadPickerRef = useRef(null);
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadPreviewUrl, setUploadPreviewUrl] = useState("");

    const [uploadFormData, setUploadFormData] = useState({
        title: "",
        description: "",
        ordering: 0,
        featured: false,
    });

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [editLoading, setEditLoading] = useState(false);
    const [editFormData, setEditFormData] = useState({
        title: "",
        description: "",
        ordering: 0,
        featured: false,
    });

    useEffect(() => {
        setGalleryImages(Array.isArray(project?.gallery) ? project.gallery : []);
    }, [project?.gallery]);

    useEffect(() => {
        return () => {
            if(uploadPreviewUrl) {
                URL.revokeObjectURL(uploadPreviewUrl);
            }
        };
    }, [uploadPreviewUrl]);

    const refreshGallery = async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/projects/${project.slug}`, {
            headers: {
                Accept: "application/json",
                Authorization: authToken ? `Bearer ${authToken}` : undefined,
            },
        });

        if(!response.ok) {
            throw new Error("Failed to refresh gallery");
        }

        const nextProject = await response.json();
        setGalleryImages(Array.isArray(nextProject?.gallery) ? nextProject.gallery : []);
    };

    const resetUploadModal = () => {
        setUploadModalOpen(false);
        setUploadLoading(false);
        setUploadFile(null);
        setUploadFormData({
            title: "",
            description: "",
            ordering: 0,
            featured: false,
        });

        if(uploadPreviewUrl) {
            URL.revokeObjectURL(uploadPreviewUrl);
            setUploadPreviewUrl("");
        }

        if(uploadPickerRef.current) {
            uploadPickerRef.current.value = "";
        }
    };

    const handleUploadFileSelected = (file) => {
        if(!file) {
            return;
        }

        if(uploadPreviewUrl) {
            URL.revokeObjectURL(uploadPreviewUrl);
        }

        setUploadFile(file);
        setUploadPreviewUrl(URL.createObjectURL(file));
        setUploadModalOpen(true);
    };

    const openUploadPicker = () => {
        uploadPickerRef.current?.click();
    };

    const handleUploadPickerChange = (e) => {
        const file = e.target.files?.[0];
        handleUploadFileSelected(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(!uploadFile) {
            return;
        }

        setUploadLoading(true);

        const formDataToSend = new FormData();
        formDataToSend.append("image", uploadFile);
        formDataToSend.append("title", uploadFormData.title);
        formDataToSend.append("description", uploadFormData.description);
        formDataToSend.append("ordering", uploadFormData.ordering);
        formDataToSend.append("featured", uploadFormData.featured);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/projects/${project.slug}/gallery`, {
                method: "POST",
                headers: { Authorization: `Bearer ${authToken}` },
                body: formDataToSend,
            });

            if(response.ok) {
                toast.success(t("gallerySettings.success"));
                resetUploadModal();
                await refreshGallery();
            } else {
                toast.error(t("gallerySettings.errors.upload"));
            }
        } catch {
            toast.error(t("gallerySettings.errors.upload"));
        } finally {
            setUploadLoading(false);
        }
    };

    const openEditModal = (image) => {
        setSelectedImage(image);
        setEditFormData({
            title: image?.title || "",
            description: image?.description || "",
            ordering: image?.ordering ?? 0,
            featured: false,
        });
        setEditModalOpen(true);
    };

    const closeEditModal = () => {
        setEditModalOpen(false);
        setSelectedImage(null);
        setEditLoading(false);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if(!selectedImage) {
            return;
        }

        setEditLoading(true);

        const formDataToSend = new FormData();
        formDataToSend.append("title", editFormData.title);
        formDataToSend.append("description", editFormData.description);
        formDataToSend.append("ordering", editFormData.ordering);
        formDataToSend.append("featured", editFormData.featured);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/projects/${project.slug}/gallery/${selectedImage.id}`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${authToken}` },
                body: formDataToSend,
            });

            if(response.ok) {
                toast.success(tProject("gallery.updateSuccess"));
                closeEditModal();
                await refreshGallery();
            } else {
                toast.error(tProject("gallery.updateError"));
            }
        } catch {
            toast.error(tProject("gallery.updateError"));
        } finally {
            setEditLoading(false);
        }
    };

    const handleDelete = async () => {
        if(!selectedImage) {
            return;
        }

        if(!confirm(tProject("gallery.deleteConfirm"))) {
            return;
        }

        setEditLoading(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/projects/${project.slug}/gallery/${selectedImage.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if(response.ok) {
                toast.success(tProject("gallery.deleteSuccess"));
                closeEditModal();
                await refreshGallery();
            } else {
                toast.error(tProject("gallery.deleteError"));
            }
        } catch {
            toast.error(tProject("gallery.deleteError"));
        } finally {
            setEditLoading(false);
        }
    };

    const handleDeleteById = async (imageId) => {
        if(!confirm(tProject("gallery.deleteConfirm"))) {
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/projects/${project.slug}/gallery/${imageId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if(response.ok) {
                toast.success(tProject("gallery.deleteSuccess"));
                await refreshGallery();
            } else {
                toast.error(tProject("gallery.deleteError"));
            }
        } catch {
            toast.error(tProject("gallery.deleteError"));
        }
    };

    const formatDate = (dateValue) => {
        if(!dateValue) {
            return "";
        }

        try {
            return new Intl.DateTimeFormat(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
            }).format(new Date(dateValue));
        } catch {
            return String(dateValue);
        }
    };

    return (
        <div className="layout">
            <div className="page-content settings-page">
                <ProjectSettingsSidebar
                    project={project}
                    iconAlt={t("general.iconAlt")}
                    labels={{
                        general: t("sidebar.general"),
                        description: t("sidebar.description"),
                        links: t("sidebar.links"),
                        versions: t("sidebar.versions"),
                        gallery: t("sidebar.gallery"),
                        tags: t("sidebar.tags"),
                        license: t("sidebar.license"),
                        moderation: t("sidebar.moderation"),
                    }}
                />

                <div style={{ width: "100%" }}>
                    <div className="content content--padding" style={{ marginBottom: "12px" }}>
                        <input ref={uploadPickerRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleUploadPickerChange} />
                        
                        <div className="gallery-upload-bar" role="button" tabIndex={0} onClick={openUploadPicker} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && openUploadPicker()}>
                            <button type="button" className="button button--size-m button--type-primary button--with-icon" style={{ "--icon-size": "17px" }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-upload-icon lucide-upload"><path d="M12 3v12"/><path d="m17 8-5-5-5 5"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/></svg>

                                {t("gallerySettings.actions.add")}
                            </button>
                        </div>
                    </div>

                    {galleryImages.length === 0 ? (
                        <p style={{ color: "var(--theme-color-text-secondary)" }}>{tProject("gallery.noImages")}</p>
                    ) : (
                        <div className="gallery-settings-grid">
                            {galleryImages.map((image) => (
                                <div key={image.id} className="gallery-settings-card">
                                    <div className="gallery-settings-card__preview">
                                        <img src={image.url} alt={image.title || tProject("gallery.image")} className="gallery-settings-card__image" loading={Boolean(Number(image?.featured)) ? "eager" : "lazy"} />
                                    </div>

                                    <div className="gallery-settings-card__body">
                                        <div className="gallery-settings-card__date">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-calendar-icon lucide-calendar"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>

                                            {formatDate(image.created_at)}
                                        </div>

                                        <div className="gallery-settings-card__actions">
                                            <button type="button" className="button button--size-m button--type-minimal" onClick={() => openEditModal(image)}>{tProject("gallery.editImage")}</button>
                                            
                                            <button type="button" className="button button--size-m button--type-minimal" onClick={() => handleDeleteById(image.id)}>{tProject("delete")}</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
            </div>

            <Modal isOpen={uploadModalOpen} onRequestClose={resetUploadModal} className="modal active" overlayClassName="modal-overlay">
                <div className="modal-window">
                    <div className="modal-window__header">
                        <span>{t("gallerySettings.title")}</span>
                        
                        <button className="icon-button modal-window__close" type="button" onClick={resetUploadModal} disabled={uploadLoading}>
                            <svg className="icon icon--cross" height="24" width="24">
                                <path fillRule="evenodd" clipRule="evenodd" d="M5.293 5.293a1 1 0 0 1 1.414 0L12 10.586l5.293-5.293a1 1 0 0 1 1.414 1.414L13.414 12l5.293 5.293a1 1 0 0 1-1.414 1.414L12 13.414l-5.293 5.293a1 1 0 0 1-1.414-1.414L10.586 12 5.293 6.707a1 1 0 0 1 0-1.414Z"></path>
                            </svg>
                        </button>
                    </div>

                    <div className="modal-window__content">
                        <form onSubmit={handleSubmit} className="gallery-modal-form">
                            <div className="gallery-modal-preview">
                                {uploadPreviewUrl && <img src={uploadPreviewUrl} alt={uploadFormData.title || tProject("gallery.image")} />}
                            </div>

                            <p className="blog-settings__field-title">{t("gallerySettings.fields.title")}</p>
                            <div className="field field--default blog-settings__input">
                                <label className="field__wrapper">
                                    <input type="text" value={uploadFormData.title} onChange={(e) => setUploadFormData((prev) => ({ ...prev, title: e.target.value }))} placeholder={t("gallerySettings.placeholders.title")} className="text-input" disabled={uploadLoading} />
                                </label>
                            </div>

                            <p className="blog-settings__field-title">{t("gallerySettings.fields.description")}</p>
                            <div className="field field--default textarea blog-settings__input">
                                <label className="field__wrapper">
                                    <textarea value={uploadFormData.description} onChange={(e) => setUploadFormData((prev) => ({ ...prev, description: e.target.value }))} placeholder={t("gallerySettings.placeholders.description")} className="autosize textarea__input" style={{ height: "160px" }} disabled={uploadLoading} />
                                </label>
                            </div>

                            <p className="blog-settings__field-title">{t("gallerySettings.fields.order")}</p>
                            <div className="field field--default blog-settings__input">
                                <label className="field__wrapper">
                                    <input type="number" value={uploadFormData.ordering} onChange={(e) => setUploadFormData((prev) => ({ ...prev, ordering: e.target.value }))} placeholder={t("gallerySettings.placeholders.order")} className="text-input" disabled={uploadLoading} />
                                </label>
                            </div>

                            <p className="blog-settings__field-title">{t("gallerySettings.fields.featured")}</p>

                            <button type="button" className="button button--size-m button--type-minimal" aria-pressed={uploadFormData.featured} onClick={() => setUploadFormData((prev) => ({ ...prev, featured: !prev.featured }))} disabled={uploadLoading}>
                                {uploadFormData.featured ? t("gallerySettings.states.enabled") : t("gallerySettings.states.disabled")}
                            </button>

                            <p className="gallery-modal-help">{t("gallerySettings.featuredHint")}</p>

                            <div className="gallery-modal-actions">
                                <button type="button" className="button button--size-m button--type-minimal" onClick={resetUploadModal} disabled={uploadLoading}>{tProject("cancel")}</button>
                                <button type="submit" className="button button--size-m button--type-primary" disabled={uploadLoading || !uploadFile}>{t("gallerySettings.actions.add")}</button>
                            </div>
                        </form>
                    </div>
                </div>
            </Modal>

            {editModalOpen && selectedImage && (
                <Modal isOpen={editModalOpen} onRequestClose={closeEditModal} className="modal active" overlayClassName="modal-overlay">
                    <div className="modal-window">
                        <div className="modal-window__header">
                            <span>{tProject("gallery.editImage")}</span>
                            
                            <button className="icon-button modal-window__close" type="button" onClick={closeEditModal} disabled={editLoading}>
                                <svg className="icon icon--cross" height="24" width="24">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M5.293 5.293a1 1 0 0 1 1.414 0L12 10.586l5.293-5.293a1 1 0 0 1 1.414 1.414L13.414 12l5.293 5.293a1 1 0 0 1-1.414 1.414L12 13.414l-5.293 5.293a1 1 0 0 1-1.414-1.414L10.586 12 5.293 6.707a1 1 0 0 1 0-1.414Z"></path>
                                </svg>
                            </button>
                        </div>

                        <div className="modal-window__content">
                            <form onSubmit={handleUpdate} className="gallery-modal-form">
                                <div className="gallery-modal-preview">
                                    <img src={selectedImage.url} alt={editFormData.title || tProject("gallery.image")} />
                                </div>

                                <p className="blog-settings__field-title">{tProject("gallery.title")}</p>
                                <div className="field field--default blog-settings__input">
                                    <label className="field__wrapper">
                                        <input type="text" name="title" value={editFormData.title} className="text-input" disabled={editLoading} onChange={(e) => setEditFormData((prev) => ({ ...prev, title: e.target.value }))} />
                                    </label>
                                </div>

                                <p className="blog-settings__field-title">{tProject("gallery.description")}</p>
                                <div className="field field--default textarea blog-settings__input">
                                    <label className="field__wrapper">
                                        <textarea name="description" value={editFormData.description} className="autosize textarea__input" style={{ height: "100px" }} disabled={editLoading} onChange={(e) => setEditFormData((prev) => ({ ...prev, description: e.target.value }))} />
                                    </label>
                                </div>

                                <p className="blog-settings__field-title">{tProject("gallery.orderIndex")}</p>
                                <div className="field field--default blog-settings__input">
                                    <label className="field__wrapper">
                                        <input type="number" name="ordering" value={editFormData.ordering} className="text-input" disabled={editLoading} onChange={(e) => setEditFormData((prev) => ({ ...prev, ordering: e.target.value }))} />
                                    </label>
                                </div>

                                <p className="blog-settings__field-title">{tProject("gallery.featured")}</p>

                                <button type="button" className="button button--size-m button--type-minimal" aria-pressed={editFormData.featured} onClick={() => setEditFormData((prev) => ({ ...prev, featured: !prev.featured }))} disabled={editLoading}>
                                    {editFormData.featured ? t("gallerySettings.states.enabled") : t("gallerySettings.states.disabled")}
                                </button>

                                <p className="gallery-modal-help">{t("gallerySettings.featuredHint")}</p>

                                <div className="gallery-modal-actions">
                                    <button type="button" className="button button--size-m button--type-minimal" onClick={handleDelete} disabled={editLoading}>{tProject("delete")}</button>
                                    <button type="submit" className="button button--size-m button--type-primary" disabled={editLoading}>{tProject("update")}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}