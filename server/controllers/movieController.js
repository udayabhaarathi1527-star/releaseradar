const Movie = require("../models/Movie");

// Add Movie
// Add Movie
const addMovie = async (req, res) => {
  try {
    // Check if the movie already exists
    const existingMovie = await Movie.findOne({
      title: req.body.title,
      releaseDate: req.body.releaseDate,
    });

    if (existingMovie) {
      return res.status(400).json({
        message: "Movie already exists",
      });
    }

    // Create new movie
    const movie = await Movie.create(req.body);

    res.status(201).json({
      message: "Movie Added Successfully",
      movie,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get All Movies
const getMovies = async (req, res) => {
  try {
    const movies = await Movie.find();

    res.status(200).json(movies);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Search Movies
const searchMovies = async (req, res) => {
  try {
    const keyword = req.query.title;

    const movies = await Movie.find({
      title: { $regex: keyword, $options: "i" }
    });

    res.status(200).json(movies);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Update Movie
const updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!movie) {
      return res.status(404).json({
        message: "Movie not found",
      });
    }

    res.status(200).json({
      message: "Movie Updated Successfully",
      movie,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Delete Movie
const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);

    if (!movie) {
      return res.status(404).json({
        message: "Movie not found",
      });
    }

    res.status(200).json({
      message: "Movie Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  addMovie,
  getMovies,
  searchMovies,
  updateMovie,
  deleteMovie,
};