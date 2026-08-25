const getKey = (name, userId) => `farmverse_${name}_${userId}`;

const readData = (key, fallback = []) => {
  const data = localStorage.getItem(key);

  if (!data) return fallback;

  try {
    return JSON.parse(data);
  } catch {
    return fallback;
  }
};

const saveData = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const normalizeText = (value) => {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
};

const sameId = (a, b) => Number(a) === Number(b);

/* ---------------- BACKEND CONFIG ---------------- */

const API_BASE = "http://localhost:5000/api";
const TOKEN_KEY = "farmverse_token";

/* ---------------- AUTH TOKEN ---------------- */

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY) || "";
};

export const saveToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

const authHeaders = () => {
  const token = getToken();

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

/* ---------------- AUTH API ---------------- */

export const loginUser = async ({ identifier, password, role }) => {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      identifier,
      password,
      role,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Login failed. Please try again.");
  }

  if (data.token) {
    saveToken(data.token);
  }

  return data;
};

export const registerUser = async ({ name, email, phone, password, role }) => {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      email,
      phone,
      password,
      role,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Registration failed. Please try again.");
  }

  if (data.token) {
    saveToken(data.token);
  }

  return data;
};

/* ---------------- FARMS ---------------- */

export const getFarms = (userId) => {
  return readData(getKey("farms", userId), []);
};

export const addFarm = (userId, farm) => {
  const farms = getFarms(userId);

  const farmName = String(farm.farmName || "").trim();
  const location = String(farm.location || "").trim();
  const landSize = farm.landSize;

  if (!farmName || !location || !String(landSize || "").trim()) {
    throw new Error("Farm name, location, and land size are required.");
  }

  if (Number(landSize) <= 0) {
    throw new Error("Land size must be greater than zero.");
  }

  const duplicateFarm = farms.find(
    (existingFarm) =>
      normalizeText(existingFarm.farmName) === normalizeText(farmName) &&
      normalizeText(existingFarm.location) === normalizeText(location)
  );

  if (duplicateFarm) {
    throw new Error("This farm already exists with the same name and location.");
  }

  const newFarm = {
    id: Date.now(),
    farmerId: userId,
    farmName,
    location,
    landSize,
    landUnit: farm.landUnit || "acres",
    soilType: farm.soilType || "",
    irrigationType: farm.irrigationType || "",
    farmingType: farm.farmingType || "",
    createdAt: new Date().toISOString(),
  };

  saveData(getKey("farms", userId), [...farms, newFarm]);

  return newFarm;
};

export const updateFarm = (userId, farmId, updatedFarm) => {
  const farms = getFarms(userId);

  const currentFarm = farms.find((farm) => sameId(farm.id, farmId));

  if (!currentFarm) {
    throw new Error("Farm record not found.");
  }

  const mergedFarm = {
    ...currentFarm,
    ...updatedFarm,
    farmName: String(updatedFarm.farmName || currentFarm.farmName || "").trim(),
    location: String(updatedFarm.location || currentFarm.location || "").trim(),
  };

  if (!mergedFarm.farmName || !mergedFarm.location || !String(mergedFarm.landSize || "").trim()) {
    throw new Error("Farm name, location, and land size are required.");
  }

  if (Number(mergedFarm.landSize) <= 0) {
    throw new Error("Land size must be greater than zero.");
  }

  const duplicateFarm = farms.find(
    (existingFarm) =>
      !sameId(existingFarm.id, farmId) &&
      normalizeText(existingFarm.farmName) === normalizeText(mergedFarm.farmName) &&
      normalizeText(existingFarm.location) === normalizeText(mergedFarm.location)
  );

  if (duplicateFarm) {
    throw new Error("Another farm already exists with the same name and location.");
  }

  const newFarms = farms.map((farm) =>
    sameId(farm.id, farmId) ? mergedFarm : farm
  );

  saveData(getKey("farms", userId), newFarms);

  return mergedFarm;
};

export const deleteFarm = (userId, farmId) => {
  const farms = getFarms(userId);
  const crops = getCrops(userId);

  saveData(
    getKey("farms", userId),
    farms.filter((farm) => !sameId(farm.id, farmId))
  );

  saveData(
    getKey("crops", userId),
    crops.filter((crop) => !sameId(crop.farmId, farmId))
  );
};

/* ---------------- CROPS ---------------- */

export const getCrops = (userId) => {
  return readData(getKey("crops", userId), []);
};

export const addCrop = (userId, crop) => {
  const crops = getCrops(userId);

  const farmId = Number(crop.farmId);
  const cropName = String(crop.cropName || "").trim();
  const variety = String(crop.variety || "").trim();
  const plantingDate = crop.plantingDate || "";

  if (!farmId || !cropName || !plantingDate) {
    throw new Error("Select a farm, enter crop name, and add planting date.");
  }

  const duplicateCrop = crops.find(
    (existingCrop) =>
      sameId(existingCrop.farmId, farmId) &&
      normalizeText(existingCrop.cropName) === normalizeText(cropName) &&
      normalizeText(existingCrop.variety) === normalizeText(variety) &&
      String(existingCrop.plantingDate || "") === String(plantingDate)
  );

  if (duplicateCrop) {
    throw new Error(
      "This crop already exists for the selected farm with the same crop name, variety, and planting date."
    );
  }

  const newCrop = {
    id: Date.now(),
    farmerId: userId,
    farmId,
    cropName,
    variety,
    season: crop.season || "",
    plantingDate,
    expectedHarvestDate: crop.expectedHarvestDate || "",
    fieldArea: crop.fieldArea || "",
    soilPh: crop.soilPh || "",
    nitrogen: crop.nitrogen || "",
    phosphorus: crop.phosphorus || "",
    potassium: crop.potassium || "",
    growthStage: crop.growthStage || "Seedling",
    cropStatus: crop.cropStatus || "Planted",
    estimatedYield: crop.estimatedYield || "",
    createdAt: new Date().toISOString(),
  };

  saveData(getKey("crops", userId), [...crops, newCrop]);

  return newCrop;
};

export const updateCrop = (userId, cropId, updatedCrop) => {
  const crops = getCrops(userId);

  const currentCrop = crops.find((crop) => sameId(crop.id, cropId));

  if (!currentCrop) {
    throw new Error("Crop record not found.");
  }

  const mergedCrop = {
    ...currentCrop,
    ...updatedCrop,
    farmId: Number(updatedCrop.farmId || currentCrop.farmId),
    cropName: String(updatedCrop.cropName || currentCrop.cropName || "").trim(),
    variety: String(updatedCrop.variety || "").trim(),
    plantingDate: updatedCrop.plantingDate || currentCrop.plantingDate || "",
  };

  if (!mergedCrop.farmId || !mergedCrop.cropName || !mergedCrop.plantingDate) {
    throw new Error("Select a farm, enter crop name, and add planting date.");
  }

  const duplicateCrop = crops.find(
    (existingCrop) =>
      !sameId(existingCrop.id, cropId) &&
      sameId(existingCrop.farmId, mergedCrop.farmId) &&
      normalizeText(existingCrop.cropName) === normalizeText(mergedCrop.cropName) &&
      normalizeText(existingCrop.variety) === normalizeText(mergedCrop.variety) &&
      String(existingCrop.plantingDate || "") === String(mergedCrop.plantingDate)
  );

  if (duplicateCrop) {
    throw new Error(
      "Another crop already exists for this farm with the same crop name, variety, and planting date."
    );
  }

  const newCrops = crops.map((crop) =>
    sameId(crop.id, cropId) ? mergedCrop : crop
  );

  saveData(getKey("crops", userId), newCrops);

  return mergedCrop;
};

export const deleteCrop = (userId, cropId) => {
  const crops = getCrops(userId);
  const listings = getListings(userId);

  saveData(
    getKey("crops", userId),
    crops.filter((crop) => !sameId(crop.id, cropId))
  );

  saveData(
    getKey("listings", userId),
    listings.filter((listing) => !sameId(listing.cropId, cropId))
  );
};

/* ---------------- LISTINGS ---------------- */

export const getListings = (userId) => {
  return readData(getKey("listings", userId), []);
};

export const addListing = (userId, listing) => {
  const listings = getListings(userId);

  const newListing = {
    id: Date.now(),
    farmerId: userId,
    cropId: listing.cropId ? Number(listing.cropId) : null,
    cropName: listing.cropName,
    quantity: listing.quantity,
    unit: listing.unit || "kg",
    price: listing.price,
    status: "Active",
    createdAt: new Date().toISOString(),
  };

  saveData(getKey("listings", userId), [...listings, newListing]);

  return newListing;
};

export const deleteListing = (userId, listingId) => {
  const listings = getListings(userId);

  saveData(
    getKey("listings", userId),
    listings.filter((listing) => !sameId(listing.id, listingId))
  );
};

/* ---------------- PREDICTIONS ---------------- */

export const getPredictions = (userId) => {
  return readData(getKey("predictions", userId), []);
};

export const savePrediction = (userId, prediction) => {
  const predictions = getPredictions(userId);

  const newPrediction = {
    id: Date.now(),
    farmerId: userId,
    ...prediction,
    createdAt: new Date().toISOString(),
  };

  saveData(getKey("predictions", userId), [newPrediction, ...predictions]);

  return newPrediction;
};

/* ---------------- CHATBOT API ---------------- */

export const sendChatMessage = async (message) => {
  const token = getToken();

  if (!token) {
    throw new Error(
      "You are not logged in to the server. Please sign out and sign in again."
    );
  }

  const response = await fetch(`${API_BASE}/chatbot/message`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ message }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.error || data.message || `Server error: ${response.status}`
    );
  }

  return data;
};

export const getChatHistory = async () => {
  const token = getToken();

  if (!token) {
    throw new Error("No auth token found.");
  }

  const response = await fetch(`${API_BASE}/chatbot/history`, {
    method: "GET",
    headers: authHeaders(),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.error || data.message || "Failed to load chat history"
    );
  }

  return data;
};

export const clearChatHistory = async () => {
  const token = getToken();

  if (!token) {
    throw new Error("No auth token found.");
  }

  const response = await fetch(`${API_BASE}/chatbot/history`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.error || data.message || "Failed to clear chat history"
    );
  }

  return data;
};