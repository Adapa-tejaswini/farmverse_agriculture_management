const express = require("express");

const { getSchemes } = require("../controllers/schemeController");

const {
  authenticateToken,
  requireFarmer,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticateToken);
router.use(requireFarmer);

router.get("/", getSchemes);

module.exports = router;