const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
    predictMovie,
    getUserPredictions,
    getPredictionById,
    deletePrediction,
    clearPredictionHistory,
} = require("../controllers/predictionController");

const router = express.Router();

router.post("/predict", authMiddleware, predictMovie);
router.get("/history", authMiddleware, getUserPredictions);
router.get("/:id", authMiddleware, getPredictionById);
router.delete("/:id", authMiddleware, deletePrediction);
router.delete("/history/clear", authMiddleware, clearPredictionHistory);

module.exports = router;