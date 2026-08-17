const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    genre: {
      type: String,
      required: true,
    },
    
    language: {
      type: String,
      required: true,
    },
    releaseDate: {
      type: Date,
      required: true,
    },
    platform: {
      type: String,
      required: true,
    },
    poster: {
      type: String,
    },
    trailer: {
      type: String,
    },
    rating: {
      type: Number,
      default: 0,
    },
    type: {
      type: String,
      enum: ["Movie", "Series"],
      default: "Movie",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Movie", movieSchema);