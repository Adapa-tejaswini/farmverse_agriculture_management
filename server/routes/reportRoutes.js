const express = require("express");
const router = express.Router();

const { getCropReports } = require("../controllers/reportController");

const {
  authenticateToken,
  requireFarmer,
} = require("../middleware/authMiddleware");

// Protect this route: User must be logged in AND have the 'farmer' role
router.use(authenticateToken);
router.use(requireFarmer);

// GET /api/reports/crops
router.get("/crops", getCropReports);

module.exports = router;