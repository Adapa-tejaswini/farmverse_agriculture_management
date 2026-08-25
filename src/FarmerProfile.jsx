import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  addListing,
  deleteListing,
  getCrops,
  getFarms,
  getListings,
} from "./api.js";

const PROFILE_IMAGE =
  "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1600&q=85";

const FarmerProfile = ({ user, onLogout, onUpdateUser }) => {
  const [editing, setEditing] = useState(false);
  const [listings, setListings] = useState([]);
  const [crops, setCrops] = useState([]);
  const [farms, setFarms] = useState([]);
  const [message, setMessage] = useState("");

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    farmName: user?.farmName || "",
    location: user?.location || "",
    farmSize: user?.farmSize || "",
    farmingType: user?.farmingType || "",
  });

  const [listingData, setListingData] = useState({
    cropId: "",
    cropName: "",
    quantity: "",
    unit: "kg",
    price: "",
  });

  const loadData = () => {
    if (!user?.id) return;

    setListings(getListings(user.id));
    setCrops(getCrops(user.id));
    setFarms(getFarms(user.id));
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const handleProfileChange = (event) => {
    setProfileData({
      ...profileData,
      [event.target.name]: event.target.value,
    });
  };

  const saveProfile = () => {
    const updatedUser = {
      ...user,
      ...profileData,
    };

    const allAccounts = JSON.parse(
      localStorage.getItem("farmverse_accounts") || "[]"
    );

    const updatedAccounts = allAccounts.map((account) =>
      account.id === user.id ? { ...account, ...updatedUser } : account
    );

    localStorage.setItem(
      "farmverse_accounts",
      JSON.stringify(updatedAccounts)
    );

    onUpdateUser(updatedUser);
    setEditing(false);
    setMessage("Farm profile updated successfully.");
  };

  const handleListingChange = (event) => {
    const { name, value } = event.target;

    if (name === "cropId") {
      const selectedCrop = crops.find((crop) => crop.id === Number(value));

      setListingData({
        ...listingData,
        cropId: value,
        cropName: selectedCrop?.cropName || "",
      });

      return;
    }

    setListingData({
      ...listingData,
      [name]: value,
    });
  };

  const handleAddListing = () => {
    setMessage("");

    if (!listingData.cropName || !listingData.quantity || !listingData.price) {
      setMessage("Crop name, quantity, and price are required.");
      return;
    }

    addListing(user.id, listingData);

    setListingData({
      cropId: "",
      cropName: "",
      quantity: "",
      unit: "kg",
      price: "",
    });

    loadData();
    setMessage("Produce listing added successfully.");
  };

  const handleDeleteListing = (listingId) => {
    if (!window.confirm("Remove this produce listing?")) return;

    deleteListing(user.id, listingId);
    loadData();
    setMessage("Produce listing removed successfully.");
  };

  /* Use primary farm data if user profile does not have it */
  const primaryFarm = farms[0];

  const displayFarmName =
    user?.farmName || primaryFarm?.farmName || "Add your first farm";

  const displayLocation =
    user?.location || primaryFarm?.location || "Add farm location";

  const displayFarmSize =
    user?.farmSize ||
    (primaryFarm
      ? `${primaryFarm.landSize} ${primaryFarm.landUnit}`
      : "Add land size");

  const displayFarmingType =
    user?.farmingType || primaryFarm?.farmingType || "Not added";

  const setupSteps = [
    {
      done: farms.length > 0,
      label: "Add a farm",
      description: "Save your field location, land area, and water source.",
      link: "/farm-management",
      icon: "⌖",
    },
    {
      done: crops.length > 0,
      label: "Add a crop",
      description: "Track planting, crop stage, yield, and harvest date.",
      link: "/crop-management",
      icon: "☘",
    },
    {
      done: listings.length > 0,
      label: "Create a listing",
      description: "Show buyers what produce is available from your farm.",
      link: "#produce-listings",
      icon: "▣",
    },
  ];

  const completedSteps = setupSteps.filter((step) => step.done).length;

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        {/* Farmer profile banner */}
        <section style={styles.banner}>
          <img
            src={PROFILE_IMAGE}
            alt="Agricultural field"
            style={styles.bannerImage}
          />

          <div style={styles.bannerOverlay} />

          <div style={styles.bannerContent}>
            <div style={styles.avatar}>
              {user?.name?.charAt(0)?.toUpperCase() || "F"}
            </div>

            <div style={styles.profileIdentity}>
              <p className="mono" style={styles.eyebrow}>
                FARMER RECORD · VERIFIED
              </p>

              <h1 style={styles.name}>{user?.name || "Farmer"}</h1>

              <p style={styles.contact}>
                {user?.email || "Email not added"}
                {user?.phone && ` · ${user.phone}`}
              </p>
            </div>

            <button style={styles.logoutBtn} onClick={onLogout}>
              Sign out
            </button>
          </div>

          <div style={styles.bannerFooter}>
            <span>🌱 Farm record progress: {completedSteps}/3 complete</span>
            <span>📍 {displayLocation}</span>
          </div>
        </section>

        {/* Main profile stats */}
        <section style={styles.statsGrid}>
          <article style={styles.statCard}>
            <span style={styles.statIcon}>▣</span>

            <div>
              <span className="mono" style={styles.statLabel}>
                PRODUCE LISTINGS
              </span>

              <strong style={styles.statValue}>{listings.length}</strong>

              <span style={styles.statHint}>
                {listings.length > 0
                  ? "Listings available for buyers"
                  : "Create your first produce listing"}
              </span>
            </div>
          </article>

          <article style={styles.statCard}>
            <span style={styles.statIcon}>☘</span>

            <div>
              <span className="mono" style={styles.statLabel}>
                CROP RECORDS
              </span>

              <strong style={styles.statValue}>{crops.length}</strong>

              <span style={styles.statHint}>
                {crops.length > 0
                  ? "Crops tracked this season"
                  : "Add crops from Crop Management"}
              </span>
            </div>
          </article>

          <article style={styles.statCard}>
            <span style={styles.statIcon}>✓</span>

            <div>
              <span className="mono" style={styles.statLabel}>
                FARM PROFILE
              </span>

              <strong style={styles.statText}>
                {completedSteps}/3 ready
              </strong>

              <span style={styles.statHint}>
                Complete farms, crops, and listings
              </span>
            </div>
          </article>
        </section>

        {/* Quick navigation */}
        <section style={styles.quickLinks}>
          <Link to="/dashboard" style={styles.quickLink}>
            <span>◫</span>
            Dashboard
          </Link>

          <Link to="/farm-management" style={styles.quickLink}>
            <span>⌖</span>
            Manage farms
          </Link>

          <Link to="/crop-management" style={styles.quickLink}>
            <span>☘</span>
            Manage crops
          </Link>

          <Link to="/prediction" style={styles.quickLink}>
            <span>⌁</span>
            Crop advisor
          </Link>
        </section>

        <div className="furrow" style={{ margin: "30px 0" }} />

        {/* Farm identity section */}
        <section style={styles.sectionCard}>
          <div style={styles.sectionHeader}>
            <div>
              <p className="mono" style={styles.sectionEyebrow}>
                FARM IDENTITY
              </p>

              <h2 style={styles.sectionTitle}>Farmer and farm details</h2>
            </div>

            {!editing ? (
              <button style={styles.editBtn} onClick={() => setEditing(true)}>
                Edit profile
              </button>
            ) : (
              <div style={styles.editActions}>
                <button style={styles.saveBtn} onClick={saveProfile}>
                  Save changes
                </button>

                <button
                  style={styles.cancelBtn}
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {message && <p style={styles.message}>{message}</p>}

          {editing ? (
            <div style={styles.editGrid}>
              <ProfileInput
                label="Full name"
                name="name"
                value={profileData.name}
                onChange={handleProfileChange}
              />

              <ProfileInput
                label="Email address"
                name="email"
                value={profileData.email}
                onChange={handleProfileChange}
              />

              <ProfileInput
                label="Phone number"
                name="phone"
                value={profileData.phone}
                onChange={handleProfileChange}
              />

              <ProfileInput
                label="Primary farm name"
                name="farmName"
                value={profileData.farmName}
                onChange={handleProfileChange}
              />

              <ProfileInput
                label="Village / location"
                name="location"
                value={profileData.location}
                onChange={handleProfileChange}
              />

              <ProfileInput
                label="Farm size"
                name="farmSize"
                value={profileData.farmSize}
                onChange={handleProfileChange}
              />

              <ProfileInput
                label="Farming type"
                name="farmingType"
                value={profileData.farmingType}
                onChange={handleProfileChange}
              />
            </div>
          ) : (
            <div style={styles.infoGrid}>
              <InfoCard
                label="PRIMARY FARM"
                value={displayFarmName}
                icon="⌖"
              />

              <InfoCard
                label="LOCATION"
                value={displayLocation}
                icon="📍"
              />

              <InfoCard
                label="LAND AREA"
                value={displayFarmSize}
                icon="◫"
              />

              <InfoCard
                label="FARMING TYPE"
                value={displayFarmingType}
                icon="☘"
              />
            </div>
          )}
        </section>

        <div className="furrow" style={{ margin: "30px 0" }} />

        {/* Setup checklist for reviewers and new farmers */}
        <section style={styles.setupCard}>
          <div style={styles.sectionHeader}>
            <div>
              <p className="mono" style={styles.sectionEyebrow}>
                FARMER SETUP CHECKLIST
              </p>

              <h2 style={styles.sectionTitle}>
                Build your Farmverse record
              </h2>
            </div>

            <span style={styles.setupProgress}>
              {completedSteps}/3 complete
            </span>
          </div>

          <div style={styles.setupGrid}>
            {setupSteps.map((step, index) => {
              const content = (
                <>
                  <span
                    style={{
                      ...styles.setupNumber,
                      ...(step.done ? styles.setupNumberDone : {}),
                    }}
                  >
                    {step.done ? "✓" : `0${index + 1}`}
                  </span>

                  <span style={styles.setupIcon}>{step.icon}</span>

                  <div style={styles.setupTextWrap}>
                    <strong style={styles.setupTitle}>{step.label}</strong>
                    <p style={styles.setupDescription}>{step.description}</p>
                  </div>

                  <span style={styles.setupArrow}>→</span>
                </>
              );

              if (step.link.startsWith("#")) {
                return (
                  <a
                    key={step.label}
                    href={step.link}
                    style={{
                      ...styles.setupStep,
                      ...(step.done ? styles.setupStepDone : {}),
                    }}
                  >
                    {content}
                  </a>
                );
              }

              return (
                <Link
                  key={step.label}
                  to={step.link}
                  style={{
                    ...styles.setupStep,
                    ...(step.done ? styles.setupStepDone : {}),
                  }}
                >
                  {content}
                </Link>
              );
            })}
          </div>
        </section>

        <div className="furrow" style={{ margin: "30px 0" }} />

        {/* Listings and marketplace */}
        <section id="produce-listings" style={styles.listingLayout}>
          <div style={styles.listingPanel}>
            <div style={styles.sectionHeader}>
              <div>
                <p className="mono" style={styles.sectionEyebrow}>
                  LOCAL MARKETPLACE
                </p>

                <h2 style={styles.sectionTitle}>Produce listings</h2>
              </div>

              <span style={styles.listingCount}>
                {listings.length} active
              </span>
            </div>

            {listings.length === 0 ? (
              <div style={styles.emptyListing}>
                <span style={styles.emptyIcon}>▣</span>

                <h3 style={styles.emptyTitle}>
                  Your local marketplace is ready.
                </h3>

                <p style={styles.emptyText}>
                  When your crop is ready for sale, add its quantity and price
                  here. Buyers will later be able to discover fresh produce
                  directly from your farm.
                </p>

                <div style={styles.demoPreview}>
                  <span className="mono" style={styles.demoLabel}>
                    EXAMPLE LISTING
                  </span>

                  <div style={styles.demoRow}>
                    <strong>Tomato</strong>
                    <span>100 kg</span>
                    <span>₹40/kg</span>
                  </div>
                </div>
              </div>
            ) : (
              <div style={styles.listings}>
                {listings.map((listing) => (
                  <article key={listing.id} style={styles.listingRow}>
                    <div style={styles.listingCropWrap}>
                      <div style={styles.cropInitial}>
                        {listing.cropName?.charAt(0)?.toUpperCase() || "C"}
                      </div>

                      <div>
                        <strong style={styles.listingCrop}>
                          {listing.cropName}
                        </strong>

                        <p style={styles.listingSubtext}>
                          Available from your farm
                        </p>
                      </div>
                    </div>

                    <div style={styles.listingData}>
                      <span>QUANTITY</span>
                      <strong>
                        {listing.quantity} {listing.unit}
                      </strong>
                    </div>

                    <div style={styles.listingData}>
                      <span>PRICE</span>
                      <strong>
                        ₹{listing.price}/{listing.unit}
                      </strong>
                    </div>

                    <button
                      style={styles.removeBtn}
                      onClick={() => handleDeleteListing(listing.id)}
                      title="Remove listing"
                    >
                      ✕
                    </button>
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* Add new produce listing */}
          <aside style={styles.addListingCard}>
            <p className="mono" style={styles.sectionEyebrow}>
              NEW LISTING
            </p>

            <h2 style={styles.sectionTitle}>List fresh produce</h2>

            <p style={styles.addDescription}>
              Add the quantity and price so nearby buyers know what is
              available from your farm.
            </p>

            <div style={styles.field}>
              <label style={styles.label}>Select crop from your records</label>

              <select
                name="cropId"
                value={listingData.cropId}
                onChange={handleListingChange}
                style={styles.input}
              >
                <option value="">Select crop</option>

                {crops.map((crop) => (
                  <option key={crop.id} value={crop.id}>
                    {crop.cropName}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Crop name *</label>

              <input
                name="cropName"
                placeholder="Example: Tomato"
                value={listingData.cropName}
                onChange={handleListingChange}
                style={styles.input}
              />
            </div>

            <div style={styles.twoColumn}>
              <div style={styles.field}>
                <label style={styles.label}>Quantity *</label>

                <input
                  name="quantity"
                  type="number"
                  min="0"
                  placeholder="100"
                  value={listingData.quantity}
                  onChange={handleListingChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Unit</label>

                <select
                  name="unit"
                  value={listingData.unit}
                  onChange={handleListingChange}
                  style={styles.input}
                >
                  <option value="kg">kg</option>
                  <option value="tons">tons</option>
                  <option value="quintal">quintal</option>
                  <option value="pieces">pieces</option>
                </select>
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Price per unit (₹) *</label>

              <input
                name="price"
                type="number"
                min="0"
                placeholder="40"
                value={listingData.price}
                onChange={handleListingChange}
                style={styles.input}
              />
            </div>

            <button style={styles.addBtn} onClick={handleAddListing}>
              Add produce listing →
            </button>
          </aside>
        </section>
      </div>
    </main>
  );
};

const InfoCard = ({ label, value, icon }) => (
  <div style={styles.infoCard}>
    <span style={styles.infoIcon}>{icon}</span>

    <div>
      <span className="mono" style={styles.infoLabel}>
        {label}
      </span>

      <strong style={styles.infoValue}>{value}</strong>
    </div>
  </div>
);

const ProfileInput = ({ label, name, value, onChange }) => (
  <div style={styles.field}>
    <label style={styles.label}>{label}</label>

    <input
      name={name}
      value={value}
      onChange={onChange}
      style={styles.input}
    />
  </div>
);

const styles = {
  page: {
    minHeight: "calc(100vh - 65px)",
    padding: "40px 20px 65px",
  },

  container: {
    maxWidth: "1180px",
    margin: "0 auto",
  },

  banner: {
    minHeight: "255px",
    position: "relative",
    overflow: "hidden",
    borderRadius: "6px",
    border: "1px solid rgba(201,162,39,0.25)",
    display: "flex",
    alignItems: "center",
  },

  bannerImage: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  bannerOverlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(90deg, rgba(11,10,8,0.96), rgba(11,10,8,0.72), rgba(11,10,8,0.28))",
  },

  bannerContent: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "35px 38px 65px",
  },

  avatar: {
    width: "62px",
    height: "62px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    background: "#c9a227",
    color: "#0b0a08",
    fontFamily: "'Fraunces', serif",
    fontSize: "1.8rem",
    fontWeight: 600,
  },

  profileIdentity: {
    flex: 1,
  },

  eyebrow: {
    color: "#d9b538",
    fontSize: "0.68rem",
    letterSpacing: "0.14em",
    marginBottom: "8px",
  },

  name: {
    color: "#f3ede0",
    fontSize: "2rem",
    fontWeight: 500,
    margin: 0,
  },

  contact: {
    color: "#c5bcad",
    fontSize: "0.83rem",
    margin: "5px 0 0",
  },

  logoutBtn: {
    background: "transparent",
    border: "1px solid rgba(224,122,79,0.5)",
    color: "#f0a17e",
    padding: "9px 14px",
    borderRadius: "3px",
    cursor: "pointer",
    alignSelf: "flex-start",
  },

  bannerFooter: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
    display: "flex",
    justifyContent: "space-between",
    gap: "15px",
    padding: "14px 38px",
    color: "#b7ad9d",
    background: "rgba(10,9,7,0.72)",
    borderTop: "1px solid rgba(243,237,224,0.09)",
    fontSize: "0.76rem",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "14px",
    marginTop: "18px",
  },

  statCard: {
    display: "flex",
    gap: "13px",
    background: "#1a1712",
    border: "1px solid rgba(243,237,224,0.1)",
    borderRadius: "4px",
    padding: "18px",
  },

  statIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "35px",
    height: "35px",
    color: "#e3bc3f",
    background: "rgba(201,162,39,0.1)",
    borderRadius: "3px",
  },

  statLabel: {
    display: "block",
    color: "#7c5432",
    fontSize: "0.65rem",
    letterSpacing: "0.08em",
  },

  statValue: {
    display: "block",
    color: "#f3ede0",
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: "1.45rem",
    marginTop: "6px",
  },

  statText: {
    display: "block",
    color: "#e3bc3f",
    fontSize: "1.1rem",
    marginTop: "8px",
  },

  statHint: {
    display: "block",
    color: "#80776b",
    fontSize: "0.72rem",
    marginTop: "4px",
    lineHeight: 1.4,
  },

  quickLinks: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginTop: "18px",
  },

  quickLink: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#d4cbbb",
    background: "#151310",
    border: "1px solid rgba(201,162,39,0.18)",
    borderRadius: "3px",
    padding: "9px 12px",
    fontSize: "0.79rem",
    textDecoration: "none",
  },

  sectionCard: {
    background: "#1a1712",
    border: "1px solid rgba(201,162,39,0.2)",
    borderRadius: "5px",
    padding: "28px",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "15px",
  },

  sectionEyebrow: {
    color: "#7c5432",
    fontSize: "0.67rem",
    letterSpacing: "0.1em",
    marginBottom: "7px",
  },

  sectionTitle: {
    color: "#f3ede0",
    fontSize: "1.18rem",
    fontWeight: 500,
    margin: 0,
  },

  editBtn: {
    background: "transparent",
    border: "1px solid rgba(201,162,39,0.4)",
    color: "#e3bc3f",
    padding: "8px 12px",
    borderRadius: "3px",
    cursor: "pointer",
  },

  editActions: {
    display: "flex",
    gap: "8px",
  },

  saveBtn: {
    background: "#c9a227",
    border: "none",
    color: "#0b0a08",
    padding: "8px 12px",
    borderRadius: "3px",
    cursor: "pointer",
    fontWeight: 700,
  },

  cancelBtn: {
    background: "transparent",
    color: "#a8a094",
    border: "1px solid rgba(243,237,224,0.2)",
    padding: "8px 12px",
    borderRadius: "3px",
    cursor: "pointer",
  },

  message: {
    color: "#e3bc3f",
    fontSize: "0.82rem",
    marginTop: "12px",
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "11px",
    marginTop: "20px",
  },

  infoCard: {
    display: "flex",
    gap: "10px",
    padding: "14px",
    background: "#151310",
    border: "1px solid rgba(243,237,224,0.08)",
  },

  infoIcon: {
    color: "#c9a227",
    fontSize: "1.1rem",
  },

  infoLabel: {
    display: "block",
    color: "#7c5432",
    fontSize: "0.62rem",
    letterSpacing: "0.07em",
  },

  infoValue: {
    display: "block",
    color: "#f3ede0",
    fontSize: "0.82rem",
    fontWeight: 500,
    marginTop: "6px",
    wordBreak: "break-word",
  },

  editGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "12px",
    marginTop: "18px",
  },

  field: {
    marginTop: "14px",
  },

  label: {
    display: "block",
    color: "#a8a094",
    fontSize: "0.77rem",
    marginBottom: "6px",
  },

  input: {
    width: "100%",
    background: "#12110e",
    color: "#f3ede0",
    border: "1px solid rgba(243,237,224,0.15)",
    borderRadius: "3px",
    padding: "10px",
    outline: "none",
    fontFamily: "inherit",
  },

  setupCard: {
    background: "#1a1712",
    border: "1px solid rgba(201,162,39,0.2)",
    borderRadius: "5px",
    padding: "28px",
  },

  setupProgress: {
    color: "#e3bc3f",
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: "0.75rem",
  },

  setupGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
    marginTop: "20px",
  },

  setupStep: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#cfc6b8",
    textDecoration: "none",
    background: "#151310",
    border: "1px solid rgba(243,237,224,0.1)",
    padding: "15px",
    minHeight: "100px",
    borderRadius: "3px",
  },

  setupStepDone: {
    border: "1px solid rgba(201,162,39,0.45)",
    background: "rgba(201,162,39,0.07)",
  },

  setupNumber: {
    minWidth: "28px",
    height: "28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#e3bc3f",
    background: "rgba(201,162,39,0.12)",
    border: "1px solid rgba(201,162,39,0.25)",
    borderRadius: "50%",
    fontSize: "0.7rem",
    fontFamily: "'IBM Plex Mono', monospace",
  },

  setupNumberDone: {
    background: "#c9a227",
    color: "#0b0a08",
  },

  setupIcon: {
    color: "#c9a227",
    fontSize: "1.15rem",
  },

  setupTextWrap: {
    flex: 1,
  },

  setupTitle: {
    display: "block",
    color: "#f3ede0",
    fontSize: "0.85rem",
  },

  setupDescription: {
    color: "#8c8377",
    fontSize: "0.72rem",
    lineHeight: 1.45,
    margin: "4px 0 0",
  },

  setupArrow: {
    color: "#e3bc3f",
    fontSize: "0.9rem",
  },

  listingLayout: {
    display: "grid",
    gridTemplateColumns: "1.2fr 0.8fr",
    gap: "20px",
  },

  listingPanel: {
    background: "#1a1712",
    border: "1px solid rgba(201,162,39,0.2)",
    borderRadius: "5px",
    padding: "28px",
  },

  addListingCard: {
    height: "fit-content",
    background: "#1a1712",
    border: "1px solid rgba(201,162,39,0.2)",
    borderRadius: "5px",
    padding: "28px",
  },

  listingCount: {
    color: "#e3bc3f",
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: "0.72rem",
  },

  addDescription: {
    color: "#91887b",
    fontSize: "0.78rem",
    lineHeight: 1.55,
    marginTop: "10px",
  },

  emptyListing: {
    color: "#a8a094",
    textAlign: "center",
    padding: "52px 20px",
  },

  emptyIcon: {
    display: "block",
    color: "#7c5432",
    fontSize: "2.3rem",
    marginBottom: "10px",
  },

  emptyTitle: {
    color: "#f3ede0",
    fontSize: "1.05rem",
    fontWeight: 500,
  },

  emptyText: {
    maxWidth: "450px",
    margin: "10px auto 0",
    color: "#a8a094",
    fontSize: "0.83rem",
    lineHeight: 1.6,
  },

  demoPreview: {
    maxWidth: "420px",
    margin: "22px auto 0",
    padding: "12px",
    background: "rgba(201,162,39,0.05)",
    border: "1px dashed rgba(201,162,39,0.3)",
    textAlign: "left",
  },

  demoLabel: {
    color: "#7c5432",
    fontSize: "0.65rem",
    letterSpacing: "0.08em",
  },

  demoRow: {
    display: "grid",
    gridTemplateColumns: "1fr auto auto",
    gap: "15px",
    marginTop: "9px",
    color: "#d8d0c3",
    fontSize: "0.78rem",
  },

  listings: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "20px",
  },

  listingRow: {
    display: "grid",
    gridTemplateColumns: "1.5fr 0.8fr 0.8fr auto",
    alignItems: "center",
    gap: "10px",
    background: "#151310",
    border: "1px solid rgba(243,237,224,0.08)",
    padding: "12px",
  },

  listingCropWrap: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  cropInitial: {
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    background: "rgba(201,162,39,0.12)",
    color: "#e3bc3f",
    fontFamily: "'Fraunces', serif",
  },

  listingCrop: {
    color: "#f3ede0",
    fontSize: "0.9rem",
  },

  listingSubtext: {
    color: "#7e7569",
    fontSize: "0.68rem",
    margin: "3px 0 0",
  },

  listingData: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    color: "#f3ede0",
    fontSize: "0.77rem",
  },

  removeBtn: {
    background: "transparent",
    border: "none",
    color: "#e07a4f",
    cursor: "pointer",
    fontSize: "0.9rem",
  },

  twoColumn: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
  },

  addBtn: {
    width: "100%",
    background: "#c9a227",
    color: "#0b0a08",
    border: "none",
    padding: "12px",
    borderRadius: "3px",
    cursor: "pointer",
    fontWeight: 700,
    marginTop: "20px",
  },
};

export default FarmerProfile;