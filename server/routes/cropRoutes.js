const express = require("express");
const router = express.Router();

const {
  getCrops,
  createCrop,
  updateCrop,
  deleteCrop,
} = require("../controllers/cropController");

const {
  authenticateToken,
  requireFarmer,
} = require("../middleware/authMiddleware");

/* All crop routes are farmer-only protected routes */
router.use(authenticateToken);
router.use(requireFarmer);

router.get("/", getCrops);
router.post("/", createCrop);
router.put("/:id", updateCrop);
router.delete("/:id", deleteCrop);

module.exports = router;