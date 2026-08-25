const express = require("express");
const router = express.Router();

const {
  getFarms,
  createFarm,
  updateFarm,
  deleteFarm,
} = require("../controllers/farmController");

const {
  authenticateToken,
  requireFarmer,
} = require("../middleware/authMiddleware");

/*
  Every farm route requires:
  1. Valid JWT token
  2. Logged-in user role must be "farmer"
*/
router.use(authenticateToken);
router.use(requireFarmer);

router.get("/", getFarms);
router.post("/", createFarm);
router.put("/:id", updateFarm);
router.delete("/:id", deleteFarm);

module.exports = router;