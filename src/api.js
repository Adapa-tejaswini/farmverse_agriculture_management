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

const getCurrentStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("farmverse_user") || "{}");
  } catch {
    return {};
  }
};

const getStoredAccounts = () => {
  return readData("farmverse_accounts", []);
};

const getFarmerDisplayName = (farmerId) => {
  const currentUser = getCurrentStoredUser();

  if (sameId(currentUser?.id, farmerId) && currentUser?.name) {
    return currentUser.name;
  }

  const accounts = getStoredAccounts();
  const account = accounts.find((item) => sameId(item.id, farmerId));

  return account?.name || `Farmer #${farmerId}`;
};

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

const authOnlyHeaders = () => {
  const token = getToken();

  return {
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

  if (
    !mergedFarm.farmName ||
    !mergedFarm.location ||
    !String(mergedFarm.landSize || "").trim()
  ) {
    throw new Error("Farm name, location, and land size are required.");
  }

  if (Number(mergedFarm.landSize) <= 0) {
    throw new Error("Land size must be greater than zero.");
  }

  const duplicateFarm = farms.find(
    (existingFarm) =>
      !sameId(existingFarm.id, farmId) &&
      normalizeText(existingFarm.farmName) ===
        normalizeText(mergedFarm.farmName) &&
      normalizeText(existingFarm.location) ===
        normalizeText(mergedFarm.location)
  );

  if (duplicateFarm) {
    throw new Error(
      "Another farm already exists with the same name and location."
    );
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
      normalizeText(existingCrop.cropName) ===
        normalizeText(mergedCrop.cropName) &&
      normalizeText(existingCrop.variety) ===
        normalizeText(mergedCrop.variety) &&
      String(existingCrop.plantingDate || "") ===
        String(mergedCrop.plantingDate)
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
  const crops = getCrops(userId);
  const farms = getFarms(userId);
  const currentUser = getCurrentStoredUser();

  const selectedCrop = listing.cropId
    ? crops.find((crop) => sameId(crop.id, listing.cropId))
    : null;

  const selectedFarm = selectedCrop
    ? farms.find((farm) => sameId(farm.id, selectedCrop.farmId))
    : farms[0];

  const cropName = String(listing.cropName || "").trim();
  const quantity = Number(listing.quantity || 0);
  const price = Number(listing.price || 0);

  if (!cropName || quantity <= 0 || price <= 0) {
    throw new Error("Crop name, quantity, and price are required.");
  }

  const newListing = {
    id: Date.now(),
    farmerId: userId,
    farmerName:
      listing.farmerName ||
      (sameId(currentUser?.id, userId) ? currentUser?.name : "") ||
      getFarmerDisplayName(userId),
    cropId: listing.cropId ? Number(listing.cropId) : null,
    cropName,
    quantity,
    unit: listing.unit || "kg",
    price,
    status: "Active",
    farmName: selectedFarm?.farmName || currentUser?.farmName || "",
    location: selectedFarm?.location || currentUser?.location || "",
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

/* ---------------- MARKETPLACE / BUYER SIDE ---------------- */

export const getMarketplaceListings = () => {
  const allListings = [];

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);

    if (!key || !key.startsWith("farmverse_listings_")) continue;

    const farmerId = key.replace("farmverse_listings_", "");
    const listings = readData(key, []);
    const farms = getFarms(farmerId);
    const crops = getCrops(farmerId);

    listings.forEach((listing) => {
      const status = listing.status || listing.listingStatus || "Active";

      if (status !== "Active") return;
      if (Number(listing.quantity || 0) <= 0) return;

      const crop = listing.cropId
        ? crops.find((item) => sameId(item.id, listing.cropId))
        : null;

      const farm = crop
        ? farms.find((item) => sameId(item.id, crop.farmId))
        : farms[0];

      allListings.push({
        ...listing,
        farmerId: Number(farmerId) || farmerId,
        farmerName: listing.farmerName || getFarmerDisplayName(farmerId),
        farmName: listing.farmName || farm?.farmName || "Farm not added",
        location: listing.location || farm?.location || "Location not added",
        cropName: listing.cropName || crop?.cropName || "Crop",
        quantity: Number(listing.quantity || 0),
        price: Number(listing.price || 0),
        unit: listing.unit || "kg",
        status,
      });
    });
  }

  return allListings.sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  );
};

export const getBuyerOrders = (buyerId) => {
  return readData(getKey("buyer_orders", buyerId), []);
};

export const createBuyerOrder = (buyerId, order) => {
  const orders = getBuyerOrders(buyerId);
  const listing = order.listing;

  if (!listing) {
    throw new Error("Listing is required.");
  }

  const quantity = Number(order.quantity || 0);

  if (quantity <= 0) {
    throw new Error("Order quantity must be greater than zero.");
  }

  if (quantity > Number(listing.quantity || 0)) {
    throw new Error(`Only ${listing.quantity} ${listing.unit} available.`);
  }

  const newOrder = {
    id: Date.now(),
    buyerId,
    farmerId: listing.farmerId,
    farmerName: listing.farmerName || "Farmer",
    listingId: listing.id,
    cropName: listing.cropName,
    quantity,
    unit: listing.unit || "kg",
    pricePerUnit: Number(listing.price || 0),
    totalPrice: quantity * Number(listing.price || 0),
    deliveryAddress: order.deliveryAddress || "",
    buyerNote: order.buyerNote || "",
    status: "Pending",
    createdAt: new Date().toISOString(),
  };

  saveData(getKey("buyer_orders", buyerId), [newOrder, ...orders]);

  return newOrder;
};

export const cancelBuyerOrder = (buyerId, orderId) => {
  const orders = getBuyerOrders(buyerId);

  const updatedOrders = orders.map((order) =>
    sameId(order.id, orderId) && order.status === "Pending"
      ? { ...order, status: "Cancelled" }
      : order
  );

  saveData(getKey("buyer_orders", buyerId), updatedOrders);

  return updatedOrders;
};

/* ---------------- COLLECTIVE SELLING ---------------- */

const getLocationGroup = (location) => {
  const cleanLocation = String(location || "Unknown location").trim();

  if (!cleanLocation) return "Unknown location";

  return cleanLocation.split(",")[0].trim();
};

export const getCollectiveLots = () => {
  const listings = getMarketplaceListings();
  const groups = {};

  listings.forEach((listing) => {
    const cropKey = normalizeText(listing.cropName);
    const locationGroup = getLocationGroup(listing.location);
    const locationKey = normalizeText(locationGroup);
    const unitKey = normalizeText(listing.unit || "kg");

    const groupKey = `${cropKey}_${locationKey}_${unitKey}`;

    if (!groups[groupKey]) {
      groups[groupKey] = {
        id: groupKey,
        cropName: listing.cropName,
        locationGroup,
        unit: listing.unit || "kg",
        totalQuantity: 0,
        totalValue: 0,
        minPrice: Number(listing.price || 0),
        maxPrice: Number(listing.price || 0),
        farmers: [],
        farmerIds: new Set(),
        listings: [],
      };
    }

    const group = groups[groupKey];
    const quantity = Number(listing.quantity || 0);
    const price = Number(listing.price || 0);

    group.totalQuantity += quantity;
    group.totalValue += quantity * price;
    group.minPrice = Math.min(group.minPrice, price);
    group.maxPrice = Math.max(group.maxPrice, price);

    if (!group.farmerIds.has(String(listing.farmerId))) {
      group.farmerIds.add(String(listing.farmerId));
      group.farmers.push({
        farmerId: listing.farmerId,
        farmerName: listing.farmerName || "Farmer",
        location: listing.location || "Location not added",
      });
    }

    group.listings.push(listing);
  });

  return Object.values(groups)
    .map((group) => ({
      ...group,
      farmerIds: undefined,
      farmerCount: group.farmers.length,
      averagePrice:
        group.totalQuantity > 0
          ? Math.round((group.totalValue / group.totalQuantity) * 100) / 100
          : 0,
    }))
    .filter((group) => group.totalQuantity > 0)
    .sort((a, b) => b.totalQuantity - a.totalQuantity);
};

export const createCollectiveBuyerOrder = (
  buyerId,
  { lot, quantity, deliveryAddress = "", buyerNote = "" }
) => {
  if (!lot) {
    throw new Error("Collective lot is required.");
  }

  const requestedQuantity = Number(quantity || 0);

  if (requestedQuantity <= 0) {
    throw new Error("Requested quantity must be greater than zero.");
  }

  if (requestedQuantity > Number(lot.totalQuantity || 0)) {
    throw new Error(
      `Only ${lot.totalQuantity} ${lot.unit} available in this collective lot.`
    );
  }

  const orders = getBuyerOrders(buyerId);
  const groupOrderId = Date.now();

  let remainingQuantity = requestedQuantity;

  const sortedListings = [...lot.listings].sort(
    (a, b) => Number(a.price || 0) - Number(b.price || 0)
  );

  const newOrders = [];

  sortedListings.forEach((listing) => {
    if (remainingQuantity <= 0) return;

    const available = Number(listing.quantity || 0);
    const assignedQuantity = Math.min(remainingQuantity, available);

    if (assignedQuantity <= 0) return;

    const pricePerUnit = Number(listing.price || 0);

    newOrders.push({
      id: Date.now() + newOrders.length,
      groupOrderId,
      buyerId,
      farmerId: listing.farmerId,
      farmerName: listing.farmerName || "Farmer",
      listingId: listing.id,
      cropName: listing.cropName,
      quantity: assignedQuantity,
      unit: listing.unit || lot.unit || "kg",
      pricePerUnit,
      totalPrice: assignedQuantity * pricePerUnit,
      deliveryAddress,
      buyerNote,
      status: "Pending",
      isCollectiveOrder: true,
      collectiveCropName: lot.cropName,
      collectiveLocation: lot.locationGroup,
      createdAt: new Date().toISOString(),
    });

    remainingQuantity -= assignedQuantity;
  });

  if (remainingQuantity > 0) {
    throw new Error("Could not allocate full quantity from available farmers.");
  }

  saveData(getKey("buyer_orders", buyerId), [...newOrders, ...orders]);

  return {
    groupOrderId,
    orders: newOrders,
    totalQuantity: requestedQuantity,
    totalPrice: newOrders.reduce(
      (total, order) => total + Number(order.totalPrice || 0),
      0
    ),
  };
};

/* ---------------- VEHICLE SHARING ---------------- */

export const getVehiclePosts = (userId) => {
  return readData(getKey("vehicle_posts", userId), []);
};

export const getAllVehiclePosts = () => {
  const allPosts = [];

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);

    if (!key || !key.startsWith("farmverse_vehicle_posts_")) continue;

    const userId = key.replace("farmverse_vehicle_posts_", "");
    const posts = readData(key, []);

    posts.forEach((post) => {
      if (post.status !== "Closed") {
        allPosts.push({
          ...post,
          ownerId: Number(userId) || userId,
        });
      }
    });
  }

  return allPosts.sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  );
};

export const addVehiclePost = (userId, post) => {
  const posts = getVehiclePosts(userId);
  const currentUser = getCurrentStoredUser();

  if (!post.postType) {
    throw new Error("Select post type.");
  }

  if (!post.vehicleType) {
    throw new Error("Vehicle type is required.");
  }

  if (!post.fromLocation) {
    throw new Error("From location is required.");
  }

  if (!post.date) {
    throw new Error("Date is required.");
  }

  const newPost = {
    id: Date.now(),
    ownerId: userId,
    ownerName: currentUser?.name || "Farmer",
    ownerPhone: currentUser?.phone || "",
    postType: post.postType,
    vehicleType: post.vehicleType,
    cropName: post.cropName || "",
    quantity: post.quantity || "",
    unit: post.unit || "kg",
    fromLocation: post.fromLocation,
    toLocation: post.toLocation || "",
    date: post.date,
    contactPhone: post.contactPhone || currentUser?.phone || "",
    notes: post.notes || "",
    status: "Active",
    createdAt: new Date().toISOString(),
  };

  saveData(getKey("vehicle_posts", userId), [newPost, ...posts]);

  return newPost;
};

export const deleteVehiclePost = (userId, postId) => {
  const posts = getVehiclePosts(userId);

  saveData(
    getKey("vehicle_posts", userId),
    posts.filter((post) => !sameId(post.id, postId))
  );
};

export const closeVehiclePost = (userId, postId) => {
  const posts = getVehiclePosts(userId);

  const updatedPosts = posts.map((post) =>
    sameId(post.id, postId) ? { ...post, status: "Closed" } : post
  );

  saveData(getKey("vehicle_posts", userId), updatedPosts);

  return updatedPosts;
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

export const sendChatMessage = async (message, language = "en-IN") => {
  const token = getToken();

  if (!token) {
    throw new Error(
      "You are not logged in to the server. Please sign out and sign in again."
    );
  }

  const response = await fetch(`${API_BASE}/chatbot/message`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      message,
      language,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.error || data.message || `Server error: ${response.status}`
    );
  }

  return data;
};

export const sendLeafImageMessage = async ({
  message,
  image,
  farmId = null,
  cropId = null,
  language = "en-IN",
} = {}) => {
  const token = getToken();

  if (!token) {
    throw new Error(
      "You are not logged in to the server. Please sign out and sign in again."
    );
  }

  if (!image) {
    throw new Error("Please select a leaf or crop image.");
  }

  const formData = new FormData();
  formData.append("message", message || "");
  formData.append("image", image);
  formData.append("language", language);

  if (farmId) {
    formData.append("farmId", farmId);
  }

  if (cropId) {
    formData.append("cropId", cropId);
  }

  const response = await fetch(`${API_BASE}/chatbot/leaf-image`, {
    method: "POST",
    headers: authOnlyHeaders(),
    body: formData,
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