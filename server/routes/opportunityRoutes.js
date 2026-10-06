const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  getOpportunities,
  getOpportunityById,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
} = require("../controllers/opportunityController");

const router = express.Router();

router.get("/", getOpportunities);
router.post("/", authMiddleware, createOpportunity);
router.get("/:id", getOpportunityById);
router.put("/:id", authMiddleware, updateOpportunity);
router.delete("/:id", authMiddleware, deleteOpportunity);

module.exports = router;