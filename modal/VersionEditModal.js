"use client";

import { useEffect, useRef, useState } from "react";
import Modal from "react-modal";

const EDIT_STEPS = {
    FILES: "files",
    METADATA: "metadata",
    COMPATIBILITY: "compatibility",
};

const VERSION_FILE_ACCEPT = ".jar,.zip,.rar,application/zip, application/x-rar-compressed, application/vnd.rar, application/java-archive";

if(typeof window !== "undefined") {
    Modal.setAppElement("body");
}

export default function VersionEditModal({ isOpen, onRequestClose, editLoading, onSubmit, onDelete, t, tProject, editFormData, handleEditInputChange, editReleaseChannelRef, toggleEditReleaseChannelPopover, isEditReleaseChannelPopoverOpen, releaseChannels, handleSelectEditReleaseChannel, editReleaseChannelLabel, editGameVersionsRef, toggleEditGameVersionsPopover, isEditGameVersionsPopoverOpen, gameVersions, handleEditToggleGameVersion, editGameVersionsLabel, editLoadersRef, toggleEditLoadersPopover, isEditLoadersPopoverOpen, loaders, handleEditToggleLoader, editLoadersLabel }) {
    const [step, setStep] = useState(EDIT_STEPS.FILES);
    const [isDragActive, setIsDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const fileRef = useRef(null);

    useEffect(() => {
        if(!isOpen) {
            setStep(EDIT_STEPS.FILES);
            setIsDragActive(false);
            setSelectedFile(null);
            if(fileRef.current) {
                fileRef.current.value = "";
            }
        }
    }, [isOpen]);

    const openFilePicker = () => {
        if(editLoading || !fileRef.current) {
            return;
        }

        fileRef.current.value = "";
        fileRef.current.click();
    };

    const handleFileChange = (event) => {
        const nextFile = event.target.files?.[0] || null;
        setSelectedFile(nextFile);
        if(nextFile) {
            setStep(EDIT_STEPS.METADATA);
        }
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragActive(true);
    };

    const handleDragLeave = (event) => {
        event.preventDefault();
        event.stopPropagation();
        if(event.currentTarget.contains(event.relatedTarget)) {
            return;
        }

        setIsDragActive(false);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragActive(false);

        const nextFile = event.dataTransfer?.files?.[0] || null;
        if(!nextFile) {
            return;
        }

        setSelectedFile(nextFile);
        const dt = new DataTransfer();
        dt.items.add(nextFile);
        if(fileRef.current) {
            fileRef.current.files = dt.files;
        }

        setStep(EDIT_STEPS.METADATA);
    };

    const formatFileSize = (size) => {
        if(!Number.isFinite(size) || size <= 0) {
            return "0 B";
        }

        const units = ["B", "KB", "MB", "GB"];
        const unitIndex = Math.min(Math.floor(Math.log(size) / Math.log(1024)), units.length - 1);
        const value = size / (1024 ** unitIndex);
        return `${value.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
    };

    const isFilesStep = step === EDIT_STEPS.FILES;
    const isMetadataStep = step === EDIT_STEPS.METADATA;
    const isCompatibilityStep = step === EDIT_STEPS.COMPATIBILITY;
    const dropzoneClassName = `version-upload-dropzone ${(isDragActive || selectedFile) ? "version-upload-dropzone--active" : ""}`;

    const handleFilePickerKeyDown = (event) => {
        if(event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openFilePicker();
        }
    };

    return (
        <Modal isOpen={isOpen} onRequestClose={onRequestClose} className="modal active" overlayClassName="modal-overlay">
            <div className="modal-window version-upload-modal">
                <div className="modal-window__header">
                    <div className="version-upload-steps" aria-label="Edit version steps">
                        <button type="button" className={`version-upload-steps__item version-upload-steps__item--button ${isFilesStep ? "is-active" : "is-complete"}`} onClick={() => setStep(EDIT_STEPS.FILES)} disabled={editLoading} aria-current={isFilesStep ? "step" : undefined}>
                            {t("versions.modal.steps.files")}
                        </button>
                        
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" className="version-upload-steps__separator" aria-hidden="true">
                            <path d="m9 18 6-6-6-6"></path>
                        </svg>
                        
                        <button type="button" className={`version-upload-steps__item version-upload-steps__item--button ${isMetadataStep ? "is-active" : isCompatibilityStep ? "is-complete" : ""}`} onClick={() => setStep(EDIT_STEPS.METADATA)} disabled={editLoading} aria-current={isMetadataStep ? "step" : undefined}>
                            {t("versions.modal.steps.metadata")}
                        </button>
                        
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" className="version-upload-steps__separator" aria-hidden="true">
                            <path d="m9 18 6-6-6-6"></path>
                        </svg>
                        
                        <button type="button" className={`version-upload-steps__item version-upload-steps__item--button ${isCompatibilityStep ? "is-active" : ""}`} onClick={() => setStep(EDIT_STEPS.COMPATIBILITY)} disabled={editLoading} aria-current={isCompatibilityStep ? "step" : undefined}>
                            {t("versions.modal.steps.compatibility")}
                        </button>
                    </div>

                    <button className="icon-button modal-window__close" type="button" onClick={onRequestClose} disabled={editLoading}>
                        <svg className="icon icon--cross" height="24" width="24">
                            <path fillRule="evenodd" clipRule="evenodd" d="M5.293 5.293a1 1 0 0 1 1.414 0L12 10.586l5.293-5.293a1 1 0 0 1 1.414 1.414L13.414 12l5.293 5.293a1 1 0 0 1-1.414 1.414L12 13.414l-5.293 5.293a1 1 0 0 1-1.414-1.414L10.586 12 5.293 6.707a1 1 0 0 1 0-1.414Z" />
                        </svg>
                    </button>
                </div>

                <div className="version-upload-progress" aria-hidden="true">
                    <div className={`version-upload-progress__bar ${isMetadataStep ? "is-metadata" : ""} ${isCompatibilityStep ? "is-compatibility" : ""}`}></div>
                </div>

                <div className="modal-window__content">
                    <form onSubmit={onSubmit}>
                        <input
                            ref={fileRef}
                            type="file"
                            name="file"
                            accept={VERSION_FILE_ACCEPT}
                            className="version-upload-dropzone__input"
                            onChange={handleFileChange}
                            disabled={editLoading}
                        />

                        {isFilesStep ? (
                            <>
                                <div className={dropzoneClassName} role="button" tabIndex={0} onClick={openFilePicker} onKeyDown={handleFilePickerKeyDown} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
                                    <div className="version-upload-dropzone__icon" aria-hidden="true">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                                            <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"></path>
                                            <path d="M12 10v6"></path>
                                            <path d="m9 13 3-3 3 3"></path>
                                        </svg>
                                    </div>

                                    <div className="version-upload-dropzone__text">
                                        {selectedFile ? (
                                            <>
                                                <strong>{selectedFile.name}</strong>
                                                <span>{formatFileSize(selectedFile.size)}</span>
                                            </>
                                        ) : (
                                            <>
                                                <strong>{t("versions.modal.dropzone.replaceTitle")}</strong>
                                                <span>{t("versions.modal.dropzone.replaceHint")}</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="version-upload-actions">
                                    <button type="button" className="button button--size-m button--type-primary" onClick={() => setStep(EDIT_STEPS.METADATA)} disabled={editLoading}>
                                        {t("versions.modal.actions.continue")}
                                    </button>
                                </div>
                            </>
                        ) : isMetadataStep ? (
                            <>
                                <p className="blog-settings__field-title">{t("versions.fields.versionNumber")}</p>
                                <div className="field field--default">
                                    <label className="field__wrapper">
                                        <input type="text" name="version_number" value={editFormData.version_number} onChange={handleEditInputChange} className="text-input" required disabled={editLoading} />
                                    </label>
                                </div>

                                <p className="blog-settings__field-title">{t("versions.fields.changelog")}</p>
                                <div className="field field--default textarea">
                                    <label className="field__wrapper">
                                        <textarea name="changelog" value={editFormData.changelog} onChange={handleEditInputChange} className="autosize textarea__input" style={{ height: "200px" }} disabled={editLoading} />
                                    </label>
                                </div>

                                <p className="blog-settings__field-title">{t("versions.fields.releaseChannel")}</p>
                                <div className="field field--default" ref={editReleaseChannelRef}>
                                    <label className="field__wrapper" onClick={!editLoading ? toggleEditReleaseChannelPopover : undefined}>
                                        <div className="field__wrapper-body">
                                            <div className="select">
                                                <div className="select__selected">{editReleaseChannelLabel}</div>
                                            </div>
                                        </div>
                                    </label>

                                    {isEditReleaseChannelPopoverOpen && !editLoading && (
                                        <div className="popover">
                                            <div className="context-list" style={{ maxHeight: "200px" }}>
                                                {releaseChannels.map((channel) => (
                                                    <div key={channel} className={`context-list-option ${editFormData.release_channel === channel ? "context-list-option--selected" : ""}`} style={{ "--press-duration": "140ms" }} onClick={() => handleSelectEditReleaseChannel(channel)}>
                                                        <div className="context-list-option__label">{t(`versions.releaseChannels.${channel}`)}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="version-upload-actions">
                                    <button type="button" className="button button--size-m button--type-minimal button--with-icon" onClick={() => setStep(EDIT_STEPS.FILES)} disabled={editLoading}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                                            <path d="m12 19-7-7 7-7M19 12H5"></path>
                                        </svg>
                                        
                                        {t("versions.modal.actions.back")}
                                    </button>

                                    <button type="button" className="button button--size-m button--type-primary" onClick={() => setStep(EDIT_STEPS.COMPATIBILITY)} disabled={editLoading}>
                                        {t("versions.modal.actions.continue")}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <p className="blog-settings__field-title">{t("versions.fields.gameVersions")}</p>
                                <div className="field field--default" ref={editGameVersionsRef}>
                                    <label className="field__wrapper" onClick={!editLoading ? toggleEditGameVersionsPopover : undefined}>
                                        <div className="field__wrapper-body">
                                            <div className="select">
                                                <div className="select__selected">{editGameVersionsLabel}</div>
                                            </div>
                                        </div>
                                    </label>

                                    {isEditGameVersionsPopoverOpen && !editLoading && (
                                        <div className="popover">
                                            <div className="context-list" data-scrollable style={{ maxHeight: "200px", overflowY: "auto" }}>
                                                {gameVersions.map((version) => (
                                                    <div key={version} className={`context-list-option ${editFormData.game_versions.includes(version) ? "context-list-option--selected" : ""}`} style={{ "--press-duration": "140ms" }} onClick={() => handleEditToggleGameVersion(version)}>
                                                        <div className="context-list-option__label">{version}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <p className="blog-settings__field-title">{t("versions.fields.loaders")}</p>
                                <div className="field field--default" ref={editLoadersRef}>
                                    <label className="field__wrapper" onClick={!editLoading ? toggleEditLoadersPopover : undefined}>
                                        <div className="field__wrapper-body">
                                            <div className="select">
                                                <div className="select__selected">{editLoadersLabel}</div>
                                            </div>
                                        </div>
                                    </label>

                                    {isEditLoadersPopoverOpen && !editLoading && (
                                        <div className="popover">
                                            <div className="context-list" data-scrollable style={{ maxHeight: "200px", overflowY: "auto" }}>
                                                {loaders.map((loader) => (
                                                    <div key={loader} className={`context-list-option ${editFormData.loaders.includes(loader) ? "context-list-option--selected" : ""}`} style={{ "--press-duration": "140ms" }} onClick={() => handleEditToggleLoader(loader)}>
                                                        <div className="context-list-option__label">{loader}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="version-upload-actions">
                                    <button type="button" className="button button--size-m button--type-minimal button--with-icon" onClick={() => setStep(EDIT_STEPS.METADATA)} disabled={editLoading}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                                            <path d="m12 19-7-7 7-7M19 12H5"></path>
                                        </svg>
                                        
                                        {t("versions.modal.actions.back")}
                                    </button>

                                    <button type="button" className="button button--size-m button--type-negative" onClick={onDelete} disabled={editLoading}>
                                        {tProject("delete")}
                                    </button>

                                    <button type="submit" className="button button--size-m button--type-primary" disabled={editLoading}>
                                        {editLoading ? tProject("updating") : tProject("update")}
                                    </button>
                                </div>
                            </>
                        )}
                    </form>
                </div>
            </div>
        </Modal>
    );
}