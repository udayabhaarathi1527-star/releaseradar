const express = require("express");

const {
    predictMovie
} = require("../controllers/predictionController");

const router = express.Router();

router.post("/predict", predictMovie);

module.exports = router;