import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '../types/models';

interface AuthContextValue {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    loginUser: (token: string, user: User) => void;
    logoutUser: () => void;
}

const AuthContext = createContext<AuthContextValue>({
    user: null,
    token: null,
    isAuthenticated: false,
    loginUser: () => { },
    logoutUser: () => { },
});

export function AuthProvider({ children }: { children: ReactNode }) {
    // Restore session from localStorage on first render
    const [token, setToken] = useState<string | null>(
        () => localStorage.getItem('access_token')
    );
    const [user, setUser] = useState<User | null>(() => {
        const stored = localStorage.getItem('user');
        return stored ? (JSON.parse(stored) as User) : null;
    });

    function loginUser(newToken: string, newUser: User) {
        // Write to localStorage SYNCHRONOUSLY before setting React state.
        // The Axios interceptor reads from localStorage on every request —
        // if we rely on useEffect to sync it, the effect runs after the next
        // render and the token won't be there in time for an immediate request.
        localStorage.setItem('access_token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
    }

    function logoutUser() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    }

    useEffect(() => {
        window.addEventListener('auth:logout', logoutUser);
        return () => window.removeEventListener('auth:logout', logoutUser);
    }, []);

    return (
        <AuthContext.Provider
            value={{ user, token, isAuthenticated: !!token, loginUser, logoutUser }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}