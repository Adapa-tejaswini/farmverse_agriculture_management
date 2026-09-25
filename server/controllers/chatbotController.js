const { GoogleGenerativeAI } = require("@google/generative-ai");
const pool = require("../config/db");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/*
  Fallback models:
  If one Gemini model is busy, backend will try the next one.
*/
const uniqueModels = (models) => {
  return [...new Set(models.filter(Boolean))];
};

const TEXT_MODELS = uniqueModels([
  process.env.GEMINI_TEXT_MODEL,
  "gemini-3.8-flash",
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash",
]);

const VISION_MODELS = uniqueModels([
  process.env.GEMINI_VISION_MODEL,
  process.env.GEMINI_TEXT_MODEL,
  "gemini-3.8-flash",
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash",
]);

const LANGUAGE_NAMES = {
  "en-IN": "English",
  "hi-IN": "Hindi",
  "kn-IN": "Kannada",
  "mr-IN": "Marathi",
  "te-IN": "Telugu",
  "ta-IN": "Tamil",
};

const getLanguageName = (languageCode) => {
  return LANGUAGE_NAMES[languageCode] || "English";
};

const buildLanguageInstruction = (languageCode) => {
  const languageName = getLanguageName(languageCode);

  return `
Important language rule:
- You MUST answer in ${languageName}.
- Use ${languageName} naturally.
- Keep farming terms simple for Indian farmers.
- If a technical agriculture term is difficult, mention the English term in brackets once.
`;
};

const buildSystemPrompt = (farmerContext) => {
  return `
You are Farmverse Crop Assistant, an AI assistant for Indian farmers.

You must answer ONLY questions related to:
- crops and crop stages
- irrigation and water management
- rainfall and weather impact on crops
- soil health
- fertilizers and nutrients
- pests and crop diseases
- harvesting
- yield planning
- farm management
- the farmer's Farmverse crop records
- uploaded crop/leaf/plant images for possible pest, disease, or nutrient issue guidance

Rules:
1. Use simple and practical language suitable for farmers.
2. Keep answers concise. Use short bullet points where useful.
3. If the question is not related to farming or crops, say:
   "I am Farmverse Crop Assistant. I can help only with crops, farms, irrigation, weather, fertilizer guidance, pests, diseases, and harvesting."
4. Never provide exact pesticide, fungicide, insecticide, or fertilizer chemical dosage.
5. For chemical application or serious disease issues, advise:
   "Please consult a local agriculture officer, Krishi Vigyan Kendra (KVK), or certified agriculture expert for exact dosage."
6. Do not claim guaranteed results.
7. Do not diagnose plant disease with certainty. Say "possible", "may be", or "looks like".
8. For image analysis, if image is unclear, ask for a clearer photo of:
   - full plant
   - close-up leaf
   - underside of leaf
   - affected field area
9. If an answer language is provided, strictly answer in that language.

Farmer's current Farmverse records:
${farmerContext}
`;
};

const getFarmerContext = async (userId) => {
  const farmerResult = await pool.query(
    `SELECT name, location
     FROM users
     WHERE id = $1`,
    [userId]
  );

  const farmer = farmerResult.rows[0];

  const farmsResult = await pool.query(
    `SELECT id, farm_name, location, land_size, land_unit, soil_type, irrigation_type
     FROM farms
     WHERE farmer_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );

  const cropsResult = await pool.query(
    `SELECT
       crops.crop_name,
       crops.variety,
       crops.season,
       crops.growth_stage,
       crops.crop_status,
       crops.planting_date,
       crops.expected_harvest_date,
       crops.estimated_yield,
       farms.farm_name,
       farms.location
     FROM crops
     JOIN farms ON crops.farm_id = farms.id
     WHERE crops.farmer_id = $1
     ORDER BY crops.created_at DESC
     LIMIT 10`,
    [userId]
  );

  let context = `Farmer name: ${farmer?.name || "Not available"}.\n`;
  context += `Primary location: ${farmer?.location || "Not available"}.\n\n`;

  if (farmsResult.rows.length === 0) {
    context += "No farm records have been added yet.\n";
  } else {
    context += "Farm records:\n";

    farmsResult.rows.forEach((farm) => {
      context += `- ${farm.farm_name}, ${farm.location}, ${farm.land_size} ${
        farm.land_unit
      }. Soil: ${farm.soil_type || "not recorded"}. Irrigation: ${
        farm.irrigation_type || "not recorded"
      }.\n`;
    });
  }

  if (cropsResult.rows.length === 0) {
    context += "\nNo crop records have been added yet.\n";
  } else {
    context += "\nCrop records:\n";

    cropsResult.rows.forEach((crop) => {
      context += `- Crop: ${crop.crop_name}. Farm: ${crop.farm_name}, ${
        crop.location
      }. Season: ${crop.season || "not recorded"}. Status: ${
        crop.crop_status || "not recorded"
      }. Growth stage: ${crop.growth_stage || "not recorded"}. Planting date: ${
        crop.planting_date || "not recorded"
      }. Expected harvest: ${
        crop.expected_harvest_date || "not recorded"
      }. Estimated yield: ${crop.estimated_yield || "not recorded"} kg.\n`;
    });
  }

  return context;
};

const fileToGenerativePart = (file) => {
  return {
    inlineData: {
      data: file.buffer.toString("base64"),
      mimeType: file.mimetype,
    },
  };
};

const shouldTryNextModel = (error) => {
  const message = String(error.message || "").toLowerCase();

  return (
    error.status === 503 ||
    error.status === 429 ||
    error.status === 404 ||
    message.includes("high demand") ||
    message.includes("service unavailable") ||
    message.includes("quota") ||
    message.includes("not found") ||
    message.includes("not supported")
  );
};

const generateWithFallback = async ({
  models,
  contents,
  systemInstruction,
}) => {
  let lastError = null;

  for (const modelName of models) {
    try {
      console.log(`Trying Gemini model: ${modelName}`);

      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction,
      });

      const result = await model.generateContent(contents);
      const text = result.response.text();

      return {
        text,
        modelUsed: modelName,
      };
    } catch (error) {
      lastError = error;

      console.error(
        `Gemini model failed: ${modelName}`,
        error.status || "",
        error.message
      );

      if (!shouldTryNextModel(error)) {
        throw error;
      }
    }
  }

  throw lastError;
};

/*
  Important:
  Frontend farms/crops can contain localStorage-generated IDs.
  Those IDs can be very large values such as:

  1788338679846

  PostgreSQL INTEGER only supports:

  -2147483648 to 2147483647

  Therefore, validate IDs BEFORE sending them to PostgreSQL.
*/

const getValidRecordRefs = async ({
  userId,
  farmId = null,
  cropId = null,
}) => {
  let validFarmId = null;
  let validCropId = null;
  let cropName = null;
  let growthStage = null;

  /*
    Check whether a value can safely be used
    with a PostgreSQL INTEGER column.
  */
  const isValidPostgresInteger = (value) => {
    if (value === null || value === undefined || value === "") {
      return false;
    }

    const number = Number(value);

    return (
      Number.isInteger(number) &&
      number >= -2147483648 &&
      number <= 2147483647
    );
  };

  /*
    Check crop ID only when it is a valid PostgreSQL INTEGER.
  */
  if (isValidPostgresInteger(cropId)) {
    const cropCheck = await pool.query(
      `SELECT id, farm_id, crop_name, growth_stage
       FROM crops
       WHERE id = $1 AND farmer_id = $2`,
      [Number(cropId), userId]
    );

    if (cropCheck.rows[0]) {
      validCropId = cropCheck.rows[0].id;
      validFarmId = cropCheck.rows[0].farm_id;
      cropName = cropCheck.rows[0].crop_name;
      growthStage = cropCheck.rows[0].growth_stage;
    }
  }

  /*
    Check farm ID only when it is a valid PostgreSQL INTEGER.
  */
  if (!validFarmId && isValidPostgresInteger(farmId)) {
    const farmCheck = await pool.query(
      `SELECT id
       FROM farms
       WHERE id = $1 AND farmer_id = $2`,
      [Number(farmId), userId]
    );

    if (farmCheck.rows[0]) {
      validFarmId = farmCheck.rows[0].id;
    }
  }

  return {
    validFarmId,
    validCropId,
    cropName,
    growthStage,
  };
};

const sendMessage = async (req, res) => {
  try {
    const {
      message,
      farmId = null,
      cropId = null,
      language = "en-IN",
    } = req.body;

    const userId = req.user.id;

    if (!message || !message.trim()) {
      return res.status(400).json({
        message: "Please enter a farming question.",
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        message: "Gemini API key is missing in server environment settings.",
      });
    }

    const { validFarmId, validCropId } = await getValidRecordRefs({
      userId,
      farmId,
      cropId,
    });

    const farmerContext = await getFarmerContext(userId);

    await pool.query(
      `INSERT INTO chatbot_messages
       (user_id, farm_id, crop_id, sender, message)
       VALUES ($1, $2, $3, 'user', $4)`,
      [userId, validFarmId, validCropId, message.trim()]
    );

    const aiPrompt = `
${buildLanguageInstruction(language)}

Farmer question:
${message.trim()}
`;

    const aiResult = await generateWithFallback({
      models: TEXT_MODELS,
      contents: aiPrompt,
      systemInstruction: buildSystemPrompt(farmerContext),
    });

    const reply = aiResult.text;

    await pool.query(
      `INSERT INTO chatbot_messages
       (user_id, farm_id, crop_id, sender, message)
       VALUES ($1, $2, $3, 'assistant', $4)`,
      [userId, validFarmId, validCropId, reply]
    );

    return res.status(200).json({
      reply,
      modelUsed: aiResult.modelUsed,
      disclaimer:
        "Farmverse AI gives general crop guidance. Consult a local agriculture officer or certified expert before applying fertilizers, pesticides, or chemicals.",
    });
  } catch (error) {
    console.error("Chatbot error:", error);

    return res.status(500).json({
      message: "Farmverse AI Assistant is currently unavailable.",
      error: error.message,
    });
  }
};

const analyzeLeafImage = async (req, res) => {
  try {
    const {
      message = "",
      farmId = null,
      cropId = null,
      language = "en-IN",
    } = req.body;

    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        message: "Please upload a leaf or crop image.",
      });
    }

    if (!req.file.mimetype.startsWith("image/")) {
      return res.status(400).json({
        message: "Only image files are allowed.",
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        message: "Gemini API key is missing in server environment settings.",
      });
    }

    const {
      validFarmId,
      validCropId,
      cropName,
      growthStage,
    } = await getValidRecordRefs({
      userId,
      farmId,
      cropId,
    });

    const farmerContext = await getFarmerContext(userId);

    const userText =
      message.trim() ||
      "Please analyze this crop leaf image for possible pest, disease, or nutrient deficiency.";

    await pool.query(
      `INSERT INTO chatbot_messages
       (user_id, farm_id, crop_id, sender, message)
       VALUES ($1, $2, $3, 'user', $4)`,
      [
        userId,
        validFarmId,
        validCropId,
        `${userText}\n[Leaf image uploaded: ${req.file.originalname}]`,
      ]
    );

    const imagePrompt = `
${buildLanguageInstruction(language)}

Analyze the uploaded crop/leaf/plant image for farming guidance.

User question:
${userText}

Farmer context:
${farmerContext}

Answer in this structure:

1. Possible issue
- Mention possible pest, disease, nutrient deficiency, water stress, heat stress, or physical damage.
- Do NOT say it is confirmed.

2. Visible signs
- Explain visible symptoms in simple farmer-friendly words.

3. What farmer should check
- Check underside of leaves.
- Check stem and fruits.
- Check whether symptoms are spreading.
- Check soil moisture and irrigation.
- Check nearby plants.

4. Safe immediate steps
- Give non-chemical steps first.
- Examples: remove badly affected leaves, improve airflow, avoid overwatering, remove weeds, isolate affected plants if possible.

5. Fertilizer or nutrient guidance
- If it may be nutrient deficiency, mention possible nutrient generally.
- Do NOT give exact fertilizer dosage.
- Recommend soil test or Soil Health Card for exact fertilizer plan.

6. When to contact expert
- Tell the farmer to contact local agriculture officer, KVK, or certified expert for exact diagnosis and chemical dosage.

Important rules:
- No exact pesticide/fungicide/insecticide/fertilizer dosage.
- No guaranteed diagnosis.
- If image is unclear or not a crop image, ask for a clear photo of full plant, close-up leaf, underside of leaf, and affected field area.
`;

    const aiResult = await generateWithFallback({
      models: VISION_MODELS,
      contents: [imagePrompt, fileToGenerativePart(req.file)],
      systemInstruction: buildSystemPrompt(farmerContext),
    });

    const reply =
      aiResult.text ||
      "I could not clearly analyze this image. Please upload a clearer crop leaf image.";

    await pool.query(
      `INSERT INTO chatbot_messages
       (user_id, farm_id, crop_id, sender, message)
       VALUES ($1, $2, $3, 'assistant', $4)`,
      [userId, validFarmId, validCropId, reply]
    );

    try {
      await pool.query(
        `INSERT INTO disease_scans
         (
           user_id,
           farm_id,
           crop_id,
           crop_name,
           growth_stage,
           image_name,
           image_mime_type,
           symptoms,
           ai_result,
           recommendations
         )
         VALUES
         ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb)`,
        [
          userId,
          validFarmId,
          validCropId,
          cropName,
          growthStage,
          req.file.originalname,
          req.file.mimetype,
          userText,
          reply,
          JSON.stringify({
            reply,
            disclaimer:
              "Consult local agriculture officer, KVK, or certified expert before applying chemicals.",
          }),
        ]
      );
    } catch (scanSaveError) {
      console.error(
        "Could not save disease scan history:",
        scanSaveError
      );
    }

    return res.status(200).json({
      reply,
      modelUsed: aiResult.modelUsed,
      disclaimer:
        "Image analysis gives possible crop guidance only. Consult a local agriculture officer, KVK, or certified expert before applying pesticides, fungicides, fertilizers, or chemicals.",
    });
  } catch (error) {
    console.error("Leaf image analysis error:", error);

    return res.status(500).json({
      message: "Leaf image analysis is currently unavailable.",
      error: error.message,
    });
  }
};

const getHistory = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         id,
         farm_id,
         crop_id,
         sender,
         message,
         created_at
       FROM chatbot_messages
       WHERE user_id = $1
       ORDER BY created_at ASC`,
      [req.user.id]
    );

    return res.status(200).json({
      history: result.rows.map((message) => ({
        id: message.id,
        farmId: message.farm_id,
        cropId: message.crop_id,
        sender: message.sender,
        text: message.message,
        createdAt: message.created_at,
      })),
    });
  } catch (error) {
    console.error("Chat history error:", error);

    return res.status(500).json({
      message: "Could not load chat history.",
    });
  }
};

const clearHistory = async (req, res) => {
  try {
    await pool.query(
      `DELETE FROM chatbot_messages
       WHERE user_id = $1`,
      [req.user.id]
    );

    return res.status(200).json({
      message: "Chat history cleared successfully.",
    });
  } catch (error) {
    console.error("Clear chat history error:", error);

    return res.status(500).json({
      message: "Could not clear chat history.",
    });
  }
};

module.exports = {
  sendMessage,
  analyzeLeafImage,
  getHistory,
  clearHistory,
};