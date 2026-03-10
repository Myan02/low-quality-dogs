/**
 * pages/LoginPage.tsx
 *
 * The login form. On success:
 *  1. We get back a JWT token from the backend
 *  2. We store it via the loginUser() context function
 *  3. We redirect the user to the home page
 *
 * Note: We don't get the user object back from /auth/login — just the token.
 * So we create a minimal User object from the username the user typed.
 * (A more complete app might call GET /users/me to get the full user.)
 */

import { useState, type SubmitEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import type { AxiosError } from 'axios';
import type { ApiError } from '../types/models';
import '../styles/pages.css';
import '../styles/components.css';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { loginUser } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const tokenData = await login({ username, password });

            // Store the token + a user object
            // We use the typed username since the backend doesn't return user info on login
            loginUser(tokenData.access_token, {
                id: 0,
                username,
                is_superuser: false,
            });

            navigate('/');
        } catch (err) {
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