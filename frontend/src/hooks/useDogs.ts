/**
 * hooks/useDogs.ts
 * 
 * Custom hook to reuse stateful component logic
 * 
 * useDogs - fetches a page of fogs from GET /dogs
 * useSearchDogs - fetches dogs by name from GET /dogs/name/:name
 */

import { useState, useEffect, useCallback } from "react";
import { getAllDogs, getDogsByName } from "../api/dogs";
import type { Dog } from "../types/models";

// ----- useDogs -----
interface UseDogsReturn {
    dogs: Dog[],
    loading: boolean;
    error: string | null;
    page: number;
    setPage: (p: number) => void;
    refresh: () => void;
    hasMore: boolean;
}

const PAGE_SIZE = 12;

export function useDogs():  UseDogsReturn {
    const [dogs, setDogs] = useState<Dog[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState<number>(0);
    const [hasMore, setHasMore] = useState(true);

    const fetchDogs = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const results = await getAllDogs({ offset: page, limit: PAGE_SIZE });
            setDogs(results);
            setHasMore(results.length === PAGE_SIZE);
        } catch {
            setError('Server error, failed to load dogs.');
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => { fetchDogs(); }, [fetchDogs]);

    return { dogs, loading, error, page, setPage, refresh: fetchDogs, hasMore };
}

// ----- useSearchDogs -----
interface UseSearchDogsReturn {
    results: Dog[];
    loading: boolean;
    error: string | null;
    search: (name: string) => void;
    query: string;
    clear: () => void;
}

export function useSearchDogs(): UseSearchDogsReturn {
    const [results, setResults] = useState<Dog[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [query, setQuery] = useState<string>('');

    const search = useCallback(async (name: string) => {
        if (!name.trim()) return;
        setQuery(name);
        setLoading(true);
        setError(null);

        try {
            const data = await getDogsByName(name);
            setResults(data);
        } catch {
            setError(`No dogs found that contain the name "${name}"`);
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const clear = useCallback(() => {
        setResults([]);
        setQuery('');
        setError(null);
    }, []);

    return { results, loading, error, search, query, clear };
}