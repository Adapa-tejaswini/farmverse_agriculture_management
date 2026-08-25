const pool = require("../config/db");

/* Convert PostgreSQL snake_case fields to React camelCase fields */
const formatFarm = (farm) => {
  return {
    id: farm.id,
    farmerId: farm.farmer_id,
    farmName: farm.farm_name,
    location: farm.location,
    landSize: Number(farm.land_size),
    landUnit: farm.land_unit,
    soilType: farm.soil_type || "",
    irrigationType: farm.irrigation_type || "",
    farmingType: farm.farming_type || "",
    createdAt: farm.created_at,
    updatedAt: farm.updated_at,
  };
};

/* =====================================================
   GET /api/farms
   Get every farm belonging to the logged-in farmer
===================================================== */
const getFarms = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *
       FROM farms
       WHERE farmer_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    return res.status(200).json({
      farms: result.rows.map(formatFarm),
    });
  } catch (error) {
    console.error("Get farms error:", error);

    return res.status(500).json({
      message: "Could not fetch farms.",
    });
  }
};

/* =====================================================
   POST /api/farms
   Add a new farm
===================================================== */
const createFarm = async (req, res) => {
  try {
    const {
      farmName,
      location,
      landSize,
      landUnit,
      soilType,
      irrigationType,
      farmingType,
    } = req.body;

    if (!farmName || !location || !landSize) {
      return res.status(400).json({
        message: "Farm name, location, and land size are required.",
      });
    }

    if (Number(landSize) <= 0) {
      return res.status(400).json({
        message: "Land size must be greater than zero.",
      });
    }

    const result = await pool.query(
      `INSERT INTO farms
        (
          farmer_id,
          farm_name,
          location,
          land_size,
          land_unit,
          soil_type,
          irrigation_type,
          farming_type
        )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        req.user.id,
        farmName.trim(),
        location.trim(),
        Number(landSize),
        landUnit || "acres",
        soilType || null,
        irrigationType || null,
        farmingType || null,
      ]
    );

    return res.status(201).json({
      message: "Farm added successfully.",
      farm: formatFarm(result.rows[0]),
    });
  } catch (error) {
    console.error("Create farm error:", error);

    return res.status(500).json({
      message: "Could not add farm.",
    });
  }
};

/* =====================================================
   PUT /api/farms/:id
   Edit one farm owned by logged-in farmer
===================================================== */
const updateFarm = async (req, res) => {
  try {
    const farmId = Number(req.params.id);

    const {
      farmName,
      location,
      landSize,
      landUnit,
      soilType,
      irrigationType,
      farmingType,
    } = req.body;

    if (!farmId) {
      return res.status(400).json({
        message: "Invalid farm ID.",
      });
    }

    if (!farmName || !location || !landSize) {
      return res.status(400).json({
        message: "Farm name, location, and land size are required.",
      });
    }

    if (Number(landSize) <= 0) {
      return res.status(400).json({
        message: "Land size must be greater than zero.",
      });
    }

    /*
      farmer_id = req.user.id is important:
      a farmer can only update their own farm.
    */
    const result = await pool.query(
      `UPDATE farms
       SET
         farm_name = $1,
         location = $2,
         land_size = $3,
         land_unit = $4,
         soil_type = $5,
         irrigation_type = $6,
         farming_type = $7,
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 AND farmer_id = $9
       RETURNING *`,
      [
        farmName.trim(),
        location.trim(),
        Number(landSize),
        landUnit || "acres",
        soilType || null,
        irrigationType || null,
        farmingType || null,
        farmId,
        req.user.id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Farm not found or you do not have access to it.",
      });
    }

    return res.status(200).json({
      message: "Farm updated successfully.",
      farm: formatFarm(result.rows[0]),
    });
  } catch (error) {
    console.error("Update farm error:", error);

    return res.status(500).json({
      message: "Could not update farm.",
    });
  }
};

/* =====================================================
   DELETE /api/farms/:id
   Deletes farm and its linked crops automatically
   (because SQL uses ON DELETE CASCADE)
===================================================== */
const deleteFarm = async (req, res) => {
  try {
    const farmId = Number(req.params.id);

    if (!farmId) {
      return res.status(400).json({
        message: "Invalid farm ID.",
      });
    }

    const result = await pool.query(
      `DELETE FROM farms
       WHERE id = $1 AND farmer_id = $2
       RETURNING id`,
      [farmId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Farm not found or you do not have access to it.",
      });
    }

    return res.status(200).json({
      message: "Farm deleted successfully. Linked crop records were removed.",
    });
  } catch (error) {
    console.error("Delete farm error:", error);

    return res.status(500).json({
      message: "Could not delete farm.",
    });
  }
};

module.exports = {
  getFarms,
  createFarm,
  updateFarm,
  deleteFarm,
};