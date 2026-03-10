/**
 * pages/SignupPage.tsx
 *
 * The signup/registration form. After creating an account,
 * we automatically log the user in by calling the login API
 * so they don't have to sign in manually right after registering.
 */

import { useState, type SubmitEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup, login } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import type { AxiosError } from 'axios';
import type { ApiError } from '../types/models';
import '../styles/pages.css';
import '../styles/components.css';

export default function SignupPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { loginUser } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault();
        setError(null);

        // Client-side password confirmation check
        if (password !== confirm) {
            setError('Passwords do not match.');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        setLoading(true);

        try {
            // 1. Create the account
            await signup({ username, password });

            // 2. Auto-login with the new credentials
            const tokenData = await login({ username, password });
            loginUser(tokenData.access_token, {
                id: 0,
                username,
                is_superuser: false,
            });

            navigate('/');
        } catch (err) {
            const axiosErr = err as AxiosError<ApiError>;
            setError(axiosErr.response?.data?.detail ?? 'Signup failed. Try a different username.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <p className="auth-card__eyebrow">Join DogBook</p>
                <h1 className="auth-card__title">Create your account</h1>

                <form className="form" onSubmit={handleSubmit}>
                    {error && <div className="alert alert--error">⚠ {error}</div>}

                    <div className="form__group">
                        <label className="form__label" htmlFor="signup-username">Username</label>
                        <input
                            id="signup-username"
                            className="form__input"
                            type="text"
                            placeholder="dog_lover_99"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            minLength={3}
                            maxLength={30}
                            autoComplete="username"
                            autoFocus
                        />
                    </div>

                    <div className="form__group">
                        <label className="form__label" htmlFor="signup-password">Password</label>
                        <input
                            id="signup-password"
                            className="form__input"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="new-password"
                        />
                    </div>

                    <div className="form__group">
                        <label className="form__label" htmlFor="signup-confirm">Confirm Password</label>
                        <input
                            id="signup-confirm"
                            className="form__input"
                            type="password"
                            placeholder="••••••••"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            required
                            autoComplete="new-password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn--primary btn--full"
                        style={{ marginTop: 'var(--space-2)' }}
                        disabled={loading}
                    >
                        {loading ? <span className="spinner" /> : 'Create Account 🐾'}
                    </button>
                </form>

                <p className="auth-card__footer">
                    Already have an account?{' '}
                    <Link to="/login">Log in</Link>
                </p>
            </div>
        </div>
    );
}