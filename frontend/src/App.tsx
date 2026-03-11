/**
 * App.tsx
 *
 * The root component. This sets up:
 *  1. React Router — maps URL paths to page components
 *  2. The Navbar — which needs to be on every page
 *  3. The upload modal state — the Navbar's "Upload Dog" button
 *     is on every page, but the modal is rendered here so it works
 *     even when navigating.
 *
 * react-router-dom's <Routes> and <Route> work like a switch statement:
 * React renders the first <Route> whose path matches the current URL.
 */

import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import UploadDogModal from './components/UploadDogModal';
import { useAuth } from './context/AuthContext';

import './styles/globals.css';

export default function App() {
  const { isAuthenticated } = useAuth();
  const [showUpload, setShowUpload] = useState(false);

  return (
    <>
      {/* Navbar appears on every page */}
      <Navbar />

      {/* Page content — swaps based on the URL */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        {/* Catch-all: redirect unknown URLs back to home */}
        <Route path="*" element={<HomePage />} />
      </Routes>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer__inner">
          <span>🐾 Low Quality Dogs — Thanks for sharing!</span>
          <span>© Michael Baburyan 2026</span>
          <span>Built with FastAPI + React</span>
        </div>
      </footer>

      {/* Upload modal — triggered from the Navbar */}
      {showUpload && isAuthenticated && (
        <UploadDogModal
          onClose={() => setShowUpload(false)}
          onSuccess={() => {
            setShowUpload(false);
            // Trigger a page refresh by navigating to home
            window.location.href = '/';
          }}
        />
      )}
    </>
  );
}