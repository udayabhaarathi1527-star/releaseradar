const { spawn } = require("child_process");

const path = require("path");

const Prediction = require("../models/Prediction");

// ============================================================
// SHORT FILM MODEL ARGUMENTS
// ============================================================

const buildShortFilmArgs = (inputData) => {
    const title = String(
        inputData.movieName || "Untitled Short Film"
    ).trim();

    const genre = String(
        inputData.genre || "Other"
    ).trim();

    const duration = Math.max(
        Number(inputData.duration || 0),
        0
    );

    const startYear = Number(
        inputData.release_year ||
        new Date().getFullYear()
    );

    /*
     * The Python short-film predictor calculates:
     *
     * title_length
     * title_word_count
     * genre_count
     *
     * internally.
     *
     * Node only needs to send:
     * title
     * genre
     * duration
     * start year
     */

    const genres = genre
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean);

    if (
        !genres.some(
            (part) => part.toLowerCase() === "short"
        )
    ) {
        genres.push("Short");
    }

    const genreString = genres.join(",");

    return [
        "--title",
        title,

        "--genre",
        genreString,

        "--duration",
        String(duration),

        "--start-year",
        String(startYear),
    ];
};

// ============================================================
// PREDICT MOVIE
// ============================================================

const predictMovie = async (req, res) => {
    const projectType = String(
        req.body.projectType || "feature"
    ).toLowerCase();

    const {
        budget,
        runtime,
        genre,
        release_month,
        release_year,
        production_company,
        original_language,
        duration,
        movieName = "Untitled Project",

        // Optional ML metadata
        overview = "",
        tagline = "",
        homepage = "",
        keywords_count = 0,
        country_count = 0,
        language_count = 0,
        company_count = 0,
        genre_count = 1,
    } = req.body;

    // --------------------------------------------------------
    // Determine project type
    // --------------------------------------------------------

    const isShortFilm = projectType === "shortfilm";

    // --------------------------------------------------------
    // Validate required fields
    // --------------------------------------------------------

    const hasFeatureInputs = (
        budget !== undefined &&
        runtime !== undefined &&
        !!genre &&
        release_month !== undefined &&
        release_year !== undefined &&
        !!production_company &&
        !!original_language
    );

    const hasShortFilmInputs = (
        budget !== undefined &&
        duration !== undefined &&
        !!genre &&
        !!original_language
    );

    if (
        (!isShortFilm && !hasFeatureInputs) ||
        (isShortFilm && !hasShortFilmInputs)
    ) {
        return res.status(400).json({
            message:
                "Required prediction fields are missing.",
        });
    }

    // --------------------------------------------------------
    // Python ML script
    // --------------------------------------------------------

    const pythonScript = path.join(
        __dirname,
        isShortFilm
            ? "../../ml/shortfilm_data/predict_shortfilm.py"
            : "../../ml/predict_api.py"
    );

    // --------------------------------------------------------
    // Send data to Python
    // --------------------------------------------------------

    let pythonArgs;

    if (isShortFilm) {

        /*
         * SHORT FILM
         *
         * New model expects:
         *
         * --title
         * --genre
         * --duration
         * --start-year
         */

        pythonArgs = [
            pythonScript,
            ...buildShortFilmArgs(req.body),
        ];

    } else {

        /*
         * FEATURE FILM
         *
         * Existing feature-film model remains unchanged.
         */

        pythonArgs = [
            pythonScript,
            String(budget),
            String(runtime),
            String(genre),
            String(original_language),
            String(production_company),
            String(release_month),
            String(release_year),
            String(overview),
            String(tagline),
            String(homepage),
            String(keywords_count),
            String(country_count),
            String(language_count),
            String(company_count),
            String(genre_count),
            String(movieName),
        ];
    }

    // --------------------------------------------------------
    // Start Python process
    // --------------------------------------------------------

    const pythonProcess = spawn(
        "python",
        pythonArgs
    );

    let output = "";

    let errorOutput = "";

    let processFailed = false;

    // --------------------------------------------------------
    // Python process startup error
    // --------------------------------------------------------

    pythonProcess.on("error", (error) => {

        processFailed = true;

        console.error(
            "ML process could not start:",
            error
        );

        if (!res.headersSent) {

            res.status(500).json({
                message:
                    "Unable to start ML prediction.",
                error: error.message,
            });
        }
    });

    // --------------------------------------------------------
    // Python output
    // --------------------------------------------------------

    pythonProcess.stdout.on("data", (data) => {

        output += data.toString();
    });

    // --------------------------------------------------------
    // Python errors
    // --------------------------------------------------------

    pythonProcess.stderr.on("data", (data) => {

        errorOutput += data.toString();
    });

    // --------------------------------------------------------
    // Python process finished
    // --------------------------------------------------------

    pythonProcess.on("close", async (code) => {

        if (processFailed) {
            return;
        }

        // ----------------------------------------------------
        // Python failed
        // ----------------------------------------------------

        if (code !== 0) {

            console.error(
                "ML Error:",
                errorOutput
            );

            return res.status(500).json({
                message:
                    "ML prediction failed.",
                error: errorOutput,
            });
        }

        // ----------------------------------------------------
        // Convert Python JSON output
        // ----------------------------------------------------

        try {

            const result = JSON.parse(output);

            console.log(
                "ML Prediction Result:",
                result
            );

            // ------------------------------------------------
            // Save prediction to history
            // ------------------------------------------------

            if (
                req.user &&
                req.user.id
            ) {

                try {

                    await savePrediction(
                        req.user.id,
                        movieName,
                        req.body,
                        result
                    );

                    console.log(
                        "Prediction saved successfully for user:",
                        req.user.id
                    );

                } catch (saveError) {

                    console.error(
                        "Failed to save prediction:",
                        saveError
                    );

                    return res.status(500).json({
                        message:
                            "Prediction was generated, but could not be saved to history.",
                        error:
                            saveError.message,
                    });
                }
            }

            // ------------------------------------------------
            // Return prediction
            // ------------------------------------------------

            return res.status(200).json(result);

        } catch (error) {

            console.error(
                "Invalid ML output:",
                output
            );

            console.error(
                "Parse error:",
                error
            );

            return res.status(500).json({
                message:
                    "Could not process ML prediction.",
            });
        }
    });
};

// ============================================================
// SAVE PREDICTION
// ============================================================

const savePrediction = async (
    userId,
    movieName,
    inputData,
    result
) => {

    let predictionValue;

    if (
        result.prediction === "SUCCESS"
    ) {

        predictionValue = "SUCCESS";

    } else if (
        result.prediction === "NOT SUCCESSFUL"
    ) {

        predictionValue = "LOW PROBABILITY";

    } else {

        predictionValue = "MODERATE";
    }

    const probabilityValue = Number(
        result.success_probability ?? 0
    );

    const prediction = new Prediction({

        // ----------------------------------------------------
        // User
        // ----------------------------------------------------

        userId,

        projectType: String(
            inputData.projectType || "feature"
        ).toLowerCase(),

        // ----------------------------------------------------
        // Project / movie name
        // ----------------------------------------------------

        movieName,

        // ----------------------------------------------------
        // Shared fields
        // ----------------------------------------------------

        budget: Number(
            inputData.budget || 0
        ),

        duration: Number(
            inputData.duration || 0
        ),

        genre:
            inputData.genre ||
            "Unknown",

        production_company:
            inputData.production_company ||
            "",

        original_language:
            inputData.original_language ||
            "",

        // ----------------------------------------------------
        // Feature-film fields
        // ----------------------------------------------------

        runtime: Number(
            inputData.runtime || 0
        ),

        release_month: Number(
            inputData.release_month || 0
        ),

        release_year: Number(
            inputData.release_year || 0
        ),

        // ----------------------------------------------------
        // Short-film fields
        // ----------------------------------------------------

        target_audience:
            inputData.target_audience ||
            "",

        distribution_platform:
            inputData.distribution_platform ||
            "",

        social_reach:
            inputData.social_reach ||
            "",

        promotion_plan:
            inputData.promotion_plan ||
            "",

        festival_submission:
            inputData.festival_submission ||
            "",

        // ----------------------------------------------------
        // Optional metadata
        // ----------------------------------------------------

        overview:
            inputData.overview ||
            "",

        tagline:
            inputData.tagline ||
            "",

        homepage:
            inputData.homepage ||
            "",

        keywords_count: Number(
            inputData.keywords_count || 0
        ),

        country_count: Number(
            inputData.country_count || 0
        ),

        language_count: Number(
            inputData.language_count || 0
        ),

        company_count: Number(
            inputData.company_count || 0
        ),

        genre_count: Number(
            inputData.genre_count || 1
        ),

        // ----------------------------------------------------
        // Legacy-safe values
        // ----------------------------------------------------

        rating: Number(
            inputData.rating || 0
        ),

        star_power: Number(
            inputData.star_power || 0
        ),

        competition: Number(
            inputData.competition || 0
        ),

        // ----------------------------------------------------
        // ML result
        // ----------------------------------------------------

        prediction:
            predictionValue,

        success_probability:
            probabilityValue,
    });

    await prediction.save();

    return prediction;
};

// ============================================================
// GET USER PREDICTION HISTORY
// ============================================================

const getUserPredictions = async (
    req,
    res
) => {

    try {

        const predictions =
            await Prediction.find({
                userId: req.user.id,
            })
            .sort({
                createdAt: -1,
            });

        return res.status(200).json(
            predictions
        );

    } catch (error) {

        console.error(
            "History Error:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to retrieve prediction history.",
            error:
                error.message,
        });
    }
};

// ============================================================
// GET SINGLE PREDICTION
// ============================================================

const getPredictionById = async (
    req,
    res
) => {

    try {

        const prediction =
            await Prediction.findOne({
                _id: req.params.id,
                userId: req.user.id,
            });

        if (!prediction) {

            return res.status(404).json({
                message:
                    "Prediction not found.",
            });
        }

        return res.status(200).json(
            prediction
        );

    } catch (error) {

        console.error(
            "Get Prediction Error:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to retrieve prediction.",
            error:
                error.message,
        });
    }
};

// ============================================================
// DELETE SINGLE PREDICTION
// ============================================================

const deletePrediction = async (
    req,
    res
) => {

    try {

        const prediction =
            await Prediction.findOneAndDelete({
                _id: req.params.id,
                userId: req.user.id,
            });

        if (!prediction) {

            return res.status(404).json({
                message:
                    "Prediction not found.",
            });
        }

        return res.status(200).json({
            message:
                "Prediction deleted successfully.",
        });

    } catch (error) {

        console.error(
            "Delete Prediction Error:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to delete prediction.",
            error:
                error.message,
        });
    }
};

// ============================================================
// CLEAR ALL PREDICTION HISTORY
// ============================================================

const clearPredictionHistory = async (
    req,
    res
) => {

    try {

        await Prediction.deleteMany({
            userId: req.user.id,
        });

        return res.status(200).json({
            message:
                "Prediction history cleared successfully.",
        });

    } catch (error) {

        console.error(
            "Clear History Error:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to clear prediction history.",
            error:
                error.message,
        });
    }
};

// ============================================================
// EXPORT CONTROLLERS
// ============================================================
module.exports = {
    predictMovie,
    getUserPredictions,
    getPredictionById,
    deletePrediction,
    clearPredictionHistory,
};