const pool = require("../config/db");

const toNumberOrNull = (value) => {
  if (value === "" || value === null || value === undefined) return null;

  const number = Number(value);
  return Number.isNaN(number) ? null : number;
};

const getLevel = (value, low, high) => {
  const number = toNumberOrNull(value);

  if (number === null) {
    return {
      status: "Not provided",
      tone: "warning",
    };
  }

  if (number < low) {
    return {
      status: "Low",
      tone: "danger",
    };
  }

  if (number > high) {
    return {
      status: "High",
      tone: "warning",
    };
  }

  return {
    status: "Moderate",
    tone: "success",
  };
};

const getStageAdvice = (stage) => {
  const advice = {
    Seedling:
      "Use gentle nutrition. Avoid heavy fertilizer because young roots are sensitive.",
    Vegetative:
      "Crop needs leaf and stem growth support. Avoid excess nitrogen because it can increase pests and weak growth.",
    Flowering:
      "Avoid excess nitrogen. Focus on flower retention, phosphorus support, potassium support, and stable irrigation.",
    Fruiting:
      "Potassium and steady moisture are important for fruit size and quality. Avoid sudden dry/wet stress.",
    Maturity:
      "Avoid unnecessary nitrogen. Focus on crop maturity, harvest quality, and disease monitoring.",
  };

  return advice[stage] || "Follow crop-stage based nutrient management.";
};

const buildFertilizerResult = (input) => {
  const nitrogenStatus = getLevel(input.nitrogen, 50, 120);
  const phosphorusStatus = getLevel(input.phosphorus, 25, 70);
  const potassiumStatus = getLevel(input.potassium, 120, 300);
  const soilPh = toNumberOrNull(input.soilPh);

  const observations = [];

  if (soilPh === null) {
    observations.push(
      "Soil pH is not provided. Add soil pH from a soil test for better guidance."
    );
  } else if (soilPh < 5.5) {
    observations.push(
      "Soil appears acidic. Nutrient availability may reduce in acidic soil."
    );
  } else if (soilPh > 7.8) {
    observations.push(
      "Soil appears alkaline. Some micronutrients may become less available."
    );
  } else {
    observations.push("Soil pH looks generally suitable for many crops.");
  }

  observations.push(`Nitrogen status: ${nitrogenStatus.status}.`);
  observations.push(`Phosphorus status: ${phosphorusStatus.status}.`);
  observations.push(`Potassium status: ${potassiumStatus.status}.`);

  const recommendations = [];

  if (nitrogenStatus.status === "Low") {
    recommendations.push(
      "Nitrogen may need attention for healthy vegetative growth. Use soil-test based local guidance."
    );
  } else if (nitrogenStatus.status === "High") {
    recommendations.push(
      "Avoid excess nitrogen. It can cause too much leaf growth and increase pest/disease risk."
    );
  }

  if (phosphorusStatus.status === "Low") {
    recommendations.push(
      "Phosphorus may need attention for root development, flowering, and early crop establishment."
    );
  }

  if (potassiumStatus.status === "Low") {
    recommendations.push(
      "Potassium may need attention for fruit quality, stress tolerance, and crop strength."
    );
  }

  if (input.growthStage === "Flowering") {
    recommendations.push(
      "During flowering, avoid excess nitrogen and maintain steady soil moisture."
    );
  }

  if (input.growthStage === "Fruiting") {
    recommendations.push(
      "During fruiting, potassium support and stable irrigation are important."
    );
  }

  if (recommendations.length === 0) {
    recommendations.push(
      "Nutrient values look generally balanced. Continue monitoring crop growth and soil moisture."
    );
  }

  return {
    cropName: input.cropName,
    growthStage: input.growthStage,
    stageAdvice: getStageAdvice(input.growthStage),
    observations,
    recommendations,
    warning:
      "This is general fertilizer guidance only. Do not apply exact fertilizer quantity without a soil test or local agriculture expert advice.",
  };
};

const getValidFarmAndCrop = async ({ userId, farmId, cropId }) => {
  let farm = null;
  let crop = null;

  if (cropId) {
    const cropResult = await pool.query(
      `SELECT *
       FROM crops
       WHERE id = $1 AND farmer_id = $2`,
      [cropId, userId]
    );

    crop = cropResult.rows[0] || null;
  }

  const finalFarmId = crop?.farm_id || farmId;

  if (finalFarmId) {
    const farmResult = await pool.query(
      `SELECT *
       FROM farms
       WHERE id = $1 AND farmer_id = $2`,
      [finalFarmId, userId]
    );

    farm = farmResult.rows[0] || null;
  }

  return { farm, crop };
};

const recommendFertilizer = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      farmId = null,
      cropId = null,
      cropName,
      growthStage,
      soilType,
      soilPh,
      nitrogen,
      phosphorus,
      potassium,
      irrigationType,
    } = req.body;

    const { farm, crop } = await getValidFarmAndCrop({
      userId,
      farmId,
      cropId,
    });

    const input = {
      farmId: farm?.id || null,
      cropId: crop?.id || null,
      cropName: cropName || crop?.crop_name || "",
      growthStage: growthStage || crop?.growth_stage || "Seedling",
      soilType: soilType || farm?.soil_type || "",
      soilPh: soilPh || crop?.soil_ph || "",
      nitrogen: nitrogen || crop?.nitrogen || "",
      phosphorus: phosphorus || crop?.phosphorus || "",
      potassium: potassium || crop?.potassium || "",
      irrigationType: irrigationType || farm?.irrigation_type || "",
    };

    if (!input.cropName.trim()) {
      return res.status(400).json({
        message: "Crop name is required.",
      });
    }

    const result = buildFertilizerResult(input);

    const insertResult = await pool.query(
      `INSERT INTO fertilizer_recommendations
       (
         user_id,
         farm_id,
         crop_id,
         crop_name,
         growth_stage,
         soil_type,
         soil_ph,
         nitrogen,
         phosphorus,
         potassium,
         irrigation_type,
         input_data,
         result
       )
       VALUES
       ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb, $13::jsonb)
       RETURNING *`,
      [
        userId,
        input.farmId,
        input.cropId,
        input.cropName,
        input.growthStage,
        input.soilType || null,
        toNumberOrNull(input.soilPh),
        toNumberOrNull(input.nitrogen),
        toNumberOrNull(input.phosphorus),
        toNumberOrNull(input.potassium),
        input.irrigationType || null,
        JSON.stringify(input),
        JSON.stringify(result),
      ]
    );

    return res.status(201).json({
      message: "Fertilizer recommendation generated.",
      recommendation: result,
      saved: insertResult.rows[0],
    });
  } catch (error) {
    console.error("Fertilizer recommendation error:", error);

    return res.status(500).json({
      message: "Could not generate fertilizer recommendation.",
      error: error.message,
    });
  }
};

const getFertilizerHistory = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *
       FROM fertilizer_recommendations
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [req.user.id]
    );

    return res.status(200).json({
      history: result.rows,
    });
  } catch (error) {
    console.error("Fertilizer history error:", error);

    return res.status(500).json({
      message: "Could not load fertilizer recommendation history.",
    });
  }
};

const deleteFertilizerHistoryItem = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      `DELETE FROM fertilizer_recommendations
       WHERE id = $1 AND user_id = $2`,
      [id, req.user.id]
    );

    return res.status(200).json({
      message: "Fertilizer recommendation deleted.",
    });
  } catch (error) {
    console.error("Delete fertilizer history error:", error);

    return res.status(500).json({
      message: "Could not delete fertilizer recommendation.",
    });
  }
};

module.exports = {
  recommendFertilizer,
  getFertilizerHistory,
  deleteFertilizerHistoryItem,
};