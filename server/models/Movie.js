const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    genre: {
      type: String,
      default: "Unknown",
    },
    genres: {
      type: String,
      default: "Unknown",
    },
    language: {
      type: String,
      default: "en",
    },
    original_language: {
      type: String,
      default: "en",
    },
    releaseDate: {
      type: Date,
      default: null,
    },
    release_date: {
      type: String,
      default: "",
    },
    releaseYear: {
      type: Number,
      default: null,
    },
    release_year: {
      type: Number,
      default: null,
    },
    platform: {
      type: String,
      default: "",
    },
    poster: {
      type: String,
      default: "",
    },
    trailer: {
      type: String,
      default: "",
    },
    rating: {
      type: Number,
      default: 0,
    },
    runtime: {
      type: Number,
      default: 0,
    },
    budget: {
      type: Number,
      default: 0,
    },
    revenue: {
      type: Number,
      default: 0,
    },
    productionCompany: {
      type: String,
      default: "",
    },
    production_companies: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      enum: ["Movie", "Series"],
      default: "Movie",
    },
    status: {
      type: String,
      enum: ["HIT", "FLOP", "AVERAGE", "UPCOMING"],
      default: "UPCOMING",
    },
    success: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Movie", movieSchema);