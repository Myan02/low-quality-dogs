/**
 * components/UserCard.tsx
 * 
 * A single row with a user's id, username, and is_superuser value
 * 
 * Can only access as admin superuser through the display users button
 */

import type { User } from "../types/models";
import "../styles/UserCard.css";

interface UserCardProps {
    user: User;
    onDelete: (user: User) => void;
}

export default function UserCard({ user, onDelete }: UserCardProps) {

    return (
        <article className="user-card">
            <span className="user-card__id">{user.id}</span>
            <span className="user-card__username">{user.username}</span>
            <span className="user_card__is-superuser">{user.is_superuser ? "Superuser" : "Not Superuser"}</span>

            <button
                className="user-card__action-btn user-card__action-btn__delete"
                title="Delete User"
                onClick={() => onDelete(user)}
            >
                ✕
            </button>
        </article>
    );
}