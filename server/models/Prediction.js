const mongoose = require("mongoose");

const predictionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    projectType: {
      type: String,
      enum: ["feature", "shortfilm"],
      default: "feature",
    },
    movieName: {
      type: String,
      default: "Untitled Project",
    },
    budget: {
      type: Number,
      default: 0,
    },
    duration: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
    },
    runtime: {
      type: Number,
      default: 0,
    },
    star_power: {
      type: Number,
      default: 0,
    },
    competition: {
      type: Number,
      default: 0,
    },
    genre: {
      type: String,
      default: "Unknown",
    },
    release_month: {
      type: Number,
      default: 0,
    },
    release_year: {
      type: Number,
      default: 0,
    },
    production_company: {
      type: String,
      default: "",
    },
    original_language: {
      type: String,
      default: "",
    },
    target_audience: {
      type: String,
      default: "",
    },
    distribution_platform: {
      type: String,
      default: "",
    },
    social_reach: {
      type: String,
      default: "",
    },
    promotion_plan: {
      type: String,
      default: "",
    },
    festival_submission: {
      type: String,
      default: "",
    },
    prediction: {
      type: String,
      enum: ["SUCCESS", "MODERATE", "LOW PROBABILITY"],
      required: true,
    },
    success_probability: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Prediction", predictionSchema);
