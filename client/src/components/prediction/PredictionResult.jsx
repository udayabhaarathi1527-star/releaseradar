import {
  meaningFromProbability,
  normalizeProbabilityValue,
  formatProbabilityValue,
} from "../../utils/predictionInsights";

function PredictionResult({
  predictionResult,
  probability,
  movieName,
}) {
  const finalProbability = normalizeProbabilityValue(
    probability ?? predictionResult?.success_probability ?? 0
  );

  const meaning = meaningFromProbability(finalProbability);
  const displayProbability = formatProbabilityValue(finalProbability);
  const isShortFilmCirculation =
    predictionResult?.feature_set === "MODEL C";
  const circulationLikely = predictionResult?.prediction === "SUCCESS";

  const modelLabel =
    isShortFilmCirculation
      ? circulationLikely
        ? "CIRCULATION LIKELY"
        : "CIRCULATION UNLIKELY"
      : predictionResult?.prediction || meaning.band;

  return (
    <section className="result-dashboard">
      <div className="result-dashboard-head">
        <span>
          {isShortFilmCirculation
            ? "SHORT FILM FESTIVAL CIRCULATION ESTIMATE"
            : "AI MOVIE SUCCESS ANALYSIS"}
        </span>

        {movieName ? (
          <h2>{movieName}</h2>
        ) : (
          <h2>Project analysis</h2>
        )}
      </div>

      <div className="result-hero-grid">
        <div className="result-score-panel">
          <div
            className="score-ring large-ring"
            style={{
              "--score": `${finalProbability}%`,
            }}
          >
            <div className="score-inner">
              <strong>{displayProbability}</strong>
              <span>
                {isShortFilmCirculation
                  ? "CIRCULATION SCORE"
                  : "SUCCESS PROBABILITY"}
              </span>
            </div>
          </div>

          <div className="score-status">
            <span>
              {isShortFilmCirculation
                ? circulationLikely
                  ? "THRESHOLD MET"
                  : "BELOW THRESHOLD"
                : meaning.band}
            </span>

            <p>
              Model classification: {modelLabel}
            </p>
          </div>
        </div>

        <div className="result-meaning-panel">
          <span className="panel-kicker">
            WHAT THIS MEANS
          </span>

          <h3>
            {isShortFilmCirculation
              ? circulationLikely
                ? "Festival circulation signal detected"
                : "Limited circulation signal"
              : meaning.headline}
          </h3>

          <p>
            {isShortFilmCirculation
              ? "This score estimates festival circulation using the validated Short Film MODEL C pipeline. It is not a measure of overall film quality or commercial success."
              : meaning.body}
          </p>

          <p className="result-disclaimer">
            {isShortFilmCirculation
              ? "This model uses a 60% classification threshold. Country, region, and category features not collected by this form use fixed defaults."
              : "The percentage comes from the Random Forest model. Supporting factor cards below are indicative analysis, not direct model outputs."}
          </p>
        </div>
      </div>
    </section>
  );
}

export default PredictionResult;