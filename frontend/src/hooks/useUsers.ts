/**
 * hooks/useUsers.ts
 * 
 * Custom hook to reuse stateful component logic
 * 
 * useUsers - fetches a page of users from GET /auth/
 * useSearchUsers - fetches users by name from GET /auth/user/:user
 */

import { useState, useEffect, useCallback } from "react";
import { getAllUsers, getUsersByUsername } from "../api/auth";
import type { User } from "../types/models";

// ----- useUsers -----
interface UseUsersReturn {
    users: User[];
    loading: boolean;
    error: string | null;
    page: number;
    setPage: (p: number) => void;
    refresh: () => void;
    hasMore: boolean;
}

const PAGE_SIZE = 12

export function useUsers(): UseUsersReturn {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState<number>(0);
    const [hasMore, setHasMore] = useState<boolean>(true);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const results = await getAllUsers({ offset: page, limit: PAGE_SIZE });
            setUsers(results);
            setHasMore(results.length === PAGE_SIZE);
        } catch {
            setError('Server error, failed to load users.');
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    return { users, loading, error, page, setPage, refresh: fetchUsers, hasMore };
}

interface UseSearchUsersReturn {
    results: User[];
    loading: boolean;
    error: string | null;
    search: (name: string) => void;
    query: string;
    clear: () => void;
}

export function useSearchUsers(): UseSearchUsersReturn {
    const [results, setResults] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [query, setQuery] = useState<string>('');

    const search = useCallback(async (username: string) => {
        if (!username.trim()) return;
        setQuery(username);
        setLoading(true);
        setError(null);

        try {
            const data = await getUsersByUsername(username);
            setResults(data);
        } catch {
            setError(`No users found that contain the username ${username}`);
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