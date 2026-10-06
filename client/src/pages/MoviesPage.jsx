import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import "./MoviesPage.css";

function MoviesPage() {
  const { token } = useAuth();

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [genreFilter, setGenreFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");

  const fetchMovies = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get("http://localhost:5000/api/movies", {
        params: {
          status: statusFilter !== "all" ? statusFilter : undefined,
          genre: genreFilter !== "all" ? genreFilter : undefined,
          year: yearFilter !== "all" ? yearFilter : undefined,
          limit: 200,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMovies(response.data.movies || []);
    } catch (err) {
      console.error("Error fetching movies:", err);
      setError(err.response?.data?.message || "Failed to load movies. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, genreFilter, yearFilter, token]);
useEffect(() => {
  // This effect intentionally loads movies when the filters or token change.
  // fetchMovies manages the loading, error, and movie state for that request.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  void fetchMovies();
}, [fetchMovies]);
  const years = Array.from(
    new Set(
      movies
        .map((movie) => movie.release_year ?? movie.releaseYear)
        .filter((year) => Number.isFinite(Number(year)))
        .map((year) => Number(year))
        .sort((a, b) => b - a)
    )
  ).slice(0, 12);

  const genres = Array.from(
    new Set(
      movies
        .map((movie) => movie.genre || movie.genres || "Unknown")
        .filter(Boolean)
    )
  ).sort();

  return (
    <div className="movies-container">
      <div className="movies-content">
        <div className="movies-page-header">
          <div>
            <span className="movies-kicker">MOVIE INTELLIGENCE</span>
            <h1>MOVIES DATABASE</h1>
            <p>Explore movie performance, ratings, and release data from the project dataset.</p>
          </div>

          <div className="movie-filters">
            <button type="button" className={statusFilter === "all" ? "active" : ""} onClick={() => setStatusFilter("all")}>ALL</button>
            <button type="button" className={statusFilter === "HIT" ? "active" : ""} onClick={() => setStatusFilter("HIT")}>HIT</button>
            <button type="button" className={statusFilter === "FLOP" ? "active" : ""} onClick={() => setStatusFilter("FLOP")}>FLOP</button>
          </div>
        </div>

        <div className="movie-filter-row">
          <label>
            Genre
            <select value={genreFilter} onChange={(event) => setGenreFilter(event.target.value)}>
              <option value="all">All</option>
              {genres.map((genre) => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </label>

          <label>
            Release year
            <select value={yearFilter} onChange={(event) => setYearFilter(event.target.value)}>
              <option value="all">All</option>
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </label>
        </div>

        {loading && (
          <div className="movies-loading">
            <div className="movies-loader"></div>
            <p>Loading movie intelligence...</p>
          </div>
        )}

        {error && (
          <div className="movies-error">
            <div>
              <strong>Unable to load movies</strong>
              <span>{error}</span>
            </div>
            <button type="button" onClick={fetchMovies}>TRY AGAIN</button>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="movies-toolbar">
              <div>
                <span className="movies-number">{movies.length}</span>
                <span className="movies-label">{statusFilter === "all" ? " movies available" : ` ${statusFilter.toLowerCase()} movies`}</span>
              </div>
              <span className="database-status"><i></i>DATABASE ONLINE</span>
            </div>

            {movies.length > 0 ? (
              <div className="movies-grid">
                {movies.map((movie) => {
                  const title = movie.title || "Untitled Movie";
                  const genre = movie.genre || movie.genres || "Unknown Genre";
                  const releaseYear = movie.release_year ?? movie.releaseYear ?? null;
                  const releaseDate = movie.release_date || movie.releaseDate;
                  const rating = movie.rating ?? 0;
                  const budget = Number(movie.budget || 0);
                  const revenue = Number(movie.revenue || 0);
                  const status = movie.status || "UPCOMING";

                  return (
                    <article key={movie._id || `${title}-${releaseYear}`} className="movie-card">
                      <div className="movie-poster">
                        {movie.poster ? (
                          <img
                            src={movie.poster}
                            alt={title}
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              if (e.currentTarget.nextElementSibling) {
                                e.currentTarget.nextElementSibling.style.display = "flex";
                              }
                            }}
                          />
                        ) : null}

                        <div className="movie-poster-placeholder" style={{ display: movie.poster ? "none" : "flex" }}>
                          <span>🎬</span>
                          <small>NO POSTER</small>
                        </div>

                        <div className="poster-overlay" />
                        {status && <span className="movie-status-badge">{status}</span>}
                        <span className="movie-view">VIEW DETAILS →</span>
                      </div>

                      <div className="movie-info">
                        <div className="movie-title-row">
                          <h3>{title}</h3>
                          <span className="movie-rating">★ {rating ? rating.toFixed(1) : "—"}</span>
                        </div>

                        <div className="movie-meta">
                          <span>{genre}</span>
                          {releaseYear && <><i></i><span>{releaseYear}</span></>}
                        </div>

                        <div className="movie-stats">
                          <span>Budget: {budget ? `$${budget.toLocaleString("en-US")}` : "—"}</span>
                          <span>Revenue: {revenue ? `$${revenue.toLocaleString("en-US")}` : "—"}</span>
                        </div>

                        <div className="movie-footer">
                          <span>{releaseDate ? new Date(releaseDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Release date unavailable"}</span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="no-movies">
                <div className="no-movies-icon">🎬</div>
                <h3>No movies found</h3>
                <p>There are no movies available for this filter.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default MoviesPage;