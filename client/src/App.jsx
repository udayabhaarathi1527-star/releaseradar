import { useState } from "react";
import "./App.css";

function App() {
  const [activePage, setActivePage] = useState("Dashboard");

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">R</div>
          <div>
            <h2>ReleaseRadar</h2>
            <span>Movie Intelligence</span>
          </div>
        </div>

        <nav className="nav">
          <button
            className={activePage === "Dashboard" ? "nav-item active" : "nav-item"}
            onClick={() => setActivePage("Dashboard")}
          >
            <span>⌂</span>
            Dashboard
          </button>

          <button
            className={activePage === "Movies" ? "nav-item active" : "nav-item"}
            onClick={() => setActivePage("Movies")}
          >
            <span>🎬</span>
            Movies
          </button>

          <button
            className={activePage === "Prediction" ? "nav-item active" : "nav-item"}
            onClick={() => setActivePage("Prediction")}
          >
            <span>🤖</span>
            AI Prediction
          </button>

          <button
            className={activePage === "Search" ? "nav-item active" : "nav-item"}
            onClick={() => setActivePage("Search")}
          >
            <span>⌕</span>
            Search
          </button>
        </nav>

        <div className="sidebar-bottom">
          <button className="nav-item">
            <span>⚙</span>
            Settings
          </button>

          <div className="user-card">
            <div className="avatar">U</div>
            <div>
              <strong>User</strong>
              <span>Movie Analyst</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">WELCOME BACK</p>
            <h1>{activePage}</h1>
          </div>

          <div className="top-actions">
            <div className="search-box">
              <span>⌕</span>
              <input placeholder="Search movies..." />
            </div>

            <button className="notification">🔔</button>
          </div>
        </header>

        {activePage === "Dashboard" && (
          <>
            {/* Hero */}
            <section className="hero">
              <div className="hero-content">
                <span className="badge">AI-POWERED MOVIE INTELLIGENCE</span>

                <h2>
                  Know the movie
                  <br />
                  <span>before it releases.</span>
                </h2>

                <p>
                  Track upcoming releases, explore movie data and predict
                  potential success using machine learning.
                </p>

                <button
                  className="primary-button"
                  onClick={() => setActivePage("Prediction")}
                >
                  Try AI Prediction →
                </button>
              </div>

              <div className="hero-visual">
                <div className="radar">
                  <div className="radar-ring ring-one"></div>
                  <div className="radar-ring ring-two"></div>
                  <div className="radar-ring ring-three"></div>
                  <div className="radar-line"></div>
                  <div className="radar-dot dot-one"></div>
                  <div className="radar-dot dot-two"></div>
                  <div className="radar-dot dot-three"></div>
                </div>
              </div>
            </section>

            {/* Stats */}
            <section className="stats">
              <div className="stat-card">
                <span className="stat-icon">🎬</span>
                <div>
                  <p>Movies Tracked</p>
                  <h3>1,248</h3>
                </div>
                <small>+12.5%</small>
              </div>

              <div className="stat-card">
                <span className="stat-icon">📅</span>
                <div>
                  <p>Upcoming Releases</p>
                  <h3>86</h3>
                </div>
                <small>+8.2%</small>
              </div>

              <div className="stat-card">
                <span className="stat-icon">🤖</span>
                <div>
                  <p>Predictions Made</p>
                  <h3>432</h3>
                </div>
                <small>+18.7%</small>
              </div>

              <div className="stat-card">
                <span className="stat-icon">✓</span>
                <div>
                  <p>Model Accuracy</p>
                  <h3>79%</h3>
                </div>
                <small>Live</small>
              </div>
            </section>

            {/* Content */}
            <section className="content-grid">
              <div className="panel">
                <div className="panel-header">
                  <div>
                    <p className="eyebrow">LATEST</p>
                    <h2>Recently Added Movies</h2>
                  </div>

                  <button onClick={() => setActivePage("Movies")}>
                    View all →
                  </button>
                </div>

                <div className="movie-list">
                  <Movie
                    title="Inception"
                    genre="Sci-Fi"
                    rating="8.8"
                    platform="Netflix"
                  />

                  <Movie
                    title="Interstellar"
                    genre="Sci-Fi"
                    rating="8.7"
                    platform="Prime Video"
                  />

                  <Movie
                    title="The Dark Knight"
                    genre="Action"
                    rating="9.0"
                    platform="HBO"
                  />
                </div>
              </div>

              <div className="panel prediction-panel">
                <div className="panel-header">
                  <div>
                    <p className="eyebrow">MACHINE LEARNING</p>
                    <h2>AI Prediction</h2>
                  </div>
                  <span className="ai-icon">✦</span>
                </div>

                <p>
                  Predict whether a movie is likely to succeed based on its
                  budget, rating, runtime, genre and other factors.
                </p>

                <div className="prediction-score">
                  <div className="score-circle">
                    <strong>79%</strong>
                    <span>Success</span>
                  </div>

                  <div>
                    <span className="success-label">HIGH POTENTIAL</span>
                    <p>Example prediction</p>
                  </div>
                </div>

                <button
                  className="primary-button full"
                  onClick={() => setActivePage("Prediction")}
                >
                  Make a Prediction
                </button>
              </div>
            </section>
          </>
        )}

        {activePage !== "Dashboard" && (
          <section className="placeholder">
            <div className="placeholder-icon">✦</div>
            <h2>{activePage}</h2>
            <p>
              This section is ready for the next development step.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}

function Movie({ title, genre, rating, platform }) {
  return (
    <div className="movie-row">
      <div className="movie-poster">
        {title.charAt(0)}
      </div>

      <div className="movie-info">
        <h3>{title}</h3>
        <span>{genre}</span>
      </div>

      <div className="movie-rating">
        ★ {rating}
      </div>

      <div className="platform">
        {platform}
      </div>
    </div>
  );
}

export default App;