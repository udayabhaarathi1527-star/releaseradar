const express = require("express");
const {
  addMovie,
  getMovies,
  getHitMovies,
  getFlopMovies,
  getMovieById,
  searchMovies,
  updateMovie,
  deleteMovie,
} = require("../controllers/movieController");

const router = express.Router();

// Add Movie
router.post("/", addMovie);

// Get All Movies
router.get("/", getMovies);

// Get Hit Movies
router.get("/status/hit", getHitMovies);

// Get Flop Movies
router.get("/status/flop", getFlopMovies);

// Search Movies
router.get("/search", searchMovies);

// Get Movie by ID (must be after /search and /status routes)
router.get("/:id", getMovieById);

// Update Movie
router.put("/:id", updateMovie);

// Delete Movie
router.delete("/:id", deleteMovie);

module.exports = router;