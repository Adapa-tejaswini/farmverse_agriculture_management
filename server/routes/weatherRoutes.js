const express = require("express");
const router = express.Router();

const {
  getFarmWeather,
  getWeatherByLocation,
} = require("../controllers/weatherController");

const {
  authenticateToken,
  requireFarmer,
} = require("../middleware/authMiddleware");

/*
  Only logged-in farmers can use Farmverse weather features.
*/
router.use(authenticateToken);
router.use(requireFarmer);

/*
  Example:
  GET /api/weather/location?location=Nashik
*/
router.get("/location", getWeatherByLocation);

/*
  Example:
  GET /api/weather/farm/1
*/
router.get("/farm/:farmId", getFarmWeather);

module.exports = router;