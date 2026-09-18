import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getFarms, savePrediction } from "./api.js";

const CROP_ADVISOR_IMAGE =
  "https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?auto=format&fit=crop&w=1600&q=85";

const initialForm = {
  farmId: "",
  location: "",
  season: "",
  soilType: "",
  waterAvailability: "",
  irrigationType: "",
  farmingType: "",
};

const cropCatalog = [
  {
    crop: "Tomato",
    seasons: ["Rabi", "Zaid"],
    soils: ["Loamy", "Red Soil", "Black Soil"],
    water: ["Medium", "High"],
    irrigation: ["Drip Irrigation", "Sprinkler", "Borewell"],
    reason: "Suitable for controlled irrigation and good market demand.",
  },
  {
    crop: "Onion",
    seasons: ["Rabi"],
    soils: ["Black Soil", "Loamy"],
    water: ["Medium"],
    irrigation: ["Drip Irrigation", "Borewell"],
    reason: "Good option for Rabi season with well-drained soil.",
  },
  {
    crop: "Chickpea",
    seasons: ["Rabi"],
    soils: ["Black Soil", "Red Soil", "Loamy"],
    water: ["Low", "Medium"],
    irrigation: ["Rain-fed", "Borewell", "Drip Irrigation"],
    reason: "Needs comparatively less water and suits Rabi season.",
  },
  {
    crop: "Wheat",
    seasons: ["Rabi"],
    soils: ["Loamy", "Clay", "Black Soil"],
    water: ["Medium", "High"],
    irrigation: ["Canal", "Borewell", "Sprinkler"],
    reason: "Common Rabi crop where irrigation is available.",
  },
  {
    crop: "Soybean",
    seasons: ["Kharif"],
    soils: ["Black Soil", "Loamy"],
    water: ["Medium"],
    irrigation: ["Rain-fed", "Drip Irrigation"],
    reason: "Popular Kharif crop for black soil regions.",
  },
  {
    crop: "Cotton",
    seasons: ["Kharif"],
    soils: ["Black Soil"],
    water: ["Medium"],
    irrigation: ["Rain-fed", "Drip Irrigation", "Borewell"],
    reason: "Black soil retains moisture and supports cotton growth.",
  },
  {
    crop: "Maize",
    seasons: ["Kharif", "Rabi", "Zaid"],
    soils: ["Loamy", "Red Soil", "Black Soil"],
    water: ["Medium", "High"],
    irrigation: ["Rain-fed", "Sprinkler", "Borewell"],
    reason: "Flexible crop across seasons with proper water management.",
  },
  {
    crop: "Groundnut",
    seasons: ["Kharif", "Zaid"],
    soils: ["Sandy", "Red Soil", "Loamy"],
    water: ["Low", "Medium"],
    irrigation: ["Rain-fed", "Sprinkler", "Borewell"],
    reason: "Works well in light and well-drained soils.",
  },
  {
    crop: "Bajra",
    seasons: ["Kharif", "Zaid"],
    soils: ["Sandy", "Red Soil"],
    water: ["Low"],
    irrigation: ["Rain-fed"],
    reason: "Drought tolerant and suitable where water availability is low.",
  },
  {
    crop: "Watermelon",
    seasons: ["Zaid"],
    soils: ["Sandy", "Loamy"],
    water: ["Medium", "High"],
    irrigation: ["Drip Irrigation", "Borewell"],
    reason: "Good summer crop with drip irrigation and warm conditions.",
  },
];

const scoreCrop = (item, formData) => {
  let score = 0;
  const reasons = [];

  if (formData.season && item.seasons.includes(formData.season)) {
    score += 3;
    reasons.push(`Matches ${formData.season} season.`);
  }

  if (formData.soilType && item.soils.includes(formData.soilType)) {
    score += 2;
    reasons.push(`Suitable for ${formData.soilType}.`);
  }

  if (
    formData.waterAvailability &&
    item.water.includes(formData.waterAvailability)
  ) {
    score += 2;
    reasons.push(
      `Fits ${formData.waterAvailability.toLowerCase()} water availability.`
    );
  }

  if (
    formData.irrigationType &&
    item.irrigation.includes(formData.irrigationType)
  ) {
    score += 1;
    reasons.push(`Matches ${formData.irrigationType}.`);
  }

  return {
    ...item,
    score,
    reasons,
  };
};

const CropRecommendation = ({ user }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const farmIdFromUrl = searchParams.get("farmId");

  const [farms, setFarms] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState("");
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    const savedFarms = getFarms(user.id);
    setFarms(savedFarms);

    if (farmIdFromUrl) {
      const selectedFarm = savedFarms.find(
        (farm) => Number(farm.id) === Number(farmIdFromUrl)
      );

      if (selectedFarm) {
        setFormData((previous) => ({
          ...previous,
          farmId: String(selectedFarm.id),
          location: selectedFarm.location || "",
          soilType: selectedFarm.soilType || "",
          irrigationType: selectedFarm.irrigationType || "",
          farmingType: selectedFarm.farmingType || "",
        }));
      }
    }
  }, [user?.id, farmIdFromUrl]);

  const selectedFarm = farms.find(
    (farm) => Number(farm.id) === Number(formData.farmId)
  );

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });

    setResults([]);
    setGenerated(false);
  };

  const handleFarmSelect = (event) => {
    const farmId = event.target.value;

    setResults([]);
    setGenerated(false);
    setMessage("");

    if (!farmId) {
      setSearchParams({});

      setFormData({
        ...formData,
        farmId: "",
        location: "",
        soilType: "",
        irrigationType: "",
        farmingType: "",
      });

      return;
    }

    const farm = farms.find((item) => Number(item.id) === Number(farmId));

    if (!farm) return;

    setSearchParams({ farmId });

    setFormData({
      ...formData,
      farmId,
      location: farm.location || "",
      soilType: farm.soilType || "",
      irrigationType: farm.irrigationType || "",
      farmingType: farm.farmingType || "",
    });
  };

  const generateRecommendations = (event) => {
    event.preventDefault();
    setMessage("");
    setGenerated(true);

    if (!formData.season || !formData.waterAvailability) {
      setMessage("Select season and water availability to recommend crops.");
      setResults([]);
      return;
    }

    const recommended = cropCatalog
      .map((crop) => scoreCrop(crop, formData))
      .filter((crop) => crop.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    setResults(recommended);

    if (recommended.length === 0) {
      setMessage(
        "No strong crop match found. Try changing season, soil type, or water availability."
      );
      return;
    }

    savePrediction(user.id, {
      predictionType: "Crop Recommendation",
      result:
        recommended.map((item) => item.crop).join(", ") || "No crop found",
      inputData: formData,
      recommendations: recommended,
    });
  };

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <img
            src={CROP_ADVISOR_IMAGE}
            alt="Crop field"
            style={styles.heroImage}
          />
          <div style={styles.heroOverlay} />

          <div style={styles.heroContent}>
            <p className="mono" style={styles.eyebrow}>
              CROP RECOMMENDATION
            </p>

            <h1 style={styles.title}>Choose crops for your farm conditions.</h1>

            <p style={styles.subtitle}>
              Get crop suggestions using season, soil type, irrigation, and
              water availability.
            </p>
          </div>
        </section>

        <div style={styles.layout}>
          <section style={styles.card}>
            <p className="mono" style={styles.cardEyebrow}>
              FARM CONDITIONS
            </p>

            <h2 style={styles.sectionTitle}>Enter details</h2>

            {farmIdFromUrl && selectedFarm && (
              <p style={styles.selectedHint}>
                Farm auto-selected from Farm Management:{" "}
                <strong>{selectedFarm.farmName}</strong>
              </p>
            )}

            {message && <p style={styles.errorMessage}>{message}</p>}

            <form onSubmit={generateRecommendations}>
              <div style={styles.field}>
                <label style={styles.label}>Use saved farm</label>

                <select
                  name="farmId"
                  value={formData.farmId}
                  onChange={handleFarmSelect}
                  style={styles.input}
                >
                  <option value="">Manual entry</option>

                  {farms.map((farm) => (
                    <option key={farm.id} value={farm.id}>
                      {farm.farmName} — {farm.location}
                    </option>
                  ))}
                </select>
              </div>

              <Field
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Example: Nashik, Maharashtra"
              />

              <div style={styles.twoColumn}>
                <SelectField
                  label="Season *"
                  name="season"
                  value={formData.season}
                  onChange={handleChange}
                  options={[
                    ["", "Select season"],
                    ["Kharif", "Kharif / Monsoon"],
                    ["Rabi", "Rabi / Winter"],
                    ["Zaid", "Zaid / Summer"],
                  ]}
                />

                <SelectField
                  label="Water availability *"
                  name="waterAvailability"
                  value={formData.waterAvailability}
                  onChange={handleChange}
                  options={[
                    ["", "Select water availability"],
                    ["Low", "Low"],
                    ["Medium", "Medium"],
                    ["High", "High"],
                  ]}
                />
              </div>

              <div style={styles.twoColumn}>
                <SelectField
                  label="Soil type"
                  name="soilType"
                  value={formData.soilType}
                  onChange={handleChange}
                  options={[
                    ["", "Not known"],
                    ["Black Soil", "Black Soil"],
                    ["Red Soil", "Red Soil"],
                    ["Loamy", "Loamy"],
                    ["Clay", "Clay"],
                    ["Sandy", "Sandy"],
                    ["Silty", "Silty"],
                  ]}
                />

                <SelectField
                  label="Irrigation type"
                  name="irrigationType"
                  value={formData.irrigationType}
                  onChange={handleChange}
                  options={[
                    ["", "Not known"],
                    ["Drip Irrigation", "Drip Irrigation"],
                    ["Sprinkler", "Sprinkler"],
                    ["Canal", "Canal"],
                    ["Rain-fed", "Rain-fed"],
                    ["Borewell", "Borewell"],
                  ]}
                />
              </div>

              <button type="submit" style={styles.primaryBtn}>
                Recommend crops →
              </button>
            </form>
          </section>

          <section style={styles.card}>
            <p className="mono" style={styles.cardEyebrow}>
              RECOMMENDED CROPS
            </p>

            {results.length === 0 ? (
              <div style={styles.empty}>
                <span style={styles.emptyIcon}>☘</span>

                <h3>
                  {generated
                    ? "No crop recommendation found."
                    : "No crop recommendation yet."}
                </h3>

                <p>
                  {generated
                    ? "Try changing season, soil type, irrigation, or water availability."
                    : "Enter your farm conditions to get crop suggestions."}
                </p>
              </div>
            ) : (
              <div style={styles.resultList}>
                {results.map((item, index) => (
                  <article key={item.crop} style={styles.resultCard}>
                    <div style={styles.resultTop}>
                      <span style={styles.rank}>{index + 1}</span>

                      <div>
                        <h3 style={styles.cropName}>{item.crop}</h3>
                        <p style={styles.reason}>{item.reason}</p>
                      </div>
                    </div>

                    <ul style={styles.reasonList}>
                      {item.reasons.map((reason, reasonIndex) => (
                        <li key={reasonIndex}>{reason}</li>
                      ))}
                    </ul>
                  </article>
                ))}

                <p style={styles.warning}>
                  Recommendation is general. Confirm with local agriculture
                  officer or KVK before final crop selection.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
};

const Field = ({ label, name, value, onChange, placeholder }) => (
  <div style={styles.field}>
    <label style={styles.label}>{label}</label>

    <input
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

const styles = {
  page: {
    minHeight: "calc(100vh - 65px)",
    padding: "38px 20px 65px",
  },
  container: {
    maxWidth: "1180px",
    margin: "0 auto",
  },
  hero: {
    minHeight: "250px",
    position: "relative",
    overflow: "hidden",
    borderRadius: "6px",
    border: "1px solid rgba(201,162,39,0.24)",
    display: "flex",
    alignItems: "center",
    marginBottom: "22px",
  },
  heroImage: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  heroOverlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(90deg, rgba(11,10,8,0.96), rgba(11,10,8,0.72), rgba(11,10,8,0.25))",
  },
  heroContent: {
    position: "relative",
    zIndex: 1,
    maxWidth: "650px",
    padding: "35px",
  },
  eyebrow: {
    color: "#d9b538",
    fontSize: "0.69rem",
    letterSpacing: "0.14em",
    marginBottom: "10px",
  },
  title: {
    color: "#f3ede0",
    fontSize: "2rem",
    fontWeight: 500,
    margin: 0,
  },
  subtitle: {
    color: "#c9c0b2",
    lineHeight: 1.6,
    marginTop: "10px",
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "0.9fr 1.1fr",
    gap: "20px",
  },
  card: {
    background: "#1a1712",
    border: "1px solid rgba(201,162,39,0.2)",
    borderRadius: "5px",
    padding: "29px",
  },
  cardEyebrow: {
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
  selectedHint: {
    color: "#e3bc3f",
    background: "rgba(201,162,39,0.08)",
    border: "1px solid rgba(201,162,39,0.22)",
    padding: "9px",
    borderRadius: "3px",
    fontSize: "0.8rem",
    marginTop: "12px",
    lineHeight: 1.5,
  },
  field: {
    marginTop: "16px",
  },
  label: {
    display: "block",
    color: "#a8a094",
    fontSize: "0.79rem",
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
  twoColumn: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  primaryBtn: {
    marginTop: "26px",
    background: "#c9a227",
    color: "#0b0a08",
    border: "none",
    borderRadius: "3px",
    padding: "11px 17px",
    fontWeight: 700,
    cursor: "pointer",
  },
  empty: {
    color: "#a8a094",
    textAlign: "center",
    padding: "80px 15px",
    lineHeight: 1.6,
  },
  emptyIcon: {
    display: "block",
    color: "#7c5432",
    fontSize: "2.4rem",
    marginBottom: "10px",
  },
  resultList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginTop: "15px",
  },
  resultCard: {
    background: "#151310",
    border: "1px solid rgba(243,237,224,0.1)",
    borderLeft: "3px solid rgba(201,162,39,0.65)",
    padding: "15px",
    borderRadius: "4px",
  },
  resultTop: {
    display: "flex",
    gap: "12px",
    alignItems: "flex-start",
  },
  rank: {
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    background: "#c9a227",
    color: "#0b0a08",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
  },
  cropName: {
    color: "#f3ede0",
    margin: 0,
    fontSize: "1.05rem",
  },
  reason: {
    color: "#a8a094",
    margin: "5px 0 0",
    fontSize: "0.82rem",
    lineHeight: 1.5,
  },
  reasonList: {
    color: "#cfc8b8",
    fontSize: "0.78rem",
    lineHeight: 1.7,
    marginTop: "10px",
  },
  warning: {
    color: "#ffc1a6",
    background: "rgba(224,122,79,0.08)",
    border: "1px solid rgba(224,122,79,0.22)",
    padding: "12px",
    borderRadius: "3px",
    fontSize: "0.82rem",
    lineHeight: 1.55,
  },
  errorMessage: {
    color: "#ffc1a6",
    background: "rgba(224,122,79,0.08)",
    border: "1px solid rgba(224,122,79,0.22)",
    padding: "9px",
    borderRadius: "3px",
    fontSize: "0.84rem",
    marginTop: "12px",
  },
};

export default CropRecommendation;