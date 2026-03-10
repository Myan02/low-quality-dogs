import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { AxiosError } from 'axios';
import type { ApiError, User } from '../types/models';
import '../styles/pages.css';
import '../styles/components.css';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { loginUser } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Step 1: get the JWT
            const tokenData = await login({ username, password });

            // Step 2: store token in localStorage immediately so the next
            // request has it available in the Axios interceptor
            localStorage.setItem('access_token', tokenData.access_token);

            // Step 3: fetch the real user record (requires the token just stored)
            // This gives us the correct id and is_superuser flag
            const me = await apiClient.get<User>('/auth/me');

            // Step 4: hand off to context (also writes to localStorage)
            loginUser(tokenData.access_token, me.data);

            navigate('/');
        } catch (err) {
            localStorage.removeItem('access_token');
            const axiosErr = err as AxiosError<ApiError>;
            setError(axiosErr.response?.data?.detail ?? 'Login failed. Check your credentials.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <p className="auth-card__eyebrow">Welcome back</p>
                <h1 className="auth-card__title">Sign in to DogBook</h1>

                <form className="form" onSubmit={handleSubmit}>
                    {error && <div className="alert alert--error">⚠ {error}</div>}

                    <div className="form__group">
                        <label className="form__label" htmlFor="username">Username</label>
                        <input
                            id="username"
                            className="form__input"
                            type="text"
                            placeholder="your_username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            autoComplete="username"
                            autoFocus
                        />
                    </div>

                    <div className="form__group">
                        <label className="form__label" htmlFor="password">Password</label>
                        <input
                            id="password"
                            className="form__input"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn--primary btn--full"
                        style={{ marginTop: 'var(--space-2)' }}
                        disabled={loading}
                    >
                        {loading ? <span className="spinner" /> : 'Log In'}
                    </button>
                </form>

                <p className="auth-card__footer">
                    Don't have an account?{' '}
                    <Link to="/signup">Sign up</Link>
                </p>
            </div>
        </div>
    );
}