const pool = require("../config/db");

const getSchemes = async (req, res) => {
  try {
    const { state = "", category = "" } = req.query;

    const conditions = ["is_active = true"];
    const values = [];

    if (state) {
      values.push(state);
      conditions.push(
        `(LOWER(state) = LOWER($${values.length}) OR state = 'All India')`
      );
    }

    if (category) {
      values.push(category);
      conditions.push(`LOWER(category) = LOWER($${values.length})`);
    }

    const result = await pool.query(
      `SELECT *
       FROM government_schemes
       WHERE ${conditions.join(" AND ")}
       ORDER BY scheme_name ASC`,
      values
    );

    return res.status(200).json({
      schemes: result.rows,
    });
  } catch (error) {
    console.error("Get schemes error:", error);

    return res.status(500).json({
      message: "Could not load government schemes.",
    });
  }
};

module.exports = {
  getSchemes,
};