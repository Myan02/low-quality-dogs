/**
 * pages/HomePage.tsx
 *
 * The main feed page. Shows all dogs in a paginated grid with a search bar.
 * Handles showing/hiding the Upload, Edit, and Delete modals.
 *
 * State flow:
 *  - useDogs() hook manages fetching + pagination
 *  - useSearchDogs() hook manages the name search
 *  - modal state is a discriminated union: null | {type, dog?}
 *    so TypeScript knows exactly which modal is open and what data it has.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import DogCard from '../components/DogCard';
import UploadDogModal from '../components/UploadDogModal';
import EditDogModal from '../components/EditDogModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

import { useDogs, useSearchDogs } from '../hooks/useDogs';
import { useAuth } from '../context/AuthContext';
import type { Dog } from '../types/models';

import '../styles/pages.css';
import '../styles/components.css';

// ── Modal state type ─────────────────────────────────────────────────────────
// This pattern means TypeScript will always ensure you have
// the right data for the right modal type.
type ModalState =
    | null
    | { type: 'upload' }
    | { type: 'edit'; dog: Dog }
    | { type: 'delete'; dog: Dog };

export default function HomePage() {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Dog feed + pagination
    const { dogs, loading, error, page, setPage, refresh, hasMore } = useDogs();
    const [refreshKey, setRefreshKey] = useState(0);

    // Search
    const { results: searchResults, loading: searchLoading, error: searchError,
        search, query, clear } = useSearchDogs();
    const [searchInput, setSearchInput] = useState('');

    // Which modal is open
    const [modal, setModal] = useState<ModalState>(null);

    // Search handlers
    function handleSearch() {
        if (searchInput.trim()) search(searchInput.trim());
    }

    function handleClear() {
        clear();
        setSearchInput('');
    }

    // Decide what to show in the grid: search results or the main feed
    const isSearching = !!query;
    const displayedDogs = isSearching ? searchResults : dogs;

    // Called when upload/edit/delete succeeds — refresh the dog list
    function handleSuccess() {
        refresh();
        setRefreshKey(k => k + 1)
    }

    // Clicking "Upload Dog" when not logged in redirects to login
    function handleUploadClick() {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        setModal({ type: 'upload' });
    }

    return (
        <main className="home-page">
            <div className="container">
                {/* ── Page header ───────────────────────────────── */}
                <div className="home-page__header">
                    <div>
                        <h1 className="home-page__title">
                            Welcome to <br /><em>Low Quality Dogs</em>
                        </h1>
                        <p className="home-page__subtitle">
                            Share a dog. See it in low quality. Or actually share any picture it's fine.
                        </p>
                    </div>
                    {isAuthenticated && (
                        <button
                            className="btn btn--primary"
                            onClick={handleUploadClick}
                            style={{ alignSelf: 'flex-start' }}
                        >
                            + Upload Your Dog
                        </button>
                    )}
                </div>

                {/* ── Search bar ────────────────────────────────── */}
                <div className="search-bar">
                    <input
                        className="search-bar__input"
                        type="text"
                        placeholder="Search by name…"
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
                                : <>Found <strong>{searchResults.length}</strong> dog{searchResults.length !== 1 ? 's' : ''} named "{query}"</>
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

                {/* ── Dog grid ──────────────────────────────────── */}
                {!loading && !searchLoading && displayedDogs.length > 0 && (
                    <div className="dog-grid">
                        {displayedDogs.map((dog) => (
                            <DogCard
                                key={`${dog.id}-${refreshKey}`}
                                dog={dog}
                                onEdit={(d) => setModal({ type: 'edit', dog: d })}
                                onDelete={(d) => setModal({ type: 'delete', dog: d })}
                            />
                        ))}
                    </div>
                )}

                {/* ── Empty state ────────────────────────────────── */}
                {!loading && !searchLoading && displayedDogs.length === 0 && !error && (
                    <div className="empty-state">
                        <div className="empty-state__icon">🐾</div>
                        <h2 className="empty-state__title">
                            {isSearching ? 'No dogs by that name' : 'No dogs yet!'}
                        </h2>
                        <p className="empty-state__text">
                            {isSearching
                                ? 'Try a different name'
                                : 'Be the first to share your dog.'}
                        </p>
                    </div>
                )}

                {/* ── Pagination (only shown when not searching) ─── */}
                {!isSearching && !loading && dogs.length >= 0 && (
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
            </div>

            {/* ── Modals ────────────────────────────────────────── */}
            {modal?.type === 'upload' && (
                <UploadDogModal
                    onClose={() => setModal(null)}
                    onSuccess={handleSuccess}
                />
            )}

            {modal?.type === 'edit' && (
                <EditDogModal
                    dog={modal.dog}
                    onClose={() => setModal(null)}
                    onSuccess={handleSuccess}
                />
            )}

            {modal?.type === 'delete' && (
                <DeleteConfirmModal
                    dog={modal.dog}
                    onClose={() => setModal(null)}
                    onSuccess={handleSuccess}
                />
            )}
        </main>
    );
}