/**
 * components/DogCard.tsx
 * 
 * A single contained card with a dog's image, name, age, description, and owner
 * 
 * if the user is logged in (or a superuser), they also get access to edit and delete
 */

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

    // prepend a slash so vite's proxy can handle it
    return '/' + imagePath.replace(/\\/g, '/');
}

export default function DogCard({ dog, onEdit, onDelete }: DogCardProps) {
    const { user, isAuthenticated } = useAuth();

    const isOwner = isAuthenticated && (user?.id === dog.owner_id || user?.is_superuser);
    const imgUrl = resolveImageUrl(dog.image_url);

    return (
        <article className="dog-card">
            {/* -- IMAGE -- */}
            <div className="dog-card__img-wrap">
                {imgUrl ? (
                    <img
                        src={imgUrl}
                        alt={`Photo of ${dog.name}`}
                        className="dog-card__img"

                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                        }}
                    />
                ) : (
                    <div className="dog-card__img-placeholder">🐶</div>
                )}
            </div>

            {/* -- BODY -- */}
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

                {/* -- FOOTER -- */}
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
                                ✎
                            </button>
                            <button
                                className="dog-card__action-btn dog-card__action-btn__delete"
                                title="Delete Dog"
                                onClick={() => onDelete(dog)}
                            >
                                ✕
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </article>
    );
}