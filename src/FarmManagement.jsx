import React, { useEffect, useState } from "react";
import { addFarm, deleteFarm, getFarms, updateFarm } from "./api.js";

const FARM_IMAGE =
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=85";

const emptyFarm = {
  farmName: "",
  location: "",
  landSize: "",
  landUnit: "acres",
  soilType: "",
  irrigationType: "",
  farmingType: "",
};

const FarmManagement = ({ user }) => {
  const [farms, setFarms] = useState([]);
  const [formData, setFormData] = useState(emptyFarm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  const loadFarms = () => setFarms(getFarms(user.id));

  useEffect(() => {
    if (user?.id) loadFarms();
  }, [user?.id]);

  const totalLand = farms.reduce(
    (total, farm) => total + Number(farm.landSize || 0),
    0
  );

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const resetForm = () => {
    setFormData(emptyFarm);
    setEditingId(null);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setMessage("");

    if (!formData.farmName || !formData.location || !formData.landSize) {
      setMessage("Farm name, location, and land size are required.");
      return;
    }

    if (Number(formData.landSize) <= 0) {
      setMessage("Land size must be greater than zero.");
      return;
    }

    if (editingId) {
      updateFarm(user.id, editingId, formData);
      setMessage("Farm details updated successfully.");
    } else {
      addFarm(user.id, formData);
      setMessage("Farm added successfully.");
    }

    resetForm();
    loadFarms();
  };

  const handleEdit = (farm) => {
    setEditingId(farm.id);

    setFormData({
      farmName: farm.farmName || "",
      location: farm.location || "",
      landSize: farm.landSize || "",
      landUnit: farm.landUnit || "acres",
      soilType: farm.soilType || "",
      irrigationType: farm.irrigationType || "",
      farmingType: farm.farmingType || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (farmId) => {
    if (
      !window.confirm(
        "Delete this farm? Crop records connected to this farm will also be deleted."
      )
    ) {
      return;
    }

    deleteFarm(user.id, farmId);
    loadFarms();
    setMessage("Farm deleted successfully.");
  };

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <img src={FARM_IMAGE} alt="Green farm field" style={styles.heroImage} />
          <div style={styles.heroOverlay} />

          <div style={styles.heroContent}>
            <p className="mono" style={styles.eyebrow}>FARM MANAGEMENT</p>
            <h1 style={styles.title}>Keep every field on record.</h1>
            <p style={styles.subtitle}>
              Add farm locations, land size, irrigation methods, and farming
              details for every field you manage.
            </p>
          </div>

          <div style={styles.heroStats}>
            <div>
              <span>FARMS</span>
              <strong>{farms.length}</strong>
            </div>
            <div>
              <span>LAND AREA</span>
              <strong>{totalLand} acres</strong>
            </div>
          </div>
        </section>

        <div style={styles.layout}>
          <section style={styles.formCard}>
            <p className="mono" style={styles.cardEyebrow}>
              {editingId ? "EDIT FARM RECORD" : "NEW FARM RECORD"}
            </p>

            <h2 style={styles.sectionTitle}>
              {editingId ? "Update farm details" : "Add a farm or field"}
            </h2>

            <p style={styles.formHint}>
              Basic farm details are enough to start. Soil type and irrigation
              can be updated later.
            </p>

            {message && <p style={styles.message}>{message}</p>}

            <form onSubmit={handleSubmit}>
              <Field label="Farm name *" name="farmName" value={formData.farmName} onChange={handleChange} placeholder="Example: Green Valley Farm" />
              <Field label="Village / location *" name="location" value={formData.location} onChange={handleChange} placeholder="Example: Nashik, Maharashtra" />

              <div style={styles.twoColumn}>
                <Field label="Land size *" type="number" name="landSize" value={formData.landSize} onChange={handleChange} placeholder="Example: 5" />

                <div style={styles.field}>
                  <label style={styles.label}>Unit</label>
                  <select name="landUnit" value={formData.landUnit} onChange={handleChange} style={styles.input}>
                    <option value="acres">Acres</option>
                    <option value="hectares">Hectares</option>
                    <option value="sq ft">Square feet</option>
                  </select>
                </div>
              </div>

              <div style={styles.twoColumn}>
                <SelectField
                  label="Soil type (optional)"
                  name="soilType"
                  value={formData.soilType}
                  onChange={handleChange}
                  options={[
                    ["", "I do not know"],
                    ["Black Soil", "Black Soil"],
                    ["Red Soil", "Red Soil"],
                    ["Loamy", "Loamy"],
                    ["Clay", "Clay"],
                    ["Sandy", "Sandy"],
                    ["Silty", "Silty"],
                  ]}
                />

                <SelectField
                  label="Irrigation (optional)"
                  name="irrigationType"
                  value={formData.irrigationType}
                  onChange={handleChange}
                  options={[
                    ["", "Not added yet"],
                    ["Drip Irrigation", "Drip Irrigation"],
                    ["Sprinkler", "Sprinkler"],
                    ["Canal", "Canal"],
                    ["Rain-fed", "Rain-fed"],
                    ["Borewell", "Borewell"],
                  ]}
                />
              </div>

              <SelectField
                label="Farming type (optional)"
                name="farmingType"
                value={formData.farmingType}
                onChange={handleChange}
                options={[
                  ["", "Not added yet"],
                  ["Organic", "Organic"],
                  ["Conventional", "Conventional"],
                  ["Natural Farming", "Natural Farming"],
                  ["Mixed Farming", "Mixed Farming"],
                  ["Hydroponic", "Hydroponic"],
                ]}
              />

              <div style={styles.buttonRow}>
                <button type="submit" style={styles.primaryBtn}>
                  {editingId ? "Save changes" : "Add farm"}
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
            <div style={styles.listHeader}>
              <div>
                <p className="mono" style={styles.cardEyebrow}>REGISTERED FARMS</p>
                <h2 style={styles.sectionTitle}>
                  {farms.length} {farms.length === 1 ? "farm" : "farms"} on record
                </h2>
              </div>
            </div>

            {farms.length === 0 ? (
              <div style={styles.empty}>
                <span style={styles.emptyIcon}>⌖</span>
                <h3>No farms added yet.</h3>
                <p>Use the form to create your first farm record.</p>
              </div>
            ) : (
              <div style={styles.farmList}>
                {farms.map((farm) => (
                  <article key={farm.id} style={styles.farmCard}>
                    <div style={styles.farmTop}>
                      <div style={styles.farmSymbol}>⌖</div>

                      <div style={{ flex: 1 }}>
                        <h3 style={styles.farmName}>{farm.farmName}</h3>
                        <p style={styles.location}>📍 {farm.location}</p>
                      </div>

                      <span style={styles.landBadge}>
                        {farm.landSize} {farm.landUnit}
                      </span>
                    </div>

                    <div style={styles.farmInfo}>
                      <FarmInfo label="SOIL TYPE" value={farm.soilType || "Not added"} />
                      <FarmInfo label="IRRIGATION" value={farm.irrigationType || "Not added"} />
                      <FarmInfo label="FARMING TYPE" value={farm.farmingType || "Not added"} />
                    </div>

                    <div style={styles.cardButtons}>
                      <button style={styles.editBtn} onClick={() => handleEdit(farm)}>
                        Edit details
                      </button>

                      <button style={styles.deleteBtn} onClick={() => handleDelete(farm.id)}>
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
};

const Field = ({ label, name, value, onChange, placeholder, type = "text" }) => (
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

const SelectField = ({ label, name, value, onChange, options }) => (
  <div style={styles.field}>
    <label style={styles.label}>{label}</label>
    <select name={name} value={value} onChange={onChange} style={styles.input}>
      {options.map(([optionValue, optionLabel]) => (
        <option key={optionValue} value={optionValue}>
          {optionLabel}
        </option>
      ))}
    </select>
  </div>
);

const FarmInfo = ({ label, value }) => (
  <div style={styles.infoBox}>
    <span className="mono">{label}</span>
    <strong>{value}</strong>
  </div>
);

const styles = {
  page: { minHeight: "calc(100vh - 65px)", padding: "38px 20px 65px" },
  container: { maxWidth: "1180px", margin: "0 auto" },

  hero: { minHeight: "250px", position: "relative", overflow: "hidden", borderRadius: "6px", border: "1px solid rgba(201,162,39,0.24)", display: "flex", alignItems: "center", marginBottom: "22px" },
  heroImage: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" },
  heroOverlay: { position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(11,10,8,0.95), rgba(11,10,8,0.72), rgba(11,10,8,0.25))" },
  heroContent: { position: "relative", zIndex: 1, maxWidth: "630px", padding: "35px" },
  eyebrow: { color: "#d9b538", fontSize: "0.69rem", letterSpacing: "0.14em", marginBottom: "10px" },
  title: { color: "#f3ede0", fontSize: "2rem", fontWeight: 500, margin: 0 },
  subtitle: { color: "#c9c0b2", lineHeight: 1.6, margin: "10px 0 0" },
  heroStats: { position: "absolute", zIndex: 2, right: "28px", bottom: "24px", display: "flex", gap: "10px" },
  layout: { display: "grid", gridTemplateColumns: "minmax(320px, 0.9fr) minmax(390px, 1.1fr)", gap: "20px" },

  formCard: { background: "#1a1712", border: "1px solid rgba(201,162,39,0.2)", borderRadius: "5px", padding: "29px" },
  listCard: { background: "#1a1712", border: "1px solid rgba(201,162,39,0.2)", borderRadius: "5px", padding: "29px" },
  cardEyebrow: { color: "#7c5432", fontSize: "0.67rem", letterSpacing: "0.1em", marginBottom: "7px" },
  sectionTitle: { color: "#f3ede0", fontSize: "1.18rem", fontWeight: 500, margin: 0 },
  formHint: { color: "#8d8579", fontSize: "0.78rem", lineHeight: 1.5, marginTop: "11px" },
  message: { color: "#e3bc3f", fontSize: "0.84rem", marginTop: "12px" },
  field: { marginTop: "16px" },
  label: { display: "block", color: "#a8a094", fontSize: "0.79rem", marginBottom: "6px" },
  input: { width: "100%", background: "#12110e", color: "#f3ede0", border: "1px solid rgba(243,237,224,0.15)", borderRadius: "3px", padding: "10px", outline: "none", fontFamily: "inherit" },
  twoColumn: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
  buttonRow: { display: "flex", gap: "10px", marginTop: "26px" },
  primaryBtn: { background: "#c9a227", color: "#0b0a08", border: "none", borderRadius: "3px", padding: "11px 17px", fontWeight: 700, cursor: "pointer" },
  cancelBtn: { background: "transparent", color: "#a8a094", border: "1px solid rgba(243,237,224,0.2)", borderRadius: "3px", padding: "11px 17px", cursor: "pointer" },

  empty: { color: "#a8a094", textAlign: "center", padding: "80px 15px", lineHeight: 1.6 },
  emptyIcon: { display: "block", color: "#7c5432", fontSize: "2.4rem", marginBottom: "10px" },
  farmList: { display: "flex", flexDirection: "column", gap: "12px", marginTop: "22px" },
  farmCard: { background: "#151310", border: "1px solid rgba(243,237,224,0.1)", borderLeft: "3px solid rgba(201,162,39,0.65)", padding: "19px", borderRadius: "4px" },
  farmTop: { display: "flex", alignItems: "flex-start", gap: "11px" },
  farmSymbol: { width: "35px", height: "35px", display: "flex", alignItems: "center", justifyContent: "center", color: "#e3bc3f", background: "rgba(201,162,39,0.1)", borderRadius: "3px" },
  farmName: { color: "#f3ede0", fontSize: "1.06rem", fontWeight: 500, margin: 0 },
  location: { color: "#a8a094", fontSize: "0.78rem", margin: "5px 0 0" },
  landBadge: { color: "#e3bc3f", border: "1px solid rgba(201,162,39,0.35)", padding: "5px 8px", borderRadius: "13px", fontSize: "0.68rem", fontFamily: "'IBM Plex Mono', monospace", whiteSpace: "nowrap" },
  farmInfo: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginTop: "17px" },
  infoBox: { display: "flex", flexDirection: "column", gap: "5px", padding: "10px", background: "rgba(201,162,39,0.05)", color: "#a8a094", fontSize: "0.67rem" },
  cardButtons: { display: "flex", justifyContent: "flex-end", gap: "9px", marginTop: "17px" },
  editBtn: { background: "transparent", border: "1px solid rgba(201,162,39,0.42)", color: "#e3bc3f", padding: "7px 11px", borderRadius: "2px", cursor: "pointer" },
  deleteBtn: { background: "transparent", border: "1px solid rgba(224,122,79,0.4)", color: "#e07a4f", padding: "7px 11px", borderRadius: "2px", cursor: "pointer" },
};

export default FarmManagement;