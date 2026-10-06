const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  getProfessionals,
  getProfessionalById,
  createProfessional,
  updateProfessional,
  deleteProfessional,
  createConnectionRequest,
} = require("../controllers/marketplaceController");

const router = express.Router();

router.get("/", getProfessionals);
router.post("/", authMiddleware, createProfessional);
router.post("/:id/connect", authMiddleware, createConnectionRequest);
router.get("/:id", getProfessionalById);
router.put("/:id", authMiddleware, updateProfessional);
router.delete("/:id", authMiddleware, deleteProfessional);

module.exports = router;