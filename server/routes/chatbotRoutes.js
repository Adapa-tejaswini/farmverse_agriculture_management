const express = require("express");
const multer = require("multer");

const router = express.Router();

const {
  sendMessage,
  analyzeLeafImage,
  getHistory,
  clearHistory,
} = require("../controllers/chatbotController");

const {
  authenticateToken,
  requireFarmer,
} = require("../middleware/authMiddleware");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed."));
    }

    cb(null, true);
  },
});

const uploadLeafImage = (req, res, next) => {
  upload.single("image")(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          message: "Image size must be less than 5 MB.",
        });
      }

      return res.status(400).json({
        message: error.message || "Image upload failed.",
      });
    }

    if (error) {
      return res.status(400).json({
        message: error.message || "Only image files are allowed.",
      });
    }

    next();
  });
};

router.use(authenticateToken);
router.use(requireFarmer);

router.post("/message", sendMessage);
router.post("/leaf-image", uploadLeafImage, analyzeLeafImage);

router.get("/history", getHistory);
router.delete("/history", clearHistory);

module.exports = router;