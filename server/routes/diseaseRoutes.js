const express = require("express");

const {
  getDiseaseScanHistory,
  deleteDiseaseScan,
} = require("../controllers/diseaseController");

const {
  authenticateToken,
  requireFarmer,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticateToken);
router.use(requireFarmer);

router.get("/history", getDiseaseScanHistory);
router.delete("/history/:id", deleteDiseaseScan);

module.exports = router;