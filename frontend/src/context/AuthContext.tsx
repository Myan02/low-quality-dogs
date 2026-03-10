/**
 * 
 * context/AuthContext.tsx
 * 
 * AuthContext gives all components access to auth states 
 * without passing props down manually. All componenets get
 * access to:
 * - useAuth()
 * - loginUser()
 * - logoutUser()
 * 
 */
import {
    createContext,
    useContext,
    useState,
    useEffect,
    type ReactNode
} from "react";
import type { User } from "../types/models";

// ----- CONTEXT SCHEMA -----
interface AuthContextValue {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    loginUser: (token: string, user: User) => void;
    logoutUser: () => void;
}

// ----- CREATE CONTEXT WITH EMPTY VALUES -----
const AuthContext = createContext<AuthContextValue>({
    user: null,
    token: null,
    isAuthenticated: false,
    loginUser: () => { },
    logoutUser: () => { },
});

// ----- PROVIDER COMPONENT -----
export function AuthProvider({ children }: { children: ReactNode }) {

    // first, try to restore session from local storage on first render
    const [token, setToken] = useState<string | null>(
        () => localStorage.getItem('access_token')
    );
    const [user, setUser] = useState<User | null>(() => {
        const stored = localStorage.getItem('user');
        return stored ? (JSON.parse(stored) as User) : null;
    });

    // when token or user change/update, keep localStorage in sync
    useEffect(() => {
        if (token) localStorage.setItem('access_token', token);
        else localStorage.removeItem('access_token');
    }, [token]);

    useEffect(() => {
        if (user) localStorage.setItem('user', JSON.stringify(user));
        else localStorage.removeItem('user');
    }, [user]);

    // Handle login and logout
    function loginUser(newToken: string, newUser: User) {
        setToken(newToken);
        setUser(newUser);
    }

    function logoutUser() {
        setToken(null);
        setUser(null);
    }

    return (
        <AuthContext.Provider
            value={{ user, token, isAuthenticated: !!token, loginUser, logoutUser }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// ----- CUSTOM HOOM, EASY USE IN COMPONENETS -----
export function useAuth() {
    return useContext(AuthContext);
}