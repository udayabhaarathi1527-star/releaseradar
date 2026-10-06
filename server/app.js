require("dotenv").config();

const express = require("express");
const cors = require("cors");

const movieRoutes = require("./routes/movieRoutes");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const predictionRoutes = require("./routes/predictionRoutes");
const { seedMovieLibrary } = require("./controllers/movieController");
const marketplaceRoutes = require("./routes/marketplaceRoutes");
const opportunityRoutes = require("./routes/opportunityRoutes");
const { seedMarketplace } = require("./controllers/marketplaceController");
const { seedOpportunities } = require("./controllers/opportunityController");

const app = express();

// Connect Database
connectDB().then(() => {
    seedMovieLibrary().catch((error) => {
        console.error("Movie library seed error:", error.message);
    });
    seedMarketplace().catch((error) => {
        console.error("Marketplace seed error:", error.message);
    });
    seedOpportunities().catch((error) => {
        console.error("Opportunity seed error:", error.message);
    });
}).catch((error) => {
    console.error("Database connection error:", error.message);
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/prediction", predictionRoutes);
app.use("/api/marketplace", marketplaceRoutes);
app.use("/api/opportunities", opportunityRoutes);

// Home Route
app.get("/", (req, res) => {
    res.send("Welcome to ReleaseRadar Backend!");
});

// Port
const PORT = process.env.PORT || 5000;

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});