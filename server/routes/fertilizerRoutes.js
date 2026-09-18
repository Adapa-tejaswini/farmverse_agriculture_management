const express = require("express");

const {
  recommendFertilizer,
  getFertilizerHistory,
  deleteFertilizerHistoryItem,
} = require("../controllers/fertilizerController");

const {
  authenticateToken,
  requireFarmer,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticateToken);
router.use(requireFarmer);

router.post("/recommend", recommendFertilizer);
router.get("/history", getFertilizerHistory);
router.delete("/history/:id", deleteFertilizerHistoryItem);

module.exports = router;