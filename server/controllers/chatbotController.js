const { GoogleGenerativeAI } = require("@google/generative-ai");
const pool = require("../config/db");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

Rules:
1. Use simple and practical language suitable for farmers.
2. Keep answers concise. Use short bullet points where useful.
3. If the question is not related to farming or crops, say:
   "I am Farmverse Crop Assistant. I can help only with crops, farms, irrigation, weather, fertilizer guidance, pests, diseases, and harvesting."
4. Never provide exact pesticide, fungicide, insecticide, or fertilizer chemical dosage.
5. For chemical application or serious disease issues, advise:
   "Please consult a local agriculture officer, Krishi Vigyan Kendra (KVK), or certified agriculture expert for exact dosage."
6. Do not claim guaranteed results.
7. Do not diagnose plant disease with certainty without an image and expert confirmation.

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
      context += `- ${farm.farm_name}, ${farm.location}, ${farm.land_size} ${farm.land_unit}. Soil: ${farm.soil_type || "not recorded"}. Irrigation: ${farm.irrigation_type || "not recorded"}.\n`;
    });
  }

  if (cropsResult.rows.length === 0) {
    context += "\nNo crop records have been added yet.\n";
  } else {
    context += "\nCrop records:\n";

    cropsResult.rows.forEach((crop) => {
      context += `- Crop: ${crop.crop_name}. Farm: ${crop.farm_name}, ${crop.location}. Season: ${crop.season || "not recorded"}. Status: ${crop.crop_status || "not recorded"}. Growth stage: ${crop.growth_stage || "not recorded"}. Planting date: ${crop.planting_date || "not recorded"}. Expected harvest: ${crop.expected_harvest_date || "not recorded"}. Estimated yield: ${crop.estimated_yield || "not recorded"} kg.\n`;
    });
  }

  return context;
};

const sendMessage = async (req, res) => {
  try {
    const { message, farmId = null, cropId = null } = req.body;
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

    const farmerContext = await getFarmerContext(userId);

    await pool.query(
      `INSERT INTO chatbot_messages (user_id, farm_id, crop_id, sender, message)
       VALUES ($1, $2, $3, 'user', $4)`,
      [userId, farmId || null, cropId || null, message.trim()]
    );

    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
      systemInstruction: buildSystemPrompt(farmerContext),
    });

    const result = await model.generateContent(message.trim());
    const reply = result.response.text();

    await pool.query(
      `INSERT INTO chatbot_messages (user_id, farm_id, crop_id, sender, message)
       VALUES ($1, $2, $3, 'assistant', $4)`,
      [userId, farmId || null, cropId || null, reply]
    );

    return res.status(200).json({
      reply,
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
  getHistory,
  clearHistory,
};