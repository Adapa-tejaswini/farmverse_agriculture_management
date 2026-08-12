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

/* ---------------- FARMS ---------------- */

export const getFarms = (userId) => {
  return readData(getKey("farms", userId), []);
};

export const addFarm = (userId, farm) => {
  const farms = getFarms(userId);

  const newFarm = {
    id: Date.now(),
    farmerId: userId,
    farmName: farm.farmName,
    location: farm.location,
    landSize: farm.landSize,
    landUnit: farm.landUnit || "acres",
    soilType: farm.soilType,
    irrigationType: farm.irrigationType,
    farmingType: farm.farmingType,
    createdAt: new Date().toISOString(),
  };

  saveData(getKey("farms", userId), [...farms, newFarm]);

  return newFarm;
};

export const updateFarm = (userId, farmId, updatedFarm) => {
  const farms = getFarms(userId);

  const newFarms = farms.map((farm) =>
    farm.id === farmId ? { ...farm, ...updatedFarm } : farm
  );

  saveData(getKey("farms", userId), newFarms);
};

export const deleteFarm = (userId, farmId) => {
  const farms = getFarms(userId);
  const crops = getCrops(userId);

  saveData(
    getKey("farms", userId),
    farms.filter((farm) => farm.id !== farmId)
  );

  saveData(
    getKey("crops", userId),
    crops.filter((crop) => crop.farmId !== farmId)
  );
};

/* ---------------- CROPS ---------------- */

export const getCrops = (userId) => {
  return readData(getKey("crops", userId), []);
};

export const addCrop = (userId, crop) => {
  const crops = getCrops(userId);

  const newCrop = {
    id: Date.now(),
    farmerId: userId,
    farmId: Number(crop.farmId),
    cropName: crop.cropName,
    variety: crop.variety,
    season: crop.season,
    plantingDate: crop.plantingDate,
    expectedHarvestDate: crop.expectedHarvestDate,
    fieldArea: crop.fieldArea,
    soilPh: crop.soilPh,
    nitrogen: crop.nitrogen,
    phosphorus: crop.phosphorus,
    potassium: crop.potassium,
    growthStage: crop.growthStage,
    cropStatus: crop.cropStatus || "Planted",
    estimatedYield: crop.estimatedYield || "",
    createdAt: new Date().toISOString(),
  };

  saveData(getKey("crops", userId), [...crops, newCrop]);

  return newCrop;
};

export const updateCrop = (userId, cropId, updatedCrop) => {
  const crops = getCrops(userId);

  const newCrops = crops.map((crop) =>
    crop.id === cropId ? { ...crop, ...updatedCrop } : crop
  );

  saveData(getKey("crops", userId), newCrops);
};

export const deleteCrop = (userId, cropId) => {
  const crops = getCrops(userId);
  const listings = getListings(userId);

  saveData(
    getKey("crops", userId),
    crops.filter((crop) => crop.id !== cropId)
  );

  saveData(
    getKey("listings", userId),
    listings.filter((listing) => listing.cropId !== cropId)
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
    listings.filter((listing) => listing.id !== listingId)
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
