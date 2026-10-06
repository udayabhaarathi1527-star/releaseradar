import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import {
  formatProbabilityValue,
  normalizeProbabilityValue,
} from "../utils/predictionInsights";
import "./HistoryPage.css";

function HistoryPage() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchPredictionHistory = useCallback(
    async (isRefresh = false) => {
      if (!token) return;

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const response = await axios.get(
          "http://localhost:5000/api/prediction/history",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
setPredictions(response.data || []);
      } catch (err) {
        console.error("Error fetching prediction history:", err);

        setError(
          err.response?.data?.message ||
            "Failed to load prediction history."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token]
  );
  useEffect(() => {
    // This effect intentionally loads prediction history on mount/token change.
    // The fetch function updates loading/error/prediction state as part of that request.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchPredictionHistory();
  }, [fetchPredictionHistory]);
  const handleRefresh = () => {
    fetchPredictionHistory(true);
  };

  const handleDeletePrediction = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this prediction?"
    );

    if (!confirmed) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/prediction/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPredictions((current) =>
        current.filter((prediction) => prediction._id !== id)
      );
    } catch (err) {
      console.error("Error deleting prediction:", err);

      alert(
        err.response?.data?.message ||
          "Failed to delete prediction."
      );
    }
  };

  const handleClearHistory = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to clear all predictions?"
    );

    if (!confirmed) return;

    try {
      await axios.delete(
        "http://localhost:5000/api/prediction/history/clear",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPredictions([]);
    } catch (err) {
      console.error("Error clearing history:", err);

      alert(
        err.response?.data?.message ||
          "Failed to clear history."
      );
    }
  };

  const formatBudget = (value) => {
    const amount = Number(value || 0);

    if (amount >= 1000000000) {
    return `₹${(amount / 1000000000).toFixed(1)}B`;
    }

    if (amount >= 1000000) {
    return `₹${(amount / 1000000).toFixed(1)}M`;
    }

    if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(0)}K`;
    }

    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="history-container">
      <div className="history-content">

        {/* PAGE HEADER */}
        <div className="history-page-header">
          <div>
            <span className="history-kicker">
              AI PREDICTION INTELLIGENCE
            </span>

            <h1>PREDICTION HISTORY</h1>

            <p>
              Review previous feature-film success and short-film
              festival circulation estimates.
            </p>
          </div>

          {predictions.length > 0 && (
            <button
              type="button"
              className="clear-history-btn"
              onClick={handleClearHistory}
            >
              <span className="clear-icon">×</span>
              CLEAR ALL
            </button>
          )}
        </div>

        {/* LOADING */}
        {loading && (
          <div className="history-loading">
            <div className="history-loader"></div>
            <p>Loading prediction intelligence...</p>
          </div>
        )}

        {/* ERROR */}
        {error && !loading && (
          <div className="history-error">
            <div className="history-error-content">
              <span className="error-icon">!</span>

              <div>
                <strong>
                  Unable to load prediction history
                </strong>

                <span>{error}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => fetchPredictionHistory()}
            >
              TRY AGAIN
            </button>
          </div>
        )}

        {/* MAIN CONTENT */}
        {!loading && !error && (
          <>
            {predictions.length > 0 ? (
              <div className="history-panel">

                {/* TOP TOOLBAR */}
                <div className="history-toolbar">

                  <div className="history-total">
                    <div className="history-total-icon">
                      ✦
                    </div>

                    <div>
                      <span className="history-total-label">
                        TOTAL PREDICTIONS
                      </span>

                      <strong>
                        {predictions.length}
                      </strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={`refresh-history-btn ${
                      refreshing ? "refreshing" : ""
                    }`}
                    onClick={handleRefresh}
                    disabled={refreshing}
                  >
                    <span className="refresh-icon">
                      {refreshing ? "⟳" : "↻"}
                    </span>

                    <span>
                      {refreshing
                        ? "REFRESHING"
                        : "REFRESH"}
                    </span>
                  </button>
                </div>

                {/* TABLE */}
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>PROJECT</th>
                        <th>GENRE</th>
                        <th>BUDGET</th>
                        <th>RATING</th>
                        <th>PREDICTION</th>
                        <th>PROBABILITY</th>
                        <th>DATE</th>
                        <th>ACTION</th>
                      </tr>
                    </thead>

                    <tbody>
                      {predictions.map((prediction) => {
                        const probability = normalizeProbabilityValue(
                          prediction.success_probability
                        );
                        const probabilityLabel = formatProbabilityValue(probability);

                        const predictionType =
                          prediction.projectType === "shortfilm"
                            ? prediction.prediction === "SUCCESS"
                              ? "CIRCULATION LIKELY"
                              : "CIRCULATION UNLIKELY"
                            : prediction.prediction || "UNKNOWN";

                        const predictionClass =
                          predictionType
                            .toLowerCase()
                            .replace(/\s+/g, "-");

                        return (
                          <tr key={prediction._id}>

                            {/* MOVIE */}
                            <td className="movie-cell">
                              <div className="history-movie">
                                <div className="history-movie-icon">
                                  🎬
                                </div>

                                <div>
                                  <strong>
                                    {prediction.movieName ||
                                      "Untitled Movie"}
                                  </strong>

                                  <span>
                                    {prediction.projectType === "shortfilm"
                                      ? "Short Film Circulation"
                                      : "Feature Film Analysis"}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* GENRE */}
                            <td>
                              <span className="genre-value">
                                {prediction.genre || "—"}
                              </span>
                            </td>

                            {/* BUDGET */}
                            <td>
                              <span className="budget-value">
                                {formatBudget(
                                  prediction.budget
                                )}
                              </span>
                            </td>

                            {/* RATING */}
                            <td>
                              <span className="rating-value">
                                {prediction.rating ?? "—"}
                              </span>

                              <span className="rating-small">
                                /10
                              </span>
                            </td>

                            {/* PREDICTION */}
                            <td>
                              <span
                                className={`status-badge status-${predictionClass}`}
                              >
                                <span className="status-dot"></span>
                                {predictionType}
                              </span>
                            </td>

                            {/* PROBABILITY */}
                            <td>
                              <div className="probability-cell">

                                <div className="probability-top">
                                  <span>
                                    {prediction.projectType === "shortfilm"
                                      ? "Circulation"
                                      : "Success"}
                                  </span>

                                  <strong>
                                    {probabilityLabel}
                                  </strong>
                                </div>

                                <div className="probability-bar">
                                  <i
                                    style={{
                                      width: `${probability}%`,
                                    }}
                                  ></i>
                                </div>

                              </div>
                            </td>

                            {/* DATE */}
                            <td className="date-cell">
                              {formatDate(
                                prediction.createdAt
                              )}
                            </td>

                            {/* ACTION */}
                            <td>
                              <button
                                type="button"
                                className="delete-btn"
                                onClick={() =>
                                  handleDeletePrediction(
                                    prediction._id
                                  )
                                }
                              >
                                DELETE
                              </button>
                            </td>

                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

              </div>
            ) : (
              <div className="empty-history">

                <div className="empty-history-icon">
                  <span>✦</span>
                </div>

                <span className="empty-history-kicker">
                  AI PREDICTION CENTER
                </span>

                <h3>
                  No predictions yet
                </h3>

                <p>
                  Your AI prediction results will appear
                  here after you analyze a movie.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/prediction")
                  }
                >
                  MAKE YOUR FIRST PREDICTION
                  <span>→</span>
                </button>

              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}

export default HistoryPage;