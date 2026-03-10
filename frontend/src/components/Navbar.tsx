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

interface NavbarProps {
    onUploadClick: () => void;  // called when "Upload Dog" button is pressed
}

export default function Navbar({ onUploadClick }: NavbarProps) {
    const { user, isAuthenticated, logoutUser } = useAuth();
    const navigate = useNavigate();

    function handleLogout() {
        logoutUser();
        navigate('/');
    }

    return (
        <nav className="navBar">
            <div className="container navbar__inner">
                {/* Logo / Home link */}
                <Link to="/" className="navbar__logo">
                    <span className="navbar__logo-paw">🐾</span>
                    DogBook
                </Link>

                <div className="navbar__right">
                    {isAuthenticated ? (
                        <>
                            {/* Show who is logged in */}
                            <span className="navbar__user">Hey, {user?.username}</span>

                            {/* Upload button when logged in */}
                            <button className="navbar__btn navbar__btn--amber" onClick={onUploadClick}>
                                + Upload Dog
                            </button>

                            {/* Logout */}
                            <button className="navbar__btn navbar__btn--ghost" onClick={handleLogout}>
                                Logout
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