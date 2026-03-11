/**
 * components/Navbar.tsx
 * 
 * Top nav bar. Reads auth state to decided
 * whether to render login/signup buttons or user's name + logout
 * 
 * Use <Link> from react-router-dom for client-side navigation
 */

import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import '../styles/Navbar.css';


export default function Navbar() {
    const { user, isAuthenticated, logoutUser } = useAuth();
    const navigate = useNavigate();

    function handleLogout() {
        logoutUser();
        navigate('/');
    }

    return (
        <nav className="navbar">
            <div className="container navbar__inner">
                {/* Logo / Home link */}
                <Link to="/" className="navbar__logo">
                    <span className="navbar__logo-paw">🐶</span>
                    Low Quality Dogs
                </Link>

                <div className="navbar__right">
                    {isAuthenticated ? (
                        <>
                            {/* Show who is logged in */}
                            <span className="navbar__user">Welcome back {user?.username}!</span>

                            {/* Logout */}
                            <button className="navbar__btn navbar__btn--ghost" onClick={handleLogout}>
                                Log out
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="navbar__btn navbar__btn--ghost">
                                Log in
                            </Link>
                            <Link to="/signup" className="navbar__btn navbar__btn--primary">
                                Sign up
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}