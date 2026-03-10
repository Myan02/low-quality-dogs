/**
 * components/DeleteConfirmModal.tsx
 *
 * A simple confirmation dialog shown before deleting a dog.
 * This prevents accidental deletions.
 */

import { useState } from 'react';
import { deleteDog } from '../api/dogs';
import type { Dog, ApiError } from '../types/models';
import type { AxiosError } from 'axios';
import '../styles/components.css';

interface Props {
    dog: Dog;
    onClose: () => void;
    onSuccess: () => void;
}

export default function DeleteConfirmModal({ dog, onClose, onSuccess }: Props) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleDelete() {
        setLoading(true);
        setError(null);
        try {
            await deleteDog(dog.id);
            onSuccess();
            onClose();
        } catch (err) {
            const axiosErr = err as AxiosError<ApiError>;
            setError(axiosErr.response?.data?.detail ?? 'Delete failed.');
            setLoading(false);
        }
    }

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal" role="dialog" aria-modal="true" aria-labelledby="delete-title">
                <button className="modal__close" onClick={onClose} aria-label="Close">✕</button>
                <h2 className="modal__title" id="delete-title">Delete {dog.name}?</h2>

                {error && <div className="alert alert--error" style={{ marginBottom: 'var(--space-4)' }}>⚠ {error}</div>}

                <p className="confirm-dialog__text">
                    This will permanently remove <strong>{dog.name}</strong> and their photo.
                    This action cannot be undone.
                </p>

                <div className="confirm-dialog__actions">
                    <button className="btn btn--secondary" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className="btn btn--danger"
                        onClick={handleDelete}
                        disabled={loading}
                    >
                        {loading ? <span className="spinner" /> : 'Yes, Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
}