const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const createToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );
};

const formatUser = (user) => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    farmName: user.farm_name || "",
    location: user.location || "",
    farmSize: user.farm_size || "",
    farmingType: user.farming_type || "",
    address: user.address || "",
    createdAt: user.created_at,
  };
};

/* =====================================================
   POST /api/auth/register
===================================================== */
const register = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !phone || !password || !role) {
      return res.status(400).json({
        message: "Name, email, phone, password, and role are required.",
      });
    }

    if (!["farmer", "user"].includes(role)) {
      return res.status(400).json({
        message: "Role must be either farmer or user.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.replace(/\D/g, "").slice(-10);

    if (!/^\d{10}$/.test(cleanPhone)) {
      return res.status(400).json({
        message: "Please enter a valid 10-digit phone number.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must contain at least 6 characters.",
      });
    }

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1 OR phone = $2",
      [cleanEmail, cleanPhone]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: "An account already exists with this email or phone number.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `INSERT INTO users (name, email, phone, password, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name.trim(), cleanEmail, cleanPhone, hashedPassword, role]
    );

    const user = result.rows[0];
    const token = createToken(user);

    return res.status(201).json({
      message: "Account created successfully.",
      token,
      user: formatUser(user),
    });
  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      message: "Registration failed. Please try again.",
    });
  }
};

/* =====================================================
   POST /api/auth/login
===================================================== */
const login = async (req, res) => {
  try {
    const { identifier, password, role } = req.body;

    if (!identifier || !password || !role) {
      return res.status(400).json({
        message: "Email/phone, password, and role are required.",
      });
    }

    const cleanEmail = identifier.trim().toLowerCase();
    const cleanPhone = identifier.replace(/\D/g, "").slice(-10);

    const result = await pool.query(
      `SELECT *
       FROM users
       WHERE (email = $1 OR phone = $2)
       AND role = $3`,
      [cleanEmail, cleanPhone, role]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Account not found. Check email, phone number, and account type.",
      });
    }

    const user = result.rows[0];

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Incorrect password.",
      });
    }

    const token = createToken(user);

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: formatUser(user),
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Login failed. Please try again.",
    });
  }
};

module.exports = {
  register,
  login,
};
