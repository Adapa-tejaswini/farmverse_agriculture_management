const jwt = require("jsonwebtoken");

/*
  Checks whether the request contains a valid JWT token.

  Frontend must send:
  Authorization: Bearer YOUR_TOKEN_HERE
*/
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Access denied. Please sign in first.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    /*
      decoded contains:
      {
        id: user.id,
        email: user.email,
        role: user.role
      }
    */
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Your login session is invalid or expired. Please sign in again.",
    });
  }
};

/* Only users registered as farmers can create/manage farms */
const requireFarmer = (req, res, next) => {
  if (req.user.role !== "farmer") {
    return res.status(403).json({
      message: "Only farmer accounts can access farm management.",
    });
  }

  next();
};

module.exports = {
  authenticateToken,
  requireFarmer,
};