const express = require("express");

const {
  generateSmartNotifications,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  clearNotifications,
  getNotificationPreferences,
  updateNotificationPreferences,
} = require("../controllers/notificationController");

const {
  authenticateToken,
  requireFarmer,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticateToken);
router.use(requireFarmer);

router.post("/generate", generateSmartNotifications);
router.get("/", getNotifications);
router.patch("/:id/read", markNotificationRead);
router.patch("/read-all", markAllNotificationsRead);
router.delete("/", clearNotifications);

router.get("/preferences/me", getNotificationPreferences);
router.put("/preferences/me", updateNotificationPreferences);

module.exports = router;