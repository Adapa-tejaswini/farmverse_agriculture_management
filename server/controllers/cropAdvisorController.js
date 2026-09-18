const pool = require("../config/db");

const cropCatalog = [
  {
    crop: "Tomato",
    seasons: ["Rabi", "Zaid"],
    soils: ["Loamy", "Red Soil", "Black Soil"],
    water: ["Medium", "High"],
    irrigation: ["Drip Irrigation", "Sprinkler", "Borewell"],
    reason: "Suitable for controlled irrigation and good market demand.",
  },
  {
    crop: "Onion",
    seasons: ["Rabi"],
    soils: ["Black Soil", "Loamy"],
    water: ["Medium"],
    irrigation: ["Drip Irrigation", "Borewell"],
    reason: "Good option for Rabi season with well-drained soil.",
  },
  {
    crop: "Chickpea",
    seasons: ["Rabi"],
    soils: ["Black Soil", "Red Soil", "Loamy"],
    water: ["Low", "Medium"],
    irrigation: ["Rain-fed", "Borewell", "Drip Irrigation"],
    reason: "Needs comparatively less water and suits Rabi season.",
  },
  {
    crop: "Wheat",
    seasons: ["Rabi"],
    soils: ["Loamy", "Clay", "Black Soil"],
    water: ["Medium", "High"],
    irrigation: ["Canal", "Borewell", "Sprinkler"],
    reason: "Common Rabi crop where irrigation is available.",
  },
  {
    crop: "Soybean",
    seasons: ["Kharif"],
    soils: ["Black Soil", "Loamy"],
    water: ["Medium"],
    irrigation: ["Rain-fed", "Drip Irrigation"],
    reason: "Popular Kharif crop for black soil regions.",
  },
  {
    crop: "Cotton",
    seasons: ["Kharif"],
    soils: ["Black Soil"],
    water: ["Medium"],
    irrigation: ["Rain-fed", "Drip Irrigation", "Borewell"],
    reason: "Black soil retains moisture and supports cotton growth.",
  },
  {
    crop: "Maize",
    seasons: ["Kharif", "Rabi", "Zaid"],
    soils: ["Loamy", "Red Soil", "Black Soil"],
    water: ["Medium", "High"],
    irrigation: ["Rain-fed", "Sprinkler", "Borewell"],
    reason: "Flexible crop across seasons with proper water management.",
  },
  {
    crop: "Groundnut",
    seasons: ["Kharif", "Zaid"],
    soils: ["Sandy", "Red Soil", "Loamy"],
    water: ["Low", "Medium"],
    irrigation: ["Rain-fed", "Sprinkler", "Borewell"],
    reason: "Works well in light and well-drained soils.",
  },
  {
    crop: "Bajra",
    seasons: ["Kharif", "Zaid"],
    soils: ["Sandy", "Red Soil"],
    water: ["Low"],
    irrigation: ["Rain-fed"],
    reason: "Drought tolerant and suitable where water availability is low.",
  },
  {
    crop: "Watermelon",
    seasons: ["Zaid"],
    soils: ["Sandy", "Loamy"],
    water: ["Medium", "High"],
    irrigation: ["Drip Irrigation", "Borewell"],
    reason: "Good summer crop with drip irrigation and warm conditions.",
  },
];

const scoreCrop = (item, input) => {
  let score = 0;
  const reasons = [];

  if (input.season && item.seasons.includes(input.season)) {
    score += 3;
    reasons.push(`Matches ${input.season} season.`);
  }

  if (input.soilType && item.soils.includes(input.soilType)) {
    score += 2;
    reasons.push(`Suitable for ${input.soilType}.`);
  }

  if (input.waterAvailability && item.water.includes(input.waterAvailability)) {
    score += 2;
    reasons.push(
      `Fits ${input.waterAvailability.toLowerCase()} water availability.`
    );
  }

  if (input.irrigationType && item.irrigation.includes(input.irrigationType)) {
    score += 1;
    reasons.push(`Matches ${input.irrigationType}.`);
  }

  return {
    ...item,
    score,
    reasons,
  };
};

const getValidFarm = async ({ userId, farmId }) => {
  if (!farmId) return null;

  const result = await pool.query(
    `SELECT *
     FROM farms
     WHERE id = $1 AND farmer_id = $2`,
    [farmId, userId]
  );

  return result.rows[0] || null;
};

const recommendCrops = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      farmId = null,
      location,
      season,
      soilType,
      waterAvailability,
      irrigationType,
      farmingType,
    } = req.body;

    const farm = await getValidFarm({ userId, farmId });

    const input = {
      farmId: farm?.id || null,
      location: location || farm?.location || "",
      season: season || "",
      soilType: soilType || farm?.soil_type || "",
      waterAvailability: waterAvailability || "",
      irrigationType: irrigationType || farm?.irrigation_type || "",
      farmingType: farmingType || farm?.farming_type || "",
    };

    if (!input.season || !input.waterAvailability) {
      return res.status(400).json({
        message: "Season and water availability are required.",
      });
    }

    const recommendations = cropCatalog
      .map((crop) => scoreCrop(crop, input))
      .filter((crop) => crop.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    const insertResult = await pool.query(
      `INSERT INTO crop_recommendations
       (
         user_id,
         farm_id,
         location,
         season,
         soil_type,
         water_availability,
         irrigation_type,
         farming_type,
         input_data,
         recommended_crops
       )
       VALUES
       ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10::jsonb)
       RETURNING *`,
      [
        userId,
        input.farmId,
        input.location || null,
        input.season,
        input.soilType || null,
        input.waterAvailability,
        input.irrigationType || null,
        input.farmingType || null,
        JSON.stringify(input),
        JSON.stringify(recommendations),
      ]
    );

    return res.status(201).json({
      message: "Crop recommendations generated.",
      recommendedCrops: recommendations,
      saved: insertResult.rows[0],
    });
  } catch (error) {
    console.error("Crop recommendation error:", error);

    return res.status(500).json({
      message: "Could not generate crop recommendation.",
      error: error.message,
    });
  }
};

const getCropRecommendationHistory = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *
       FROM crop_recommendations
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [req.user.id]
    );

    return res.status(200).json({
      history: result.rows,
    });
  } catch (error) {
    console.error("Crop recommendation history error:", error);

    return res.status(500).json({
      message: "Could not load crop recommendation history.",
    });
  }
};

const deleteCropRecommendationHistoryItem = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      `DELETE FROM crop_recommendations
       WHERE id = $1 AND user_id = $2`,
      [id, req.user.id]
    );

    return res.status(200).json({
      message: "Crop recommendation deleted.",
    });
  } catch (error) {
    console.error("Delete crop recommendation error:", error);

    return res.status(500).json({
      message: "Could not delete crop recommendation.",
    });
  }
};

module.exports = {
  recommendCrops,
  getCropRecommendationHistory,
  deleteCropRecommendationHistoryItem,
};