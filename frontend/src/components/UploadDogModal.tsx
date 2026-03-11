/**
 * components/UploadDogModal.tsx
 * 
 * A modal dialog for uploading a new dog.
 * 
 */

import {
    useState,
    useRef,
    type SubmitEvent,
    type ChangeEvent
} from "react";
import { uploadDog } from "../api/dogs";
import type { AxiosError } from "axios";
import type { ApiError } from "../types/models";
import "../styles/components.css";

interface Props {
    onClose: () => void;
    onSuccess: () => void;
}

export default function UploadDogModal({ onClose, onSuccess }: Props) {
    // -- FORM STATE --
    const [name, setName] = useState<string>('');
    const [age, setAge] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) setImageFile(file);
    }

    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault();
        if (!imageFile) {
            setError('Please select an image.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await uploadDog({
                name,
                age: parseInt(age, 10),
                description,
                image: imageFile
            });
            onSuccess();
            onClose();
        } catch (err) {
            const axiosErr = err as AxiosError<ApiError>;
            setError(axiosErr.response?.data?.detail ?? 'Upload Failed.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal" role="dialog" aria-modal="true" aria-labelledby="upload-title">
                <button className="modal__close" onClick={onClose} aria-label="Close">✕</button>
                <h2 className="modal__title" id="upload-title">Share Your Dog</h2>

                <form className="form" onSubmit={handleSubmit}>
                    {error && <div className="alert alert--error">⚠ {error}</div>}

                    {/* NAME */}
                    <div className="form__group">
                        <label className="form__label" htmlFor="dog-name">Name</label>
                        <input
                            id="dog-name"
                            className="form__input"
                            type="text"
                            placeholder="e.g. Manny"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            maxLength={64}
                        />
                    </div>


                    {/* AGE */}
                    <div className="form__group">
                        <label className="form__label" htmlFor="dog-age">Age (years)</label>
                        <input
                            id="dog-age"
                            className="form__input"
                            type="number"
                            placeholder="e.g. 3"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            required
                            min={0}
                            max={99}
                        />
                    </div>

                    {/* DESCRIPTION */}
                    <div className="form__group">
                        <label className="form__label" htmlFor="dog-desc">Description</label>
                        <textarea
                            id="dog-desc"
                            className="form__textarea"
                            placeholder="Tell us about your dog..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            maxLength={250}
                        />
                    </div>

                    {/* IMAGE UPLOAD */}
                    <div className="form__group">
                        <label className="form__label">Photo</label>
                        {/* Clicking the styled div triggers the hidden file input */}
                        <div
                            className={`form__file-zone ${imageFile ? 'form__file-zone--has-file' : ''}`}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".jpg,.jpeg,.png,.webp"
                                onChange={handleFileChange}
                            />
                            <div className="form__file-icon">{imageFile ? '✅' : '📸'}</div>
                            {imageFile ? (
                                <p className="form__file-name">{imageFile.name}</p>
                            ) : (
                                <p className="form__file-label">
                                    <strong>Click to upload</strong> · JPG, PNG, WEBP
                                </p>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn--primary btn--full"
                        disabled={loading}
                    >
                        {loading ? <span className="spinner" /> : 'Upload Dog 🐾'}
                    </button>
                </form>
            </div>
        </div>
    );
}