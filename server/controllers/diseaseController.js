const pool = require("../config/db");

const getDiseaseScanHistory = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *
       FROM disease_scans
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [req.user.id]
    );

    return res.status(200).json({
      history: result.rows,
    });
  } catch (error) {
    console.error("Disease scan history error:", error);

    return res.status(500).json({
      message: "Could not load disease scan history.",
    });
  }
};

const deleteDiseaseScan = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      `DELETE FROM disease_scans
       WHERE id = $1 AND user_id = $2`,
      [id, req.user.id]
    );

    return res.status(200).json({
      message: "Disease scan deleted.",
    });
  } catch (error) {
    console.error("Delete disease scan error:", error);

    return res.status(500).json({
      message: "Could not delete disease scan.",
    });
  }
};

module.exports = {
  getDiseaseScanHistory,
  deleteDiseaseScan,
};