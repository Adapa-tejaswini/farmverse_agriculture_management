const express = require("express");

const {
  recommendCrops,
  getCropRecommendationHistory,
  deleteCropRecommendationHistoryItem,
} = require("../controllers/cropAdvisorController");

const {
  authenticateToken,
  requireFarmer,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticateToken);
router.use(requireFarmer);

router.post("/recommend", recommendCrops);
router.get("/history", getCropRecommendationHistory);
router.delete("/history/:id", deleteCropRecommendationHistoryItem);

module.exports = router;