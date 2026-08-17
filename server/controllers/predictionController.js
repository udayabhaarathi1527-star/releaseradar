const { spawn } = require("child_process");
const path = require("path");

const predictMovie = (req, res) => {
    const {
        budget,
        marketing_budget,
        rating,
        runtime,
        star_power,
        competition,
        genre,
        release_month
    } = req.body;

    // Basic validation
    if (
        budget === undefined ||
        marketing_budget === undefined ||
        rating === undefined ||
        runtime === undefined ||
        star_power === undefined ||
        competition === undefined ||
        !genre ||
        release_month === undefined
    ) {
        return res.status(400).json({
            message: "All movie prediction fields are required."
        });
    }

    const pythonScript = path.join(
        __dirname,
        "../../ml/predict_api.py"
    );

    const pythonProcess = spawn("python", [
        pythonScript,
        budget,
        marketing_budget,
        rating,
        runtime,
        star_power,
        competition,
        genre,
        release_month
    ]);

    let output = "";
    let errorOutput = "";

    pythonProcess.stdout.on("data", (data) => {
        output += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
        errorOutput += data.toString();
    });

    pythonProcess.on("close", (code) => {
        if (code !== 0) {
            console.error(errorOutput);

            return res.status(500).json({
                message: "ML prediction failed.",
                error: errorOutput
            });
        }

        try {
            const result = JSON.parse(output);

            res.json(result);
        } catch (error) {
            console.error("Invalid ML output:", output);

            res.status(500).json({
                message: "Could not process ML prediction."
            });
        }
    });
};

module.exports = {
    predictMovie
};