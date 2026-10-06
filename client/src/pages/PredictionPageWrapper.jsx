import { useState } from "react";

import { useAuth } from "../context/AuthContext";

import PredictionPage from "../components/prediction/PredictionPage";

import axios from "axios";

import {
  validatePrediction,
  validateShortFilmPrediction,
} from "../utils/predictionInsights";

function PredictionPageWrapper() {
  const { token } = useAuth();

  // ==================================================
  // PROJECT TYPE
  // ==================================================

  const [projectType, setProjectType] = useState("");

  // ==================================================
  // PREDICTION DATA
  // ==================================================

  const [predictionData, setPredictionData] = useState({
    // Feature film fields
    budget: "250000",
    rating: "7",
    runtime: "110",
    star_power: "4",
    competition: "5",
    genre: "Drama",
    release_month: "9",
    release_year: "2026",
    production_company: "Independent Production",
    original_language: "en",

    // Short film fields
    duration: "",
    story_strength: "5",
    originality: "5",
    acting_score: "5",
    visual_quality: "5",
    emotional_impact: "5",
    target_audience: "general",
    distribution_platform: "youtube",
    social_reach: "none",
    promotion_plan: "organic",
    festival_submission: "no",
  });

  const [movieName, setMovieName] = useState("");

  const [predictionResult, setPredictionResult] =
    useState(null);

  const [predictionLoading, setPredictionLoading] =
    useState(false);

  const [predictionError, setPredictionError] =
    useState("");

  const [fieldErrors, setFieldErrors] =
    useState({});


  // ==================================================
  // PROJECT TYPE CHANGE
  // ==================================================

  const handleProjectTypeChange = (type) => {
    setProjectType(type);

    setMovieName("");

    setPredictionResult(null);
    setPredictionError("");
    setFieldErrors({});

    // ----------------------------------------------
    // FEATURE FILM DEFAULTS
    // ----------------------------------------------

    if (type === "feature") {
      setPredictionData({
        budget: "250000",
        rating: "7",
        runtime: "110",
        star_power: "4",
        competition: "5",
        genre: "Drama",
        release_month: "9",
        release_year: "2026",
        production_company:
          "Independent Production",
        original_language: "en",

        duration: "",
        story_strength: "5",
        originality: "5",
        acting_score: "5",
        visual_quality: "5",
        emotional_impact: "5",
        target_audience: "general",
        distribution_platform: "youtube",
        social_reach: "none",
        promotion_plan: "organic",
        festival_submission: "no",
      });
    }


    // ----------------------------------------------
    // SHORT FILM DEFAULTS
    // ----------------------------------------------

    if (type === "shortfilm") {
      setPredictionData({
        // Single total budget
        budget: "50000",

        // Short-film creative factors
        rating: "7",
        duration: "",

        story_strength: "5",
        originality: "5",
        acting_score: "5",
        visual_quality: "5",
        emotional_impact: "5",

        // Audience & distribution
        target_audience: "general",
        distribution_platform: "youtube",
        social_reach: "none",
        promotion_plan: "organic",
        festival_submission: "no",

        // Keep these fields available for the
        // current feature-film ML API.
        star_power: "0",
        competition: "0",
        release_month: "9",
        release_year: "2026",
        genre: "Drama",
        production_company:
          "Independent Production",
        original_language: "en",
      });
    }
  };


  // ==================================================
  // PREDICTION
  // ==================================================

  const handlePrediction = async (e) => {
    e.preventDefault();

    // ----------------------------------------------
    // PROJECT TYPE CHECK
    // ----------------------------------------------

    if (!projectType) {
      setPredictionError(
        "Please select whether this is a feature film or short film."
      );
      return;
    }


    // ----------------------------------------------
    // PROJECT-SPECIFIC VALIDATION
    // ----------------------------------------------

    const errors =
      projectType === "shortfilm"
        ? validateShortFilmPrediction(predictionData)
        : validatePrediction(predictionData);

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);

      setPredictionError(
        "Please correct the highlighted fields before analyzing."
      );

      return;
    }


    // ----------------------------------------------
    // MOVIE NAME
    // ----------------------------------------------

    if (!movieName.trim()) {
      setPredictionError(
        "Please enter a movie name."
      );

      return;
    }


    // ----------------------------------------------
    // AUTHENTICATION
    // ----------------------------------------------

    if (!token) {
      setPredictionError(
        "You are not logged in. Please login again."
      );

      return;
    }


    // ----------------------------------------------
    // START PREDICTION
    // ----------------------------------------------

    setFieldErrors({});
    setPredictionLoading(true);
    setPredictionError("");
    setPredictionResult(null);


    try {
      const response = await axios.post(
       `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"}/prediction/predict`,
        {
          movieName: movieName.trim(),

          projectType,

          // Shared film fields
          budget: Number(
            predictionData.budget
          ),
          genre: predictionData.genre,
          original_language:
            predictionData.original_language,
          production_company:
            predictionData.production_company,

          // Feature film fields
          rating: Number(
            predictionData.rating
          ),
          runtime: Number(
            predictionData.runtime
          ),
          star_power: Number(
            predictionData.star_power
          ),
          competition: Number(
            predictionData.competition
          ),
          release_month: Number(
            predictionData.release_month
          ),
          release_year: Number(
            predictionData.release_year
          ),

          // Short film fields
          duration: Number(
            predictionData.duration
          ),
          story_strength: Number(
            predictionData.story_strength
          ),
          originality: Number(
            predictionData.originality
          ),
          acting_score: Number(
            predictionData.acting_score
          ),
          visual_quality: Number(
            predictionData.visual_quality
          ),
          emotional_impact: Number(
            predictionData.emotional_impact
          ),
          target_audience: predictionData.target_audience,
          distribution_platform: predictionData.distribution_platform,
          social_reach: predictionData.social_reach,
          promotion_plan: predictionData.promotion_plan,
          festival_submission: predictionData.festival_submission,
        },
        {
          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      console.log(
        "Prediction response:",
        response.data
      );

      setPredictionResult(
        response.data
      );

    } catch (error) {
      console.error(
        "Prediction error:",
        error
      );

      setPredictionError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Unable to get prediction. Please try again."
      );

    } finally {
      setPredictionLoading(false);
    }
  };


  // ==================================================
  // UPDATE FIELD
  // ==================================================

  const updateField = (
    field,
    value
  ) => {
    setPredictionData(
      (prev) => ({
        ...prev,
        [field]: value,
      })
    );

    setFieldErrors(
      (prev) => {
        if (!prev[field]) {
          return prev;
        }

        const next = {
          ...prev,
        };

        delete next[field];

        return next;
      }
    );
  };


  // ==================================================
  // UI
  // ==================================================

  return (
    <PredictionPage
      projectType={projectType}
      setProjectType={
        handleProjectTypeChange
      }

      movieName={movieName}
      setMovieName={setMovieName}

      predictionData={
        predictionData
      }

      updateField={updateField}

      handlePrediction={
        handlePrediction
      }

      predictionLoading={
        predictionLoading
      }

      predictionError={
        predictionError
      }

      predictionResult={
        predictionResult
      }

      fieldErrors={
        fieldErrors
      }
    />
  );
}

export default PredictionPageWrapper;