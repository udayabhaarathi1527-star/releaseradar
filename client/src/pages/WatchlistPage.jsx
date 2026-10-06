import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./WatchlistPage.css";

function WatchlistPage() {
  const navigate = useNavigate();
const [watchlist, setWatchlist] = useState(() => {
  try {
    const savedWatchlist =
      localStorage.getItem("releaseradar_watchlist") || "[]";

    return JSON.parse(savedWatchlist);
  } catch (error) {
    console.error("Error loading watchlist:", error);
    return [];
  }
});

  const removeFromWatchlist = (movieId) => {
    const updated = watchlist.filter(
      (movie) => movie._id !== movieId
    );

    setWatchlist(updated);

    localStorage.setItem(
      "releaseradar_watchlist",
      JSON.stringify(updated)
    );
  };

  return (
    <div className="watchlist-container">
      {/* HEADER IS PROVIDED BY AppLayout */}

      <div className="watchlist-content">
        <div className="content-header">
          <div>
            <div className="page-kicker">MOVIE INTELLIGENCE</div>

            <h2>MY WATCHLIST</h2>

            <p>
              Movies you want to watch and analyze.
            </p>
          </div>

          <div className="watchlist-count">
            {watchlist.length}{" "}
            {watchlist.length === 1 ? "movie" : "movies"}
          </div>
        </div>

        {watchlist.length > 0 ? (
          <div className="watchlist-grid">
            {watchlist.map((movie) => (
              <div
                key={movie._id}
                className="watchlist-card"
              >
                <div className="watchlist-poster">
                  <img
                    src={
                      movie.poster ||
                      "https://via.placeholder.com/200x300"
                    }
                    alt={movie.title || "Movie"}
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://via.placeholder.com/200x300";
                    }}
                  />

                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() =>
                      removeFromWatchlist(movie._id)
                    }
                    title="Remove from watchlist"
                  >
                    ✕
                  </button>
                </div>

                <div className="watchlist-info">
                  <h3>
                    {movie.title || "Untitled Movie"}
                  </h3>

                  {movie.genre && (
                    <p className="watchlist-genre">
                      {movie.genre}
                    </p>
                  )}

                  {movie.rating !== undefined && (
                    <p className="watchlist-rating">
                      ⭐ {movie.rating}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-watchlist">
            <p className="empty-icon">📋</p>

            <h3>Your watchlist is empty</h3>

            <p className="empty-text">
              Add movies from the Movies database to
              keep them here for later analysis.
            </p>

            <button
              type="button"
              className="start-btn"
              onClick={() => navigate("/movies")}
            >
              EXPLORE MOVIES
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default WatchlistPage;