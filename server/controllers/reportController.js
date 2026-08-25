const pool = require("../config/db");

/*
  GET /api/reports/crops

  Generates a comprehensive report for the logged-in farmer including:
  1. Summary counts (farms, crops, yield)
  2. Crop status distribution (for Pie Chart)
  3. Yield analysis per crop (for Bar Chart)
  4. Upcoming harvest schedule
  5. Soil data readiness
*/
const getCropReports = async (req, res) => {
  try {
    const farmerId = req.user.id;

    // 1. Get Overall Summary Statistics
    const summaryQuery = await pool.query(
      `SELECT
        (SELECT COUNT(*) FROM farms WHERE farmer_id = $1) AS total_farms,
        (SELECT COUNT(*) FROM crops WHERE farmer_id = $1) AS total_crops,
        (SELECT COUNT(*) FROM crops WHERE farmer_id = $1 AND crop_status = 'Harvested') AS harvested_crops,
        (SELECT COUNT(*) FROM crops WHERE farmer_id = $1 AND crop_status != 'Harvested') AS active_crops,
        (SELECT COALESCE(SUM(estimated_yield), 0) FROM crops WHERE farmer_id = $1) AS total_estimated_yield,
        (SELECT COUNT(*) FROM produce_listings WHERE farmer_id = $1 AND listing_status = 'Active') AS active_listings
      `,
      [farmerId]
    );

    const summary = summaryQuery.rows[0];

    // 2. Get Crop Status Distribution (Group By)
    const statusQuery = await pool.query(
      `SELECT
        crop_status AS status,
        COUNT(*) AS count
      FROM crops
      WHERE farmer_id = $1
      GROUP BY crop_status`,
      [farmerId]
    );

    // 3. Get Yield Analysis by Crop Name
    const yieldQuery = await pool.query(
      `SELECT
        crop_name,
        SUM(estimated_yield) AS estimated_yield
      FROM crops
      WHERE farmer_id = $1
      GROUP BY crop_name
      ORDER BY estimated_yield DESC`,
      [farmerId]
    );

    // 4. Get Upcoming Harvests (Next 5)
    const harvestQuery = await pool.query(
      `SELECT
        crops.id,
        crops.crop_name,
        crops.growth_stage,
        crops.expected_harvest_date,
        farms.farm_name
      FROM crops
      JOIN farms ON crops.farm_id = farms.id
      WHERE crops.farmer_id = $1
      AND crops.crop_status != 'Harvested'
      AND crops.expected_harvest_date IS NOT NULL
      ORDER BY crops.expected_harvest_date ASC
      LIMIT 5`,
      [farmerId]
    );

    // 5. Get Soil Data Coverage
    const soilQuery = await pool.query(
      `SELECT
        COUNT(*) FILTER (
          WHERE soil_ph IS NOT NULL 
          OR nitrogen IS NOT NULL 
          OR phosphorus IS NOT NULL 
          OR potassium IS NOT NULL
        ) AS with_soil_data,
        COUNT(*) AS total_crops
      FROM crops
      WHERE farmer_id = $1`,
      [farmerId]
    );

    const soilData = soilQuery.rows[0];

    // Format the final response
    return res.status(200).json({
      summary: {
        totalFarms: Number(summary.total_farms),
        totalCrops: Number(summary.total_crops),
        activeCrops: Number(summary.active_crops),
        harvestedCrops: Number(summary.harvested_crops),
        estimatedYield: Number(summary.total_estimated_yield),
        activeListings: Number(summary.active_listings),
      },
      statusDistribution: statusQuery.rows.map((row) => ({
        name: row.status,
        value: Number(row.count),
      })),
      yieldByCrop: yieldQuery.rows.map((row) => ({
        crop: row.crop_name,
        yield: Number(row.estimated_yield),
      })),
      upcomingHarvests: harvestQuery.rows.map((row) => ({
        id: row.id,
        cropName: row.crop_name,
        farmName: row.farm_name,
        growthStage: row.growth_stage,
        expectedHarvestDate: row.expected_harvest_date,
      })),
      soilDataCoverage: {
        withSoilData: Number(soilData.with_soil_data),
        totalCrops: Number(soilData.total_crops),
      },
    });
  } catch (error) {
    console.error("Crop report generation error:", error);

    return res.status(500).json({
      message: "Could not generate crop report.",
    });
  }
};

module.exports = {
  getCropReports,
};