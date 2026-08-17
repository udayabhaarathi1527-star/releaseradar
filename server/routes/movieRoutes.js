const express = require("express");
const {
  addMovie,
  getMovies,
  searchMovies,
  updateMovie,
  deleteMovie,
} = require("../controllers/movieController");

const router = express.Router();

// Add Movie
router.post("/", addMovie);

// Get All Movies
router.get("/", getMovies);

// Search Movies
router.get("/search", searchMovies);

// Update Movie
router.put("/:id", updateMovie);

// Delete Movie
router.delete("/:id", deleteMovie);

module.exports = router;