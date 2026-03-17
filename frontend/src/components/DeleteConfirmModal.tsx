/**
 * components/DeleteConfirmModal.tsx
 *
 * A simple confirmation dialog shown before deleting a dog.
 * This prevents accidental deletions.
 */

import { useState } from 'react';
import { deleteDog } from '../api/dogs';
import type { Dog, User, ApiError } from '../types/models';
import type { AxiosError } from 'axios';
import '../styles/components.css';
import { deleteUser } from '../api/auth';

interface Props {
    dog?: Dog;
    user?: User;
    kind: "Dog" | "User";

    onClose: () => void;
    onSuccess: () => void;
}

export default function DeleteConfirmModal({ dog, user, kind, onClose, onSuccess }: Props) {
    /* ── States ────────────────────────────────── */
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /* ── Event Handlers ────────────────────────────────── */
    async function handleDelete() {
        setLoading(true);
        setError(null);

        try {
            // call endpoint based on whether a dog or user is being deleted
            kind === 'Dog' ? await deleteDog(dog?.id) : await deleteUser(user?.id);

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
                <h2 className="modal__title" id="delete-title">Delete {kind === 'Dog' ? dog?.name : user?.username}?</h2>

                {error && <div className="alert alert--error" style={{ marginBottom: 'var(--space-4)' }}>⚠ {error}</div>}

                <p className="confirm-dialog__text">
                    This will permanently remove <strong>{kind === 'Dog' ? dog?.name : user?.username}</strong> {kind === 'Dog' && (<> and their photo</>)}.
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