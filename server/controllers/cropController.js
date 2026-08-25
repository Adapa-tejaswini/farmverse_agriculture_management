const pool = require("../config/db");

const formatCrop = (crop) => {
  return {
    id: crop.id,
    farmerId: crop.farmer_id,
    farmId: crop.farm_id,
    farmName: crop.farm_name || "",
    cropName: crop.crop_name,
    variety: crop.variety || "",
    season: crop.season || "",
    plantingDate: crop.planting_date,
    expectedHarvestDate: crop.expected_harvest_date,
    fieldArea: crop.field_area ? Number(crop.field_area) : "",
    soilPh: crop.soil_ph ? Number(crop.soil_ph) : "",
    nitrogen: crop.nitrogen ? Number(crop.nitrogen) : "",
    phosphorus: crop.phosphorus ? Number(crop.phosphorus) : "",
    potassium: crop.potassium ? Number(crop.potassium) : "",
    growthStage: crop.growth_stage || "",
    cropStatus: crop.crop_status || "",
    estimatedYield: crop.estimated_yield
      ? Number(crop.estimated_yield)
      : 0,
    actualYield: crop.actual_yield ? Number(crop.actual_yield) : 0,
    createdAt: crop.created_at,
    updatedAt: crop.updated_at,
  };
};

/* GET /api/crops */
const getCrops = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT crops.*, farms.farm_name
       FROM crops
       JOIN farms ON crops.farm_id = farms.id
       WHERE crops.farmer_id = $1
       ORDER BY crops.created_at DESC`,
      [req.user.id]
    );

    return res.status(200).json({
      crops: result.rows.map(formatCrop),
    });
  } catch (error) {
    console.error("Get crops error:", error);

    return res.status(500).json({
      message: "Could not fetch crop records.",
    });
  }
};

/* POST /api/crops */
const createCrop = async (req, res) => {
  try {
    const {
      farmId,
      cropName,
      variety,
      season,
      plantingDate,
      expectedHarvestDate,
      fieldArea,
      soilPh,
      nitrogen,
      phosphorus,
      potassium,
      growthStage,
      cropStatus,
      estimatedYield,
    } = req.body;

    if (!farmId || !cropName || !plantingDate) {
      return res.status(400).json({
        message: "Farm, crop name, and planting date are required.",
      });
    }

    /* Ensure farmer owns the selected farm */
    const farmCheck = await pool.query(
      `SELECT id
       FROM farms
       WHERE id = $1 AND farmer_id = $2`,
      [farmId, req.user.id]
    );

    if (farmCheck.rows.length === 0) {
      return res.status(403).json({
        message: "This farm does not belong to your account.",
      });
    }

    const result = await pool.query(
      `INSERT INTO crops (
        farmer_id,
        farm_id,
        crop_name,
        variety,
        season,
        planting_date,
        expected_harvest_date,
        field_area,
        soil_ph,
        nitrogen,
        phosphorus,
        potassium,
        growth_stage,
        crop_status,
        estimated_yield
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11, $12, $13, $14, $15
      )
      RETURNING *`,
      [
        req.user.id,
        Number(farmId),
        cropName.trim(),
        variety || null,
        season || null,
        plantingDate,
        expectedHarvestDate || null,
        fieldArea || null,
        soilPh || null,
        nitrogen || null,
        phosphorus || null,
        potassium || null,
        growthStage || "Seedling",
        cropStatus || "Planted",
        estimatedYield || 0,
      ]
    );

    return res.status(201).json({
      message: "Crop added successfully.",
      crop: formatCrop(result.rows[0]),
    });
  } catch (error) {
    console.error("Create crop error:", error);

    return res.status(500).json({
      message: "Could not add crop.",
    });
  }
};

/* PUT /api/crops/:id */
const updateCrop = async (req, res) => {
  try {
    const cropId = Number(req.params.id);

    const {
      farmId,
      cropName,
      variety,
      season,
      plantingDate,
      expectedHarvestDate,
      fieldArea,
      soilPh,
      nitrogen,
      phosphorus,
      potassium,
      growthStage,
      cropStatus,
      estimatedYield,
      actualYield,
    } = req.body;

    if (!cropId || !farmId || !cropName || !plantingDate) {
      return res.status(400).json({
        message: "Farm, crop name, and planting date are required.",
      });
    }

    /* Ensure selected farm belongs to current farmer */
    const farmCheck = await pool.query(
      `SELECT id
       FROM farms
       WHERE id = $1 AND farmer_id = $2`,
      [farmId, req.user.id]
    );

    if (farmCheck.rows.length === 0) {
      return res.status(403).json({
        message: "This farm does not belong to your account.",
      });
    }

    const result = await pool.query(
      `UPDATE crops
       SET
         farm_id = $1,
         crop_name = $2,
         variety = $3,
         season = $4,
         planting_date = $5,
         expected_harvest_date = $6,
         field_area = $7,
         soil_ph = $8,
         nitrogen = $9,
         phosphorus = $10,
         potassium = $11,
         growth_stage = $12,
         crop_status = $13,
         estimated_yield = $14,
         actual_yield = $15,
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $16 AND farmer_id = $17
       RETURNING *`,
      [
        Number(farmId),
        cropName.trim(),
        variety || null,
        season || null,
        plantingDate,
        expectedHarvestDate || null,
        fieldArea || null,
        soilPh || null,
        nitrogen || null,
        phosphorus || null,
        potassium || null,
        growthStage || "Seedling",
        cropStatus || "Planted",
        estimatedYield || 0,
        actualYield || 0,
        cropId,
        req.user.id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Crop not found or you do not have access to it.",
      });
    }

    return res.status(200).json({
      message: "Crop updated successfully.",
      crop: formatCrop(result.rows[0]),
    });
  } catch (error) {
    console.error("Update crop error:", error);

    return res.status(500).json({
      message: "Could not update crop.",
    });
  }
};

/* DELETE /api/crops/:id */
const deleteCrop = async (req, res) => {
  try {
    const cropId = Number(req.params.id);

    if (!cropId) {
      return res.status(400).json({
        message: "Invalid crop ID.",
      });
    }

    const result = await pool.query(
      `DELETE FROM crops
       WHERE id = $1 AND farmer_id = $2
       RETURNING id`,
      [cropId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Crop not found or you do not have access to it.",
      });
    }

    return res.status(200).json({
      message: "Crop deleted successfully.",
    });
  } catch (error) {
    console.error("Delete crop error:", error);

    return res.status(500).json({
      message: "Could not delete crop.",
    });
  }
};

module.exports = {
  getCrops,
  createCrop,
  updateCrop,
  deleteCrop,
};