import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

export default function Navbar({ user, onLogout }) {
  const location = useLocation();
  const path = location.pathname;

  // Helper function to determine if a link is the current page
  const isActive = (href) =>
    href === "/" ? path === "/" : path.startsWith(href);

  return (
    <header className="navbar">
      <div className="navbar-inner">
        
        {/* BRAND LOGO */}
        <Link to="/" className="navbar-brand">
          <span className="brand-name">FitForge</span>
        </Link>

        {/* MAIN NAVIGATION (Visible only when logged in) */}
        {user && (
          <nav className="navbar-links">
            <Link 
              className={`nav-link ${isActive("/") ? "active" : ""}`} 
              to="/"
            >
              Dashboard
            </Link>
            
            <Link 
              className={`nav-link ${isActive("/plans") ? "active" : ""}`} 
              to="/plans"
            >
              History
            </Link>

            <Link 
              className={`nav-link ${isActive("/workout-plan") ? "active" : ""}`} 
              to="/workout-plan"
            >
              Workout
            </Link>

            <Link 
              className={`nav-link ${isActive("/reminders") ? "active" : ""}`} 
              to="/reminders"
            >
              Meal Plan
            </Link>

            <Link 
              className={`nav-link ${isActive("/progress") ? "active" : ""}`} 
              to="/progress"
            >
              Stats
            </Link>

            <Link 
              className={`nav-link ${isActive("/chat") ? "active" : ""}`} 
              to="/chat"
            >
              AI Coach
            </Link>

            {/* ADDED PROFILE TO MAIN NAV FOR EASY ACCESS */}
            <Link 
              className={`nav-link ${isActive("/profile") ? "active" : ""}`} 
              to="/profile"
            >
              Profile
            </Link>
          </nav>
        )}

        {/* USER ACTIONS (Right side) */}
        <div className="navbar-actions">
          {!user ? (
            <div className="auth-buttons">
              <Link className="nav-link" to="/login">Login</Link>
              <Link className="btn-signup" to="/register">Sign Up</Link>
            </div>
          ) : (
            <div className="user-menu">
              <Link 
                to="/profile" 
                className={`profile-link ${isActive("/profile") ? "active" : ""}`}
              >
                <span className="user-avatar">👤</span>
                <span className="user-first-name">{user.name ? user.name.split(' ')[0] : 'User'}</span>
              </Link>
              <button className="btn-logout" onClick={onLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}