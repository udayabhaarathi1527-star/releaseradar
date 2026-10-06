import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./SettingsPage.css";

function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("account");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="settings-container">
      {/* Header */}
      <div className="settings-header">
        <div className="header-left">
          <h1 className="header-logo">
            RELEASE<span>RADAR</span>
          </h1>
        </div>
      </div>

      {/* Settings Content */}
      <div className="settings-content">
        <div className="settings-header-section">
          <h2>SETTINGS</h2>
          <p>Manage your account and preferences</p>
        </div>

        {/* Tabs */}
        <div className="settings-tabs">
          <button
            className={`tab ${activeTab === "account" ? "active" : ""}`}
            onClick={() => setActiveTab("account")}
          >
            ACCOUNT
          </button>
          <button
            className={`tab ${activeTab === "preferences" ? "active" : ""}`}
            onClick={() => setActiveTab("preferences")}
          >
            PREFERENCES
          </button>
          <button
            className={`tab ${activeTab === "about" ? "active" : ""}`}
            onClick={() => setActiveTab("about")}
          >
            ABOUT
          </button>
        </div>

        {/* Tab Content */}
        <div className="settings-sections">
          {/* Account Tab */}
          {activeTab === "account" && (
            <div className="settings-section">
              <h3>ACCOUNT INFORMATION</h3>

              <div className="settings-group">
                <label>Full Name</label>
                <div className="info-display">{user?.name || "User"}</div>
              </div>

              <div className="settings-group">
                <label>Email</label>
                <div className="info-display">{user?.email || "user@example.com"}</div>
              </div>

              <div className="settings-group">
                <label>Account Created</label>
                <div className="info-display">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "N/A"}
                </div>
              </div>

              <div className="settings-actions">
                <button className="secondary-btn">CHANGE PASSWORD</button>
                <button className="danger-btn" onClick={handleLogout}>
                  LOGOUT
                </button>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === "preferences" && (
            <div className="settings-section">
              <h3>PREFERENCES</h3>

              <div className="settings-group">
                <label>Theme</label>
                <div className="preference-options">
                  <button className="pref-option active">DARK</button>
                  <button className="pref-option">LIGHT</button>
                </div>
              </div>

              <div className="settings-group">
                <label>Notifications</label>
                <div className="toggle-switch">
                  <input type="checkbox" id="notifications" defaultChecked />
                  <label htmlFor="notifications"></label>
                </div>
              </div>

              <div className="settings-group">
                <label>Data Privacy</label>
                <p className="preference-text">
                  Your prediction data is stored securely and only visible to you.
                </p>
              </div>

              <div className="settings-actions">
                <button className="primary-btn">SAVE PREFERENCES</button>
              </div>
            </div>
          )}

          {/* About Tab */}
          {activeTab === "about" && (
            <div className="settings-section">
              <h3>ABOUT RELEASERADAR</h3>

              <div className="about-content">
                <div className="about-item">
                  <h4>Version</h4>
                  <p>1.0.0</p>
                </div>

                <div className="about-item">
                  <h4>AI Model</h4>
                  <p>Random Forest (Scikit-learn)</p>
                </div>

                <div className="about-item">
                  <h4>Model Accuracy</h4>
                  <p>63.47%</p>
                </div>

                <div className="about-item">
                  <h4>Features Tracked</h4>
                  <p>
                    Budget, Marketing Budget, Rating, Runtime, Star Power,
                    Competition, Genre, Release Month, Production Company,
                    Language
                  </p>
                </div>

                <div className="about-item">
                  <h4>Description</h4>
                  <p>
                    ReleaseRadar is an AI-powered movie intelligence platform
                    that helps filmmakers, producers, and analysts predict the
                    success potential of upcoming films using advanced machine
                    learning models.
                  </p>
                </div>
              </div>

              <div className="settings-actions">
                <button className="secondary-btn" onClick={() => navigate("/dashboard")}>
                  BACK TO DASHBOARD
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
