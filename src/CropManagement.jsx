import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  addCrop,
  deleteCrop,
  getCrops,
  getFarms,
  updateCrop,
} from "./api.js";

const CROP_IMAGE =
  "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1600&q=85";

const initialCrop = {
  farmId: "",
  cropName: "",
  variety: "",
  season: "",
  plantingDate: "",
  expectedHarvestDate: "",
  fieldArea: "",
  soilPh: "",
  nitrogen: "",
  phosphorus: "",
  potassium: "",
  growthStage: "Seedling",
  cropStatus: "Planted",
  estimatedYield: "",
};

const CropManagement = ({ user }) => {
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [formData, setFormData] = useState(initialCrop);
  const [editingId, setEditingId] = useState(null);
  const [showSoilDetails, setShowSoilDetails] = useState(false);
  const [message, setMessage] = useState("");

  const loadData = () => {
    setFarms(getFarms(user.id));
    setCrops(getCrops(user.id));
  };

  useEffect(() => {
    if (user?.id) loadData();
  }, [user?.id]);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const resetForm = () => {
    setFormData(initialCrop);
    setEditingId(null);
    setShowSoilDetails(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setMessage("");

    if (!formData.farmId || !formData.cropName || !formData.plantingDate) {
      setMessage("Select a farm, enter crop name, and add planting date.");
      return;
    }

    if (editingId) {
      updateCrop(user.id, editingId, formData);
      setMessage("Crop record updated successfully.");
    } else {
      addCrop(user.id, formData);
      setMessage("Crop added successfully.");
    }

    resetForm();
    loadData();
  };

  const handleEdit = (crop) => {
    setEditingId(crop.id);

    setFormData({
      farmId: crop.farmId || "",
      cropName: crop.cropName || "",
      variety: crop.variety || "",
      season: crop.season || "",
      plantingDate: crop.plantingDate || "",
      expectedHarvestDate: crop.expectedHarvestDate || "",
      fieldArea: crop.fieldArea || "",
      soilPh: crop.soilPh || "",
      nitrogen: crop.nitrogen || "",
      phosphorus: crop.phosphorus || "",
      potassium: crop.potassium || "",
      growthStage: crop.growthStage || "Seedling",
      cropStatus: crop.cropStatus || "Planted",
      estimatedYield: crop.estimatedYield || "",
    });

    setShowSoilDetails(
      Boolean(crop.soilPh || crop.nitrogen || crop.phosphorus || crop.potassium)
    );

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (cropId) => {
    if (!window.confirm("Delete this crop record?")) return;

    deleteCrop(user.id, cropId);
    loadData();
    setMessage("Crop record deleted.");
  };

  if (farms.length === 0) {
    return (
      <main style={styles.page}>
        <div style={styles.container}>
          <p className="mono" style={styles.eyebrow}>CROP MANAGEMENT</p>
          <h1 style={styles.title}>Add a farm before adding crops.</h1>

          <section style={styles.notice}>
            <span style={styles.noticeIcon}>⌖</span>
            <h2 style={styles.noticeTitle}>No farm record found.</h2>
            <p>
              A crop must be connected to a farm or field. Create your farm
              record first, then come back to add crops.
            </p>
            <Link to="/farm-management" style={styles.primaryBtn}>
              Go to farm management →
            </Link>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <img src={CROP_IMAGE} alt="Growing crop field" style={styles.heroImage} />
          <div style={styles.heroOverlay} />

          <div style={styles.heroContent}>
            <p className="mono" style={styles.eyebrow}>CROP MANAGEMENT</p>
            <h1 style={styles.title}>Follow every crop season.</h1>
            <p style={styles.subtitle}>
              Record planting, crop stage, harvest planning, and expected yield.
              Soil test values are optional.
            </p>
          </div>

          <div style={styles.heroStats}>
            <div>
              <span>CROP RECORDS</span>
              <strong>{crops.length}</strong>
            </div>
            <div>
              <span>FARMS AVAILABLE</span>
              <strong>{farms.length}</strong>
            </div>
          </div>
        </section>

        <div style={styles.layout}>
          <section style={styles.formCard}>
            <div style={styles.headingRow}>
              <div>
                <p className="mono" style={styles.cardEyebrow}>
                  {editingId ? "EDIT CROP" : "NEW CROP RECORD"}
                </p>
                <h2 style={styles.sectionTitle}>
                  {editingId ? "Update crop details" : "Add a crop to your farm"}
                </h2>
              </div>
              <span style={styles.formIcon}>☘</span>
            </div>

            {message && <p style={styles.message}>{message}</p>}

            <form onSubmit={handleSubmit}>
              <div style={styles.field}>
                <label style={styles.label}>Farm *</label>
                <select name="farmId" value={formData.farmId} onChange={handleChange} style={styles.input}>
                  <option value="">Select a farm</option>
                  {farms.map((farm) => (
                    <option key={farm.id} value={farm.id}>
                      {farm.farmName} — {farm.location}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.twoColumn}>
                <Field label="Crop name *" name="cropName" value={formData.cropName} onChange={handleChange} placeholder="Example: Tomato" />
                <Field label="Variety" name="variety" value={formData.variety} onChange={handleChange} placeholder="Example: Hybrid" />
              </div>

              <div style={styles.twoColumn}>
                <div style={styles.field}>
                  <label style={styles.label}>Season</label>
                  <select name="season" value={formData.season} onChange={handleChange} style={styles.input}>
                    <option value="">Select season</option>
                    <option value="Kharif">Kharif / Monsoon</option>
                    <option value="Rabi">Rabi / Winter</option>
                    <option value="Zaid">Zaid / Summer</option>
                  </select>
                </div>

                <Field label="Field area (acres)" type="number" name="fieldArea" value={formData.fieldArea} onChange={handleChange} placeholder="Example: 2.5" />
              </div>

              <div style={styles.twoColumn}>
                <Field label="Planting date *" type="date" name="plantingDate" value={formData.plantingDate} onChange={handleChange} />
                <Field label="Expected harvest" type="date" name="expectedHarvestDate" value={formData.expectedHarvestDate} onChange={handleChange} />
              </div>

              <div style={styles.twoColumn}>
                <div style={styles.field}>
                  <label style={styles.label}>Growth stage</label>
                  <select name="growthStage" value={formData.growthStage} onChange={handleChange} style={styles.input}>
                    <option value="Seedling">Seedling</option>
                    <option value="Vegetative">Vegetative</option>
                    <option value="Flowering">Flowering</option>
                    <option value="Fruiting">Fruiting</option>
                    <option value="Maturity">Maturity</option>
                  </select>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Crop status</label>
                  <select name="cropStatus" value={formData.cropStatus} onChange={handleChange} style={styles.input}>
                    <option value="Planned">Planned</option>
                    <option value="Planted">Planted</option>
                    <option value="Growing">Growing</option>
                    <option value="Ready for Harvest">Ready for Harvest</option>
                    <option value="Harvested">Harvested</option>
                  </select>
                </div>
              </div>

              <Field label="Estimated yield (kg)" type="number" name="estimatedYield" value={formData.estimatedYield} onChange={handleChange} placeholder="Example: 1200" />

              <section style={styles.soilSection}>
                <button
                  type="button"
                  style={styles.soilToggle}
                  onClick={() => setShowSoilDetails(!showSoilDetails)}
                >
                  <span>
                    <strong>Soil and nutrient details</strong>
                    <small>Optional — add only if you have a soil test report</small>
                  </span>
                  <span style={styles.plus}>{showSoilDetails ? "−" : "+"}</span>
                </button>

                {showSoilDetails && (
                  <div style={styles.soilContent}>
                    <p style={styles.soilNote}>
                      You can leave these values empty. They can be entered later
                      using a Soil Health Card or laboratory report.
                    </p>

                    <div style={styles.fourColumn}>
                      <Field label="Soil pH" type="number" name="soilPh" value={formData.soilPh} onChange={handleChange} placeholder="6.5" />
                      <Field label="Nitrogen (N)" type="number" name="nitrogen" value={formData.nitrogen} onChange={handleChange} placeholder="90" />
                      <Field label="Phosphorus (P)" type="number" name="phosphorus" value={formData.phosphorus} onChange={handleChange} placeholder="42" />
                      <Field label="Potassium (K)" type="number" name="potassium" value={formData.potassium} onChange={handleChange} placeholder="43" />
                    </div>
                  </div>
                )}
              </section>

              <div style={styles.buttonRow}>
                <button type="submit" style={styles.primaryBtn}>
                  {editingId ? "Save changes" : "Add crop"}
                </button>

                {editingId && (
                  <button type="button" style={styles.cancelBtn} onClick={resetForm}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </section>

          <section style={styles.listCard}>
            <p className="mono" style={styles.cardEyebrow}>CROP RECORDS</p>
            <h2 style={styles.sectionTitle}>
              {crops.length} {crops.length === 1 ? "crop" : "crops"} on record
            </h2>

            {crops.length === 0 ? (
              <div style={styles.empty}>
                <span style={styles.emptyIcon}>☘</span>
                <h3>No crop records yet.</h3>
                <p>Add your first crop record to begin tracking this season.</p>
              </div>
            ) : (
              <div style={styles.cropList}>
                {crops.map((crop) => {
                  const farm = farms.find((item) => item.id === crop.farmId);

                  return (
                    <article key={crop.id} style={styles.cropCard}>
                      <div style={styles.cropTop}>
                        <div style={styles.cropNameRow}>
                          <div style={styles.cropCircle}>
                            {crop.cropName?.charAt(0)?.toUpperCase() || "C"}
                          </div>

                          <div>
                            <h3 style={styles.cropName}>{crop.cropName}</h3>
                            <p style={styles.cropFarm}>
                              {farm?.farmName || "Farm not found"}
                            </p>
                          </div>
                        </div>

                        <span style={styles.status}>{crop.cropStatus}</span>
                      </div>

                      <div style={styles.cropDetails}>
                        <span><strong>Season:</strong> {crop.season || "Not set"}</span>
                        <span><strong>Stage:</strong> {crop.growthStage || "Not set"}</span>
                        <span><strong>Area:</strong> {crop.fieldArea || "0"} acres</span>
                        <span><strong>Yield:</strong> {crop.estimatedYield || "0"} kg</span>
                        <span><strong>Planting:</strong> {crop.plantingDate}</span>
                        <span><strong>Harvest:</strong> {crop.expectedHarvestDate || "Not set"}</span>
                      </div>

                      {(crop.soilPh || crop.nitrogen || crop.phosphorus || crop.potassium) && (
                        <div style={styles.npkBox}>
                          <span>N: {crop.nitrogen || "-"}</span>
                          <span>P: {crop.phosphorus || "-"}</span>
                          <span>K: {crop.potassium || "-"}</span>
                          <span>pH: {crop.soilPh || "-"}</span>
                        </div>
                      )}

                      <div style={styles.cardButtons}>
                        <button style={styles.editBtn} onClick={() => handleEdit(crop)}>
                          Edit
                        </button>

                        <button style={styles.deleteBtn} onClick={() => handleDelete(crop.id)}>
                          Delete
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
};

const Field = ({ label, name, type = "text", value, onChange, placeholder }) => (
  <div style={styles.field}>
    <label style={styles.label}>{label}</label>
    <input
      type={type}
      min={type === "number" ? "0" : undefined}
      step={type === "number" ? "0.01" : undefined}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={styles.input}
    />
  </div>
);

const styles = {
  page: { minHeight: "calc(100vh - 65px)", padding: "38px 20px 65px" },
  container: { maxWidth: "1200px", margin: "0 auto" },
  hero: { minHeight: "250px", position: "relative", overflow: "hidden", borderRadius: "6px", border: "1px solid rgba(201,162,39,0.24)", display: "flex", alignItems: "center", marginBottom: "22px" },
  heroImage: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" },
  heroOverlay: { position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(11,10,8,0.95), rgba(11,10,8,0.72), rgba(11,10,8,0.27))" },
  heroContent: { position: "relative", zIndex: 1, maxWidth: "650px", padding: "35px" },
  eyebrow: { color: "#d9b538", fontSize: "0.69rem", letterSpacing: "0.14em", marginBottom: "10px" },
  title: { color: "#f3ede0", fontSize: "2rem", fontWeight: 500, margin: 0 },
  subtitle: { color: "#c9c0b2", lineHeight: 1.6, margin: "10px 0 0" },
  heroStats: { position: "absolute", zIndex: 2, right: "28px", bottom: "24px", display: "flex", gap: "10px" },
  layout: { display: "grid", gridTemplateColumns: "minmax(330px, 1fr) minmax(390px, 1fr)", gap: "20px" },
  formCard: { background: "#1a1712", border: "1px solid rgba(201,162,39,0.2)", borderRadius: "5px", padding: "29px" },
  listCard: { background: "#1a1712", border: "1px solid rgba(201,162,39,0.2)", borderRadius: "5px", padding: "29px" },
  headingRow: { display: "flex", justifyContent: "space-between", gap: "15px" },
  cardEyebrow: { color: "#7c5432", fontSize: "0.67rem", letterSpacing: "0.1em", marginBottom: "7px" },
  sectionTitle: { color: "#f3ede0", fontSize: "1.18rem", fontWeight: 500, margin: 0 },
  formIcon: { color: "#c9a227", fontSize: "1.5rem" },
  message: { color: "#e3bc3f", fontSize: "0.84rem", marginTop: "12px" },
  field: { marginTop: "16px" },
  label: { display: "block", color: "#a8a094", fontSize: "0.78rem", marginBottom: "6px" },
  input: { width: "100%", background: "#12110e", color: "#f3ede0", border: "1px solid rgba(243,237,224,0.15)", borderRadius: "3px", padding: "10px", outline: "none", fontFamily: "inherit" },
  twoColumn: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
  fourColumn: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "9px" },
  soilSection: { marginTop: "23px", border: "1px solid rgba(201,162,39,0.18)", background: "rgba(201,162,39,0.04)" },
  soilToggle: { width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", color: "#f3ede0", background: "transparent", border: "none", textAlign: "left", padding: "13px", cursor: "pointer" },
  soilContent: { padding: "0 13px 14px" },
  soilNote: { color: "#a8a094", fontSize: "0.74rem", lineHeight: 1.5, margin: 0, padding: "9px", background: "rgba(11,10,8,0.3)" },
  plus: { color: "#e3bc3f", fontSize: "1.3rem" },
  buttonRow: { display: "flex", gap: "10px", marginTop: "26px" },
  primaryBtn: { display: "inline-block", background: "#c9a227", color: "#0b0a08", border: "none", textDecoration: "none", borderRadius: "3px", padding: "11px 17px", fontWeight: 700, cursor: "pointer" },
  cancelBtn: { background: "transparent", border: "1px solid rgba(243,237,224,0.2)", color: "#a8a094", borderRadius: "3px", padding: "11px 17px", cursor: "pointer" },
  notice: { maxWidth: "570px", background: "#1a1712", border: "1px solid rgba(201,162,39,0.2)", padding: "30px", marginTop: "28px", color: "#a8a094", lineHeight: 1.6 },
  noticeIcon: { color: "#c9a227", fontSize: "2rem" },
  noticeTitle: { color: "#f3ede0", fontWeight: 500 },
  empty: { color: "#a8a094", textAlign: "center", padding: "80px 15px", lineHeight: 1.6 },
  emptyIcon: { display: "block", color: "#7c5432", fontSize: "2.5rem", marginBottom: "10px" },
  cropList: { marginTop: "22px", display: "flex", flexDirection: "column", gap: "12px" },
  cropCard: { background: "#151310", border: "1px solid rgba(243,237,224,0.1)", borderLeft: "3px solid rgba(201,162,39,0.6)", borderRadius: "4px", padding: "19px" },
  cropTop: { display: "flex", justifyContent: "space-between", gap: "13px" },
  cropNameRow: { display: "flex", alignItems: "center", gap: "10px" },
  cropCircle: { width: "35px", height: "35px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(201,162,39,0.12)", color: "#e3bc3f", fontFamily: "'Fraunces', serif" },
  cropName: { color: "#f3ede0", fontSize: "1.04rem", margin: 0 },
  cropFarm: { color: "#8e867a", fontSize: "0.76rem", margin: "4px 0 0" },
  status: { color: "#e3bc3f", border: "1px solid rgba(201,162,39,0.35)", borderRadius: "14px", fontSize: "0.67rem", padding: "4px 8px", whiteSpace: "nowrap" },
  cropDetails: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px", color: "#a8a094", fontSize: "0.75rem", marginTop: "17px" },
  npkBox: { display: "flex", flexWrap: "wrap", gap: "12px", color: "#cfc8b8", fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.7rem", marginTop: "15px", padding: "9px", background: "rgba(201,162,39,0.06)" },
  cardButtons: { display: "flex", justifyContent: "flex-end", gap: "9px", marginTop: "17px" },
  editBtn: { background: "transparent", color: "#e3bc3f", border: "1px solid rgba(201,162,39,0.4)", padding: "7px 11px", borderRadius: "2px", cursor: "pointer" },
  deleteBtn: { background: "transparent", color: "#e07a4f", border: "1px solid rgba(224,122,79,0.4)", padding: "7px 11px", borderRadius: "2px", cursor: "pointer" },
};

export default CropManagement;