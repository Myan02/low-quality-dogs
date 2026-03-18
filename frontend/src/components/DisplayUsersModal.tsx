/**
 * components/DeleteUsersModal.tsx
 * 
 * A modal dialog for displaying all users; used for easy deletion and query.
 * Only accessable with a logged in superuser
 */

import { useState } from "react";
import { useUsers, useSearchUsers } from "../hooks/useUsers";
import DeleteConfirmModal from "./DeleteConfirmModal";
import UserCard from "./UserCard";
import type { User } from "../types/models";
import "../styles/components.css";

// type of model dialog to display, allows for scalability 
// ie. if we want to edit users, we can add an edit modal
type ModalState =
    | null
    | { type: 'delete'; user: User };

interface Props {
    onClose: () => void;
    onSuccess: () => void;
}

export default function DisplayUsersModal({ onClose }: Props) {

    /* ── States ────────────────────────────────── */
    const [modal, setModal] = useState<ModalState>(null);

    // User feed + pagination
    const { users, loading, error, page, setPage, refresh, hasMore } = useUsers()
    const [refreshKey, setRefreshKey] = useState(0);

    // Search bar state
    const { results: searchResults, loading: searchLoading, error: searchError,
        search, query, clear } = useSearchUsers();
    const [searchInput, setSearchInput] = useState<string>('');


    /* ── Event Handelers ────────────────────────────────── */
    function handleSearch() {   // get value from search bar
        if (searchInput.trim()) search(searchInput.trim());
    }

    function handleClear() {    // clear the search bar
        clear();
        setSearchInput('');
    }

    // Decide what to show in the grid: search results or the main feed
    const isSearching = !!query;
    const displayedUsers = isSearching ? searchResults : users;

    function handleSuccess() {
        refresh();
        setRefreshKey(k => k + 1)
    }

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal" role="dialog" aria-modal="true" aria-labelledby="delete-users-title">

                {/* ── Heading ───────────────────────────────── */}
                <button className="modal__close" onClick={onClose} aria-label="Close">✕</button>
                <h2 className="modal__title" id="delete-users-title">Delete Users</h2>

                {/* ── Search bar ────────────────────────────────── */}
                <div className="search-bar">
                    <input
                        className="search-bar__input"
                        type="text"
                        placeholder="Search user by name…"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}

                        // Allow pressing Enter to search
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button className="search-bar__btn" onClick={handleSearch}>
                        Search
                    </button>
                    {isSearching && (
                        <button className="search-bar__clear" onClick={handleClear}>
                            Clear
                        </button>
                    )}
                </div>


                {/* ── Search results label ──────────────────────── */}
                {isSearching && (
                    <p className="search-results-label">
                        {searchLoading
                            ? 'Searching…'
                            : searchError
                                ? searchError
                                : <>Found <strong>{searchResults.length}</strong> user{searchResults.length !== 1 ? 's' : ''} named "{query}"</>
                        }
                    </p>
                )}


                {/* ── Error state ────────────────────────────────── */}
                {error && !isSearching && (
                    <div className="alert alert--error" style={{ marginBottom: 'var(--space-5)' }}>
                        ⚠ {error}
                    </div>
                )}

                {/* ── Loading spinner ────────────────────────────── */}
                {(loading || searchLoading) && (
                    <div className="spinner-wrap">
                        <span className="spinner spinner--lg" />
                    </div>
                )}

                {/* ── User rows ──────────────────────────────────── */}
                {!loading && !searchLoading && displayedUsers.length > 0 && (
                    <div className="user-rows">
                        {displayedUsers.map((user) => (
                            <UserCard
                                key={`${user.id}-${refreshKey}`}
                                user={user}
                                onDelete={(u) => setModal({ type: 'delete', user: u })}
                            />
                        ))}
                    </div>
                )}


                {/* ── Empty state ────────────────────────────────── */}
                {!loading && !searchLoading && displayedUsers.length === 0 && !error && (
                    <div className="empty-state">
                        <div className="empty-state__icon">🐾</div>
                        <h2 className="empty-state__title">
                            {isSearching ? 'No users by that name' : 'No users have signed up yet!'}
                        </h2>
                        <p className="empty-state__text">
                            {isSearching
                                ? 'Try a different name'
                                : 'Make an account or wait for others.'}
                        </p>
                    </div>
                )}

                {/* ── Pagination (only shown when not searching) ─── */}
                {!isSearching && !loading && users.length >= 0 && (
                    <div className="pagination">
                        <button
                            className="btn btn--secondary"
                            onClick={() => setPage(Math.max(0, page - 1))}
                            disabled={page === 0}
                        >
                            ← Previous
                        </button>
                        <span className="pagination__info">Page {page + 1}</span>
                        <button
                            className="btn btn--secondary"
                            onClick={() => setPage(page + 1)}
                            disabled={!hasMore}
                        >
                            Next →
                        </button>
                    </div>
                )}

                {/* ── Modals ────────────────────────────────────────── */}
                {modal?.type === 'delete' && (
                    <DeleteConfirmModal
                        user={modal.user}
                        kind="User"
                        onClose={() => setModal(null)}
                        onSuccess={handleSuccess}
                    />
                )}

            </div>
        </div >
    );
}