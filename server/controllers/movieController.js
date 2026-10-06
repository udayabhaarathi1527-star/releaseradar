const { spawn } = require("child_process");
const path = require("path");
const Movie = require("../models/Movie");

const normalizeMovieStatus = (value) => {
  const status = String(value ?? "").trim().toUpperCase();

  if (status === "1" || status === "SUCCESS" || status === "HIT") {
    return "HIT";
  }

  if (status === "0" || status === "FAILURE" || status === "FLOP") {
    return "FLOP";
  }

  return "UPCOMING";
};

const parseNumber = (value, fallback = 0) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const parseJsonList = (value) => {
  if (!value) return [];

  if (Array.isArray(value)) return value;

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (error) {
    return String(value)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
};

const buildGenreList = (value) => {
  const items = parseJsonList(value)
    .map((item) => (typeof item === "string" ? item : item?.name))
    .filter(Boolean);

  return items.length ? items.join(", ") : "Unknown";
};

const buildCompanyList = (value) => {
  const items = parseJsonList(value)
    .map((item) => (typeof item === "string" ? item : item?.name))
    .filter(Boolean);

  return items.length ? items.join(", ") : "Unknown";
};

const seedMovieLibrary = async () => {
  try {
    const count = await Movie.countDocuments({});
    if (count > 0) return;

    const cleanCsv = path.join(__dirname, "../../ml/releaseradar_clean.csv");
    const tmdbCsv = path.join(__dirname, "../../ml/tmdb_5000_movies.csv");

    const pythonScript = `
import json, sys, pandas as pd
clean = pd.read_csv(sys.argv[1])
tmdb = pd.read_csv(sys.argv[2], usecols=['title','release_date','vote_average','revenue','genres','production_companies','original_language'])
tmdb['title_key'] = tmdb['title'].fillna('').str.strip().str.lower()
clean['title_key'] = clean['title'].fillna('').str.strip().str.lower()
merged = clean.merge(tmdb.drop_duplicates(subset=['title_key']), on='title_key', how='left', suffixes=('_clean', '_tmdb'))
records = []
for _, row in merged.iterrows():
    genres_value = row.get('genres_tmdb')
    if pd.isna(genres_value):
        genres_value = row.get('genres_clean')
    if pd.isna(genres_value):
        genres_value = row.get('genres')
    if pd.isna(genres_value):
        genres_value = '[]'

    companies_value = row.get('production_companies_tmdb')
    if pd.isna(companies_value):
        companies_value = row.get('production_companies_clean')
    if pd.isna(companies_value):
        companies_value = row.get('production_companies')
    if pd.isna(companies_value):
        companies_value = '[]'

    release_date = row.get('release_date')
    if pd.isna(release_date):
        release_date = ''

    rating = row.get('vote_average')
    if pd.isna(rating):
        rating = 0

    revenue = row.get('revenue')
    if pd.isna(revenue):
        revenue = 0

    records.append({
        'title': row.get('title', ''),
        'budget': float(row.get('budget', 0) or 0),
        'runtime': float(row.get('runtime', 0) or 0),
        'genres': genres_value,
        'original_language': row.get('original_language') or row.get('original_language_tmdb') or 'en',
        'production_companies': companies_value,
        'release_date': release_date,
        'release_year': int(row.get('release_year', 0) or 0),
        'success': int(row.get('success', 0) or 0),
        'rating': float(rating or 0),
        'revenue': float(revenue or 0),
    })

print(json.dumps(records))
`;

    const pythonProcess = spawn("python", ["-c", pythonScript, cleanCsv, tmdbCsv], { cwd: path.join(__dirname, "../..") });

    let output = "";
    let errorOutput = "";

    return await new Promise((resolve, reject) => {
      pythonProcess.stdout.on("data", (data) => {
        output += data.toString();
      });

      pythonProcess.stderr.on("data", (data) => {
        errorOutput += data.toString();
      });

      pythonProcess.on("close", async (code) => {
        if (code !== 0) {
          reject(new Error(errorOutput || "Failed to seed movie library from CSV data."));
          return;
        }

        try {
          const rows = JSON.parse(output);
          const payload = rows.map((movie) => ({
            title: movie.title,
            genre: buildGenreList(movie.genres),
            genres: buildGenreList(movie.genres),
            language: movie.original_language || "en",
            original_language: movie.original_language || "en",
            releaseDate: movie.release_date ? new Date(movie.release_date) : null,
            release_date: movie.release_date || "",
            releaseYear: parseNumber(movie.release_year, null) || null,
            release_year: parseNumber(movie.release_year, null) || null,
            runtime: parseNumber(movie.runtime, 0),
            budget: parseNumber(movie.budget, 0),
            revenue: parseNumber(movie.revenue, 0),
            rating: parseNumber(movie.rating, 0),
            productionCompany: buildCompanyList(movie.production_companies),
            production_companies: buildCompanyList(movie.production_companies),
            status: normalizeMovieStatus(movie.success),
            success: parseNumber(movie.success, 0),
          }));

          if (payload.length) {
            await Movie.insertMany(payload.filter((movie) => movie.title));
          }

          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error("Movie library seed failed:", error.message);
  }
};

// Add Movie
const addMovie = async (req, res) => {
  try {
    const releaseYearValue = req.body.release_year ?? req.body.releaseYear;
    const payload = {
      ...req.body,
      status: normalizeMovieStatus(req.body.status || req.body.success || "UPCOMING"),
      revenue: parseNumber(req.body.revenue, 0),
      budget: parseNumber(req.body.budget, 0),
      rating: parseNumber(req.body.rating, 0),
      runtime: parseNumber(req.body.runtime, 0),
      release_year: releaseYearValue ? Number(releaseYearValue) : null,
      releaseYear: releaseYearValue ? Number(releaseYearValue) : null,
    };

    const existingMovie = await Movie.findOne({
      title: req.body.title,
      release_year: payload.release_year || null,
    });

    if (existingMovie) {
      return res.status(400).json({ message: "Movie already exists" });
    }

    const movie = await Movie.create(payload);

    res.status(201).json({ message: "Movie added successfully", movie });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to add movie" });
  }
};

// Get All Movies
const getMovies = async (req, res) => {
  try {
    const { status, genre, year, sort = "release_year", limit = 50 } = req.query;
    const query = {};

    if (status && status !== "all") {
      query.status = String(status).trim().toUpperCase();
    }

    if (genre && genre !== "all") {
      query.$or = [
        { genre: { $regex: String(genre), $options: "i" } },
        { genres: { $regex: String(genre), $options: "i" } },
      ];
    }

    if (year && year !== "all") {
      query.release_year = Number(year);
    }

    let sortObj = { createdAt: -1 };
    if (sort === "release_year") {
      sortObj = { release_year: -1, releaseYear: -1 };
    } else if (sort === "rating") {
      sortObj = { rating: -1 };
    }

    const movies = await Movie.find(query)
      .sort(sortObj)
      .limit(parseInt(limit, 10) || 50);

    res.status(200).json({
      message: "Movies retrieved successfully",
      count: movies.length,
      movies,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to retrieve movies" });
  }
};

// Get Hit Movies
const getHitMovies = async (req, res) => {
  try {
    const movies = await Movie.find({ status: "HIT" })
      .sort({ release_year: -1, releaseYear: -1 })
      .limit(50);

    res.status(200).json({ message: "Hit movies retrieved successfully", count: movies.length, movies });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to retrieve hit movies" });
  }
};

// Get Flop Movies
const getFlopMovies = async (req, res) => {
  try {
    const movies = await Movie.find({ status: "FLOP" })
      .sort({ release_year: -1, releaseYear: -1 })
      .limit(50);

    res.status(200).json({ message: "Flop movies retrieved successfully", count: movies.length, movies });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to retrieve flop movies" });
  }
};

// Get Movie by ID
const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    res.status(200).json({ message: "Movie retrieved successfully", movie });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to retrieve movie" });
  }
};

// Search Movies
const searchMovies = async (req, res) => {
  try {
    const { q, genre, language, status } = req.query;
    const query = {};

    if (q) {
      query.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }

    if (genre) {
      query.genre = { $regex: genre, $options: "i" };
    }

    if (language) {
      query.language = { $regex: language, $options: "i" };
    }

    if (status) {
      query.status = String(status).trim().toUpperCase();
    }

    const movies = await Movie.find(query).sort({ createdAt: -1 }).limit(50);

    res.status(200).json({ message: "Search results retrieved successfully", count: movies.length, movies });
  } catch (error) {
    res.status(500).json({ message: error.message || "Search failed" });
  }
};

// Update Movie
const updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    res.status(200).json({ message: "Movie updated successfully", movie });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to update movie" });
  }
};

// Delete Movie
const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);

    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    res.status(200).json({ message: "Movie deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to delete movie" });
  }
};

module.exports = {
  addMovie,
  getMovies,
  getHitMovies,
  getFlopMovies,
  getMovieById,
  searchMovies,
  updateMovie,
  deleteMovie,
  seedMovieLibrary,
};