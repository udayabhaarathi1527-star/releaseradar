import { useMemo } from "react";
import "./PredictionPage.css";

import MovieProfileSection from "./MovieProfileSection";
import BudgetSection from "./BudgetSection";
import AudienceSection from "./AudienceSection";
import ShortFilmSection from "./ShortFilmSection";

import FilmmakerGuide from "./FilmmakerGuide";
import PredictionButton from "./PredictionButton";
import PredictionResult from "./PredictionResult";
import SuccessFactors from "./SuccessFactors";
import RiskAnalysis from "./RiskAnalysis";
import Recommendations from "./Recommendations";
import Icon from "../Icon";

import {
  deriveRecommendations,
  deriveRisks,
  deriveSuccessFactors,
  getActiveStep,
} from "../../utils/predictionInsights";

const STEPS = [
  ["01", "PROJECT TYPE"],
  ["02", "PROJECT DETAILS"],
  ["03", "AUDIENCE & MARKET"],
  ["04", "AI ANALYSIS"],
];

function PredictionPage({
  projectType,
  setProjectType,

  movieName,
  setMovieName,

  predictionData,
  updateField,
  handlePrediction,

  predictionResult,
  predictionLoading,
  predictionError,
  fieldErrors,
  probability,
}) {
  const activeStep = getActiveStep(
    predictionData,
    Boolean(predictionResult)
  );

  const factors = useMemo(
    () => deriveSuccessFactors(predictionData),
    [predictionData]
  );

  const risks = useMemo(
    () => deriveRisks(predictionData),
    [predictionData]
  );

  const recommendations = useMemo(
    () => deriveRecommendations(predictionData),
    [predictionData]
  );

  // ==================================================
  // PROJECT TYPE SELECTION
  // ==================================================

  if (!projectType) {
    return (
      <div className="prediction-workspace">

        <div className="prediction-intro">
          <div>

            <div className="red-pill">
              <span></span>
              FILM INTELLIGENCE
            </div>

            <h2>
              What are you planning to make?
            </h2>

            <p>
              Choose your project type so ReleaseRadar
              can provide a more relevant analysis.
            </p>

          </div>

          <div className="engine-status">
            <span></span>
            Prediction Engine Online
          </div>
        </div>


        <div className="project-type-section">

          <div className="project-type-heading">

            <span>
              01 — PROJECT TYPE
            </span>

            <h3>
              Select the type of film you want to analyze.
            </h3>

            <p>
              ReleaseRadar uses different factors depending
              on the type of project you are planning.
            </p>

          </div>


          <div className="project-type-grid">

            {/* FEATURE FILM */}

            <button
              type="button"
              className="project-type-card"
              onClick={() =>
                setProjectType("feature")
              }
            >

              <div className="project-type-icon">
                🎬
              </div>

              <div className="project-type-content">

                <span className="project-type-number">
                  01
                </span>

                <h3>
                  Feature Film
                </h3>

                <p>
                  Analyze the potential of a
                  full-length commercial,
                  theatrical, or streaming film.
                </p>

                <div className="project-type-factors">
                  <span>Budget</span>
                  <span>Audience</span>
                  <span>Market</span>
                  <span>Release</span>
                </div>

              </div>

              <div className="project-type-arrow">
                →
              </div>

            </button>


            {/* SHORT FILM */}

            <button
              type="button"
              className="project-type-card"
              onClick={() =>
                setProjectType("shortfilm")
              }
            >

              <div className="project-type-icon">
                🎞️
              </div>

              <div className="project-type-content">

                <span className="project-type-number">
                  02
                </span>

                <h3>
                  Short Film
                </h3>

                <p>
                  Estimate festival circulation from runtime and
                  genre; other details are planning context only.
                </p>

                <div className="project-type-factors">
                  <span>Runtime</span>
                  <span>Genre</span>
                  <span>Festivals</span>
                  <span>Planning</span>
                </div>

              </div>

              <div className="project-type-arrow">
                →
              </div>

            </button>

          </div>

        </div>


        <div className="project-type-note">

          <span>✦</span>

          <p>
            <strong>
              Why does this matter?
            </strong>{" "}
            A feature film and a short film have
            different success factors. Your selection
            helps us tailor the analysis to your project.
          </p>

        </div>

      </div>
    );
  }


  // ==================================================
  // MAIN PREDICTION PAGE
  // ==================================================

  return (
    <div className="prediction-workspace">

      {/* ============================================== */}
      {/* HEADER */}
      {/* ============================================== */}

      <div className="prediction-intro">

        <div>

          <div className="red-pill">
            <span></span>
            FILM INTELLIGENCE
          </div>

          <h2>
            {projectType === "shortfilm"
              ? "Short Film Analysis"
              : "Feature Film Prediction"}
          </h2>

          <p>
            {projectType === "shortfilm"
              ? "Estimate festival circulation from runtime and genre. Other details are planning context and do not affect the model score."
              : "Plan smarter. Understand your movie's potential before production."}
          </p>

        </div>

        <div className="engine-status">
          <span></span>
          Prediction Engine Online
        </div>

      </div>


      {/* ============================================== */}
      {/* SELECTED PROJECT TYPE */}
      {/* ============================================== */}

      <div className="selected-project-type">

        <div className="selected-project-icon">
          {projectType === "shortfilm"
            ? "🎞️"
            : "🎬"}
        </div>

        <div>

          <span>
            PROJECT TYPE
          </span>

          <strong>
            {projectType === "shortfilm"
              ? "SHORT FILM"
              : "FEATURE FILM"}
          </strong>

        </div>

        <button
          type="button"
          onClick={() =>
            setProjectType("")
          }
        >
          CHANGE
        </button>

      </div>


      {/* ============================================== */}
      {/* PROGRESS STEPS */}
      {/* ============================================== */}

      <ol className="prediction-steps">

        {STEPS.map(([number, label], index) => (

          <li
            key={label}
            className={
              index + 1 <= activeStep
                ? "is-active"
                : ""
            }
          >

            <em>
              STEP {number}
            </em>

            <span>
              {label}
            </span>

          </li>

        ))}

      </ol>


      {/* ============================================== */}
      {/* FORM */}
      {/* ============================================== */}

      <form
        onSubmit={handlePrediction}
        className="prediction-form"
        noValidate
      >

        <div className="prediction-layout">

          <div className="prediction-main">

            {/* ======================================== */}
            {/* FEATURE FILM FORM */}
            {/* ======================================== */}

            {projectType === "feature" && (
              <>
                <MovieProfileSection
                  movieName={movieName}
                  onMovieNameChange={setMovieName}
                  predictionData={predictionData}
                  updateField={updateField}
                  fieldErrors={fieldErrors}
                />

                <BudgetSection
                  predictionData={predictionData}
                  updateField={updateField}
                  fieldErrors={fieldErrors}
                />

                <AudienceSection
                  predictionData={predictionData}
                  updateField={updateField}
                  fieldErrors={fieldErrors}
                />
              </>
            )}


            {/* ======================================== */}
            {/* SHORT FILM FORM */}
            {/* ======================================== */}

            {projectType === "shortfilm" && (
              <ShortFilmSection
                movieName={movieName}
                setMovieName={setMovieName}
                predictionData={predictionData}
                updateField={updateField}
                fieldErrors={fieldErrors}
              />
            )}

          </div>


          {/* ========================================== */}
          {/* GUIDE */}
          {/* ========================================== */}

          <FilmmakerGuide />

        </div>


        {/* ============================================ */}
        {/* ERROR */}
        {/* ============================================ */}

        {predictionError && (
          <div className="prediction-error">

            <Icon type="alert" />

            {predictionError}

          </div>
        )}


        {/* ============================================ */}
        {/* ANALYZE BUTTON */}
        {/* ============================================ */}

        <PredictionButton
          loading={predictionLoading}
        />

      </form>


      {/* ============================================== */}
      {/* RESULTS */}
      {/* ============================================== */}

      {predictionResult && (
        <div className="prediction-results">

          <PredictionResult
            predictionResult={predictionResult}
            probability={
              probability ??
              predictionResult.success_probability
            }
            movieName={movieName}
          />

          {projectType === "feature" && (
            <>
              <SuccessFactors
                factors={factors}
              />

              <RiskAnalysis
                risks={risks}
              />

              <Recommendations
                cards={recommendations}
              />
            </>
          )}

        </div>
      )}

    </div>
  );
}

export default PredictionPage;