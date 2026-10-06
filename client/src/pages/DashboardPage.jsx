import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import "./DashboardPage.css";

function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">

      {/* MAIN CONTENT */}

      <main className="dashboard-content">

        {/* WELCOME */}

        <section className="welcome-section">

          <p className="dashboard-kicker">
            RELEASE RADAR
          </p>

          <h1 className="welcome-title">
            Welcome back,{" "}
            <span>
              {user?.name || "Movie Analyst"}
            </span>
          </h1>

          <p className="welcome-subtitle">
            AI-powered movie intelligence for filmmakers,
            producers and creators.
          </p>

        </section>


        {/* STATS */}

        <section className="stats-grid">

          <div className="stat-card">
            <div className="stat-icon">
              🎬
            </div>

            <div>
              <h3>
                Feature Film
              </h3>

              <p>
                Success prediction
              </p>
            </div>
          </div>


          <div className="stat-card">
            <div className="stat-icon">
              🧠
            </div>

            <div>
              <h3>
                Short Film
              </h3>

              <p>
                Festival circulation estimate
              </p>
            </div>
          </div>


          <div className="stat-card">
            <div className="stat-icon">
              📈
            </div>

            <div>
              <h3>
                Prediction History
              </h3>

              <p>
                Saved to your account
              </p>
            </div>
          </div>

        </section>


        {/* QUICK ACTIONS */}

        <section className="quick-actions">

          <h2>
            What do you want to do?
          </h2>


          <div className="actions-grid">

            <button
              className="action-card"
              onClick={() => navigate("/prediction")}
            >
              <div className="action-icon">
                🧠
              </div>

              <h3>
                Predict Movie Success
              </h3>

              <p>
                Enter your movie details and get an
                AI-based success probability.
              </p>

              <span>
                START PREDICTION →
              </span>
            </button>


          

            <button
              className="action-card"
              onClick={() => navigate("/history")}
            >
              <div className="action-icon">
                📜
              </div>

              <h3>
                Prediction History
              </h3>

              <p>
                View your previous movie predictions
                and AI results.
              </p>

              <span>
                VIEW HISTORY →
              </span>
            </button>


          </div>

        </section>

      </main>

    </div>
  );
}

export default DashboardPage;