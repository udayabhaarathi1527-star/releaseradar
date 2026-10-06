import { useState, useEffect, useCallback } from "react";

import { useAuth } from "../context/AuthContext";

import axios from "axios";

import "./AnalyticsPage.css";

function AnalyticsPage() {
  const { token } = useAuth();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      // Fetch user's prediction history
      const response = await axios.get(
        "http://localhost:5000/api/prediction/history",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const predictions = response.data;
      const totalPredictions = predictions.length;

      let successCount = 0;
      let moderateCount = 0;
      let lowCount = 0;
      let totalProbability = 0;

      predictions.forEach((p) => {
        if (p.prediction_result === "SUCCESS") successCount++;
        else if (p.prediction_result === "MODERATE") moderateCount++;
        else if (p.prediction_result === "LOW") lowCount++;

        totalProbability += p.success_probability || 0;
      });

      const avgProbability =
        totalPredictions > 0
          ? (totalProbability / totalPredictions).toFixed(1)
          : 0;

      setStats({
        totalPredictions,
        successCount,
        moderateCount,
        lowCount,
        averageProbability: avgProbability,
        successRate:
          totalPredictions > 0
            ? ((successCount / totalPredictions) * 100).toFixed(1)
            : 0,
      });
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError("Failed to load analytics. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    // Analytics intentionally loads prediction history when the token changes.
    // fetchAnalytics manages the loading, error, and statistics state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchAnalytics();
  }, [fetchAnalytics]);

  return (
    <div className="analytics-container">
      {/* Header */}
      <div className="analytics-header">
        <div className="header-left">
          <h1 className="header-logo">
            RELEASE<span>RADAR</span>
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="analytics-content">
        <div className="content-header">
          <div>
            <h2>ANALYTICS</h2>
            <p>Your prediction statistics and insights</p>
          </div>

          <button
            className="refresh-btn"
            onClick={fetchAnalytics}
            type="button"
          >
            REFRESH
          </button>
        </div>

        {loading && (
          <p className="loading-text">Loading analytics...</p>
        )}

        {error && (
          <div className="error-message">{error}</div>
        )}

        {!loading && stats && (
          <div className="analytics-grid">
            <div className="stat-card">
              <div className="stat-header">
                <h3>TOTAL PREDICTIONS</h3>
                <span className="stat-icon">📊</span>
              </div>

              <p className="stat-value">
                {stats.totalPredictions}
              </p>

              <p className="stat-subtext">
                All-time predictions
              </p>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <h3>SUCCESS RATE</h3>
                <span className="stat-icon">✅</span>
              </div>

              <p className="stat-value">
                {stats.successRate}%
              </p>

              <p className="stat-subtext">
                {stats.successCount} successful predictions
              </p>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <h3>AVG PROBABILITY</h3>
                <span className="stat-icon">📈</span>
              </div>

              <p className="stat-value">
                {stats.averageProbability}%
              </p>

              <p className="stat-subtext">
                Average success probability
              </p>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <h3>BREAKDOWN</h3>
                <span className="stat-icon">📋</span>
              </div>

              <div className="breakdown-stats">
                <div className="breakdown-item">
                  <span>Success</span>
                  <strong>{stats.successCount}</strong>
                </div>

                <div className="breakdown-item">
                  <span>Moderate</span>
                  <strong>{stats.moderateCount}</strong>
                </div>

                <div className="breakdown-item">
                  <span>Low</span>
                  <strong>{stats.lowCount}</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {!loading && stats && (
          <div className="analytics-section">
            <h3>PREDICTION DISTRIBUTION</h3>

            <div className="distribution-chart">
              {stats.totalPredictions > 0 ? (
                <>
                  <div className="chart-bar">
                    <div
                      className="bar-fill success"
                      style={{
                        width: `${
                          (stats.successCount /
                            stats.totalPredictions) *
                          100
                        }%`,
                      }}
                    />
                  </div>

                  <div className="chart-labels">
                    <span>
                      Success (
                      {Math.round(
                        (stats.successCount /
                          stats.totalPredictions) *
                          100
                      )}
                      %)
                    </span>

                    <span>
                      Moderate (
                      {Math.round(
                        (stats.moderateCount /
                          stats.totalPredictions) *
                          100
                      )}
                      %)
                    </span>

                    <span>
                      Low (
                      {Math.round(
                        (stats.lowCount /
                          stats.totalPredictions) *
                          100
                      )}
                      %)
                    </span>
                  </div>
                </>
              ) : (
                <p className="no-data">No predictions yet</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AnalyticsPage;