/**
 * components/DogCard.tsx
 * 
 * A single contained card with a dog's image, name, age, description, and owner
 * 
 * if the user is logged in (or a superuser), they also get access to edit and delete
 */

import { useState, useMemo } from "react";
import type { Dog } from "../types/models";
import { useAuth } from "../context/AuthContext";
import "../styles/DogCard.css";

interface DogCardProps {
    dog: Dog;
    onEdit: (dog: Dog) => void;
    onDelete: (dog: Dog) => void;
}

// backend stores images as a dir path like "static/images/elster_1.jpeg"
// this function turns those paths into a url the browser can load
function resolveImageUrl(imagePath: string | null): string | null {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;

    // Extract just the filename (e.g. "elster_2.jpeg") regardless of
    // what directory prefix the backend stored, then serve via /images/
    const normalized = imagePath.replace(/\\/g, '/');
    const filename = normalized.split('/').pop();
    if (!filename) return null;

    return `/images/${filename}`;
}

export default function DogCard({ dog, onEdit, onDelete }: DogCardProps) {

    const { user, isAuthenticated } = useAuth();

    /* ── States ────────────────────────────────────────── */
    const imgUrl = resolveImageUrl(dog.image_url);
    const [imgVisible, setImgVisible] = useState(true);

    // remain authenticated even if the page refreshed
    // only update this when the dependencies change
    const isOwner = useMemo(
        () => isAuthenticated && (user?.id === dog.owner_id || user?.is_superuser),
        [isAuthenticated, user, dog.owner_id]
    );

    return (
        <article className="dog-card">
            {/* ── Image ────────────────────────────────────────── */}
            <div className="dog-card__img-wrap">
                {imgUrl && imgVisible ? (
                    <img
                        src={imgUrl}
                        alt={`Photo of ${dog.name}`}
                        className="dog-card__img"

                        onError={() => setImgVisible(false)}
                    />
                ) : (
                    <div className="dog-card__img-placeholder">🐶</div>
                )}
            </div>

            {/* ── Body ────────────────────────────────────────── */}
            <div className="dog-card__body">
                <div className="dog-card__name">
                    {dog.name}
                    <span className="dog-card__age">
                        {dog.age} {dog.age === 1 ? 'yr' : 'yrs'}
                    </span>
                </div>

                {dog.description && (
                    <p className="dog-card__description">{dog.description}</p>
                )}

                {/* ── Footer ────────────────────────────────────────── */}
                <div className="dog-card__footer">
                    <span className="dog-card__owner">
                        by <span>{dog.owner_username}</span>
                    </span>

                    {isOwner && (
                        <div className="dog-card__actions">
                            <button
                                className="dog-card__action-btn dog-card__action-btn__edit"
                                title="Edit Dog"
                                onClick={() => onEdit(dog)}
                            >
                                Edit
                            </button>
                            <button
                                className="dog-card__action-btn dog-card__action-btn__delete"
                                title="Delete Dog"
                                onClick={() => onDelete(dog)}
                            >
                                Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </article>
    );
}