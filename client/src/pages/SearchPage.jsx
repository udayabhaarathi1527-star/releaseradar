import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import "./SearchPage.css";

function SearchPage() {
  const { logout, user, token } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setError("");
    setHasSearched(true);

    try {
      const response = await axios.get(
        `http://localhost:5000/api/movies/search?q=${encodeURIComponent(
          searchQuery
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setResults(response.data);
    } catch (err) {
      console.error("Search error:", err);
      setError("Failed to search movies. Please try again.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="search-container">
      {/* Header */}
      <div className="search-header">
        <div className="header-left">
          <h1 className="header-logo">
            RELEASE<span>RADAR</span>
          </h1>
        </div>
        <div className="header-nav">
          <button
            className="nav-btn"
            onClick={() => navigate("/dashboard")}
          >
            DASHBOARD
          </button>
          <button
            className="nav-btn"
            onClick={() => navigate("/movies")}
          >
            MOVIES
          </button>
          <button
            className="nav-btn"
            onClick={() => navigate("/prediction")}
          >
            PREDICT
          </button>
          <button
            className="nav-btn"
            onClick={() => navigate("/history")}
          >
            HISTORY
          </button>
        </div>
        <div className="header-right">
          <button
            className="profile-btn"
            onClick={() => navigate("/settings")}
          >
            <span className="profile-avatar">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </span>
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            LOGOUT
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="search-content">
        <div className="search-hero">
          <h2>SEARCH MOVIES</h2>
          <p>Find and analyze movies from our database</p>

          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-wrapper">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, genre, actor..."
                className="search-input"
              />
              <button type="submit" className="search-button">
                SEARCH
              </button>
            </div>
          </form>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading && <p className="loading-text">Searching...</p>}

        {hasSearched && !loading && (
          <div className="search-results">
            <p className="results-info">
              Found <span>{results.length}</span> result
              {results.length !== 1 ? "s" : ""} for "{searchQuery}"
            </p>

            {results.length > 0 ? (
              <div className="results-grid">
                {results.map((movie) => (
                  <div
                    key={movie._id}
                    className="result-card"
                    onClick={() => navigate(`/movies/${movie._id}`)}
                  >
                    <div className="result-poster">
                      <img
                        src={movie.poster || "https://via.placeholder.com/200x300"}
                        alt={movie.title}
                      />
                      <div className="result-status">{movie.status}</div>
                    </div>
                    <div className="result-info">
                      <h3>{movie.title}</h3>
                      <p className="result-genre">{movie.genre}</p>
                      <p className="result-rating">⭐ {movie.rating}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-results">
                <p className="no-results-icon">🔍</p>
                <p className="no-results-text">
                  No movies found matching your search.
                </p>
              </div>
            )}
          </div>
        )}

        {!hasSearched && (
          <div className="search-empty">
            <p className="empty-icon">🎬</p>
            <p className="empty-text">Enter a search query to find movies</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchPage;
