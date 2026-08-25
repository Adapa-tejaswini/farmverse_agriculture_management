const express = require("express");
const router = express.Router();

const {
  sendMessage,
  getHistory,
  clearHistory,
} = require("../controllers/chatbotController");

const {
  authenticateToken,
  requireFarmer,
} = require("../middleware/authMiddleware");

router.use(authenticateToken);
router.use(requireFarmer);

router.post("/message", sendMessage);
router.get("/history", getHistory);
router.delete("/history", clearHistory);

module.exports = router;