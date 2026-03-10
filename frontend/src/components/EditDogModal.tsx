/**
 * components/EditDogModal.tsx
 *
 * Modal for editing an existing dog. Pre-populates the form with the
 * current dog data so the user can see what they're changing.
 *
 * Only sends fields that were actually changed (the backend PATCH
 * endpoint ignores missing fields).
 */

import { useState, useRef, type SubmitEvent, type ChangeEvent } from 'react';
import { editDog } from '../api/dogs';
import type { Dog, ApiError } from '../types/models';
import type { AxiosError } from 'axios';
import '../styles/components.css';

interface Props {
    dog: Dog;
    onClose: () => void;
    onSuccess: () => void;
}

export default function EditDogModal({ dog, onClose, onSuccess }: Props) {
    // Pre-populate with existing values
    const [name, setName] = useState(dog.name);
    const [age, setAge] = useState(String(dog.age));
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) setImageFile(file);
    }

    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Only include changed fields in the PATCH
        const changes: Record<string, string | number | File> = {};
        if (name !== dog.name) changes.name = name;
        if (parseInt(age, 10) !== dog.age) changes.age = parseInt(age, 10);
        if (imageFile) changes.image = imageFile;

        if (Object.keys(changes).length === 0) {
            setError('No changes detected.');
            setLoading(false);
            return;
        }

        try {
            await editDog(dog.id, changes);
            onSuccess();
            onClose();
        } catch (err) {
            const axiosErr = err as AxiosError<ApiError>;
            setError(axiosErr.response?.data?.detail ?? 'Edit failed.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal" role="dialog" aria-modal="true" aria-labelledby="edit-title">
                <button className="modal__close" onClick={onClose} aria-label="Close">✕</button>
                <h2 className="modal__title" id="edit-title">Edit {dog.name}</h2>

                <form className="form" onSubmit={handleSubmit}>
                    {error && <div className="alert alert--error">⚠ {error}</div>}

                    <div className="form__group">
                        <label className="form__label" htmlFor="edit-name">Name</label>
                        <input
                            id="edit-name"
                            className="form__input"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            maxLength={50}
                        />
                    </div>

                    <div className="form__group">
                        <label className="form__label" htmlFor="edit-age">Age (years)</label>
                        <input
                            id="edit-age"
                            className="form__input"
                            type="number"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            required
                            min={0}
                            max={30}
                        />
                    </div>

                    <div className="form__group">
                        <label className="form__label">New Photo (optional)</label>
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
                            <div className="form__file-icon">{imageFile ? '✅' : '🔄'}</div>
                            <p className="form__file-label">
                                {imageFile
                                    ? <span className="form__file-name">{imageFile.name}</span>
                                    : <><strong>Click to replace</strong> the current photo</>
                                }
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                        <button
                            type="button"
                            className="btn btn--secondary btn--full"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn--primary btn--full"
                            disabled={loading}
                        >
                            {loading ? <span className="spinner" /> : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}