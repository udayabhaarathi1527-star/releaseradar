import Icon from "../Icon";

const STEPS = [
  "Production scale",
  "Audience potential",
  "Market competition",
  "Release timing",
  "Historical movie patterns",
];

function PredictionButton({ loading }) {
  return (
    <div className="analyze-block">
      <button
        type="submit"
        className="analyze-button"
        disabled={loading}
        aria-busy={loading}
      >
        {loading ? (
          <>
            <span className="loader"></span>
            ANALYZING YOUR MOVIE...
          </>
        ) : (
          <>
            <Icon type="spark" />
            ANALYZE MY MOVIE
          </>
        )}
      </button>

      <p className="analyze-footnote">
        Powered by ReleaseRadar Random Forest ML
      </p>

      {loading && (
        <div
          className="analyze-progress"
          aria-live="polite"
        >
          <strong>ANALYZING YOUR MOVIE...</strong>

          <p>
            Sending your profile to the live prediction engine.
          </p>

          <ul>
            {STEPS.map((step, index) => (
              <li
                key={step}
                style={{
                  animationDelay: `${index * 0.18}s`,
                }}
              >
                <Icon type="check" />
                {step}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default PredictionButton;