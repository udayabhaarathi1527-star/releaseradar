import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import "./AppLayout.css";

function AppLayout() {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const handleLogout = () => {
    setAccountMenuOpen(false);
    logout();
    navigate("/login", { replace: true });
  };

  const navLinks = [
    ["Home", "/", true],
    ["AI Film Analyzer", "/ai-analyzer"],
    ["Marketplace", "/marketplace"],
    ["Opportunities", "/opportunities"],
    ["About", "/about"],
  ];

  return (
    <div className="app-layout">
      {/* STATIC TOP NAVIGATION */}
      <header className="app-header">
        <div className="app-header-inner">

          {/* LOGO */}
          <button className="app-logo" onClick={() => navigate("/")} aria-label="ReleaseRadar home">
            RELEASE<span>RADAR</span>
          </button>

          <nav className={`app-navigation ${mobileMenuOpen ? "open" : ""}`} aria-label="Primary navigation">
            {navLinks.map(([label, path, exact]) => (
              <NavLink
                key={path}
                to={path}
                end={exact}
                className={({ isActive }) => `nav-link${isActive || (path === "/ai-analyzer" && location.pathname === "/prediction") ? " active" : ""}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="app-header-actions">
            {isAuthenticated ? (
              <div className="account-menu-wrap">
                <button
                  className="profile-button"
                  onClick={() => setAccountMenuOpen((open) => !open)}
                  aria-label="Open account menu"
                  aria-expanded={accountMenuOpen}
                >
                  <span className="profile-avatar">{user?.name?.charAt(0)?.toUpperCase() || "U"}</span>
                </button>
                {accountMenuOpen && (
                  <div className="account-menu">
                    <span className="account-menu-name">{user?.name || "Your account"}</span>
                    <NavLink to="/history" onClick={() => setAccountMenuOpen(false)}>Prediction history</NavLink>
                    <NavLink to="/settings" onClick={() => setAccountMenuOpen(false)}>Settings</NavLink>
                    <button onClick={handleLogout}>Log out</button>
                  </div>
                )}
              </div>
            ) : (
              <button className="header-sign-in" onClick={() => navigate("/login")}>
                Sign in
              </button>
            )}

            <button
              className={`mobile-menu-toggle ${mobileMenuOpen ? "open" : ""}`}
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
            >
              <span></span><span></span>
            </button>
          </div>
        </div>
      </header>

      {/* ONLY THIS PART CHANGES */}
      <main className="app-page">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;