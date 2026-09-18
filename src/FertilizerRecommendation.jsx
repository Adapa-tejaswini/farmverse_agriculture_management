import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getCrops, getFarms, savePrediction } from "./api.js";

const FERTILIZER_IMAGE =
  "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1600&q=85";

const initialForm = {
  cropId: "",
  cropName: "",
  growthStage: "Seedling",
  soilType: "",
  soilPh: "",
  nitrogen: "",
  phosphorus: "",
  potassium: "",
  irrigationType: "",
};

const toNumber = (value) => {
  if (value === "" || value === null || value === undefined) return null;

  const number = Number(value);

  return Number.isNaN(number) ? null : number;
};

const getLevel = (value, low, high) => {
  const number = toNumber(value);

  if (number === null) {
    return {
      status: "Not provided",
      tone: "warning",
    };
  }

  if (number < low) {
    return {
      status: "Low",
      tone: "danger",
    };
  }

  if (number > high) {
    return {
      status: "High",
      tone: "warning",
    };
  }

  return {
    status: "Moderate",
    tone: "success",
  };
};

const getStageAdvice = (stage) => {
  const advice = {
    Seedling:
      "Use gentle nutrition. Avoid heavy fertilizer because young roots are sensitive.",
    Vegetative:
      "Crop needs leaf and stem growth support. Avoid excess nitrogen because it can increase pests and weak growth.",
    Flowering:
      "Avoid excess nitrogen. Focus on flower retention, phosphorus support, potassium support, and stable irrigation.",
    Fruiting:
      "Potassium and steady moisture are important for fruit size and quality. Avoid sudden dry/wet stress.",
    Maturity:
      "Avoid unnecessary nitrogen. Focus on crop maturity, harvest quality, and disease monitoring.",
  };

  return advice[stage] || "Follow crop-stage based nutrient management.";
};

const buildFormFromCrop = (crop, farm) => {
  return {
    cropId: String(crop?.id || ""),
    cropName: crop?.cropName || "",
    growthStage: crop?.growthStage || "Seedling",
    soilType: farm?.soilType || "",
    soilPh: crop?.soilPh || "",
    nitrogen: crop?.nitrogen || "",
    phosphorus: crop?.phosphorus || "",
    potassium: crop?.potassium || "",
    irrigationType: farm?.irrigationType || "",
  };
};

const FertilizerRecommendation = ({ user }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const cropIdFromUrl = searchParams.get("cropId");

  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user?.id) return;

    const savedFarms = getFarms(user.id);
    const savedCrops = getCrops(user.id);

    setFarms(savedFarms);
    setCrops(savedCrops);

    if (cropIdFromUrl) {
      const selectedCrop = savedCrops.find(
        (crop) => Number(crop.id) === Number(cropIdFromUrl)
      );

      if (selectedCrop) {
        const selectedFarm = savedFarms.find(
          (farm) => Number(farm.id) === Number(selectedCrop.farmId)
        );

        setFormData(buildFormFromCrop(selectedCrop, selectedFarm));
      }
    }
  }, [user?.id, cropIdFromUrl]);

  const selectedCrop = crops.find(
    (crop) => Number(crop.id) === Number(formData.cropId)
  );

  const selectedFarm = farms.find(
    (farm) => Number(farm.id) === Number(selectedCrop?.farmId)
  );

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });

    setResult(null);
    setMessage("");
  };

  const handleCropSelect = (event) => {
    const cropId = event.target.value;

    setResult(null);
    setMessage("");

    if (!cropId) {
      setSearchParams({});
      setFormData(initialForm);
      return;
    }

    const crop = crops.find((item) => Number(item.id) === Number(cropId));
    const farm = farms.find((item) => Number(item.id) === Number(crop?.farmId));

    if (!crop) return;

    setSearchParams({ cropId });
    setFormData(buildFormFromCrop(crop, farm));
  };

  const generateRecommendation = (event) => {
    event.preventDefault();
    setMessage("");

    if (!formData.cropName.trim()) {
      setMessage("Enter crop name or select a crop record.");
      return;
    }

    const nitrogenStatus = getLevel(formData.nitrogen, 50, 120);
    const phosphorusStatus = getLevel(formData.phosphorus, 25, 70);
    const potassiumStatus = getLevel(formData.potassium, 120, 300);
    const soilPh = toNumber(formData.soilPh);

    const observations = [];

    if (soilPh === null) {
      observations.push(
        "Soil pH is not provided. Add soil pH from a soil test for better guidance."
      );
    } else if (soilPh < 5.5) {
      observations.push(
        "Soil appears acidic. Nutrient availability may reduce in acidic soil."
      );
    } else if (soilPh > 7.8) {
      observations.push(
        "Soil appears alkaline. Some micronutrients may become less available."
      );
    } else {
      observations.push("Soil pH looks generally suitable for many crops.");
    }

    observations.push(`Nitrogen status: ${nitrogenStatus.status}.`);
    observations.push(`Phosphorus status: ${phosphorusStatus.status}.`);
    observations.push(`Potassium status: ${potassiumStatus.status}.`);

    const recommendations = [];

    if (nitrogenStatus.status === "Low") {
      recommendations.push(
        "Nitrogen may need attention for healthy vegetative growth. Use soil-test based local guidance."
      );
    } else if (nitrogenStatus.status === "High") {
      recommendations.push(
        "Avoid excess nitrogen. It can cause too much leaf growth and increase pest/disease risk."
      );
    }

    if (phosphorusStatus.status === "Low") {
      recommendations.push(
        "Phosphorus may need attention for root development, flowering, and early crop establishment."
      );
    }

    if (potassiumStatus.status === "Low") {
      recommendations.push(
        "Potassium may need attention for fruit quality, stress tolerance, and crop strength."
      );
    }

    if (formData.growthStage === "Flowering") {
      recommendations.push(
        "During flowering, avoid excess nitrogen and maintain steady soil moisture."
      );
    }

    if (formData.growthStage === "Fruiting") {
      recommendations.push(
        "During fruiting, potassium support and stable irrigation are important."
      );
    }

    if (recommendations.length === 0) {
      recommendations.push(
        "Nutrient values look generally balanced. Continue monitoring crop growth and soil moisture."
      );
    }

    const finalResult = {
      cropName: formData.cropName,
      growthStage: formData.growthStage,
      stageAdvice: getStageAdvice(formData.growthStage),
      observations,
      recommendations,
      warning:
        "This is general fertilizer guidance only. Do not apply exact fertilizer quantity without a soil test or local agriculture expert advice.",
    };

    setResult(finalResult);

    savePrediction(user.id, {
      predictionType: "Fertilizer Recommendation",
      result: `${formData.cropName} - ${formData.growthStage}`,
      inputData: formData,
      recommendations: finalResult,
    });
  };

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <img
            src={FERTILIZER_IMAGE}
            alt="Fertilizer field"
            style={styles.heroImage}
          />
          <div style={styles.heroOverlay} />

          <div style={styles.heroContent}>
            <p className="mono" style={styles.eyebrow}>
              FERTILIZER RECOMMENDATION
            </p>

            <h1 style={styles.title}>Get nutrient guidance for your crop.</h1>

            <p style={styles.subtitle}>
              Use crop stage, soil pH, and NPK values to get safe fertilizer
              guidance.
            </p>
          </div>
        </section>

        <div style={styles.layout}>
          <section style={styles.card}>
            <p className="mono" style={styles.cardEyebrow}>
              INPUT DETAILS
            </p>

            <h2 style={styles.sectionTitle}>Crop and soil information</h2>

            {cropIdFromUrl && selectedCrop && (
              <p style={styles.selectedHint}>
                Crop auto-selected from Crop Management:{" "}
                <strong>{selectedCrop.cropName}</strong>
                {selectedFarm?.farmName && ` from ${selectedFarm.farmName}`}
              </p>
            )}

            {message && <p style={styles.errorMessage}>{message}</p>}

            <form onSubmit={generateRecommendation}>
              <div style={styles.field}>
                <label style={styles.label}>Use saved crop record</label>

                <select
                  name="cropId"
                  value={formData.cropId}
                  onChange={handleCropSelect}
                  style={styles.input}
                >
                  <option value="">Manual entry</option>

                  {crops.map((crop) => (
                    <option key={crop.id} value={crop.id}>
                      {crop.cropName} — {crop.growthStage || "Stage not set"}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.twoColumn}>
                <Field
                  label="Crop name *"
                  name="cropName"
                  value={formData.cropName}
                  onChange={handleChange}
                  placeholder="Example: Tomato"
                />

                <div style={styles.field}>
                  <label style={styles.label}>Growth stage</label>

                  <select
                    name="growthStage"
                    value={formData.growthStage}
                    onChange={handleChange}
                    style={styles.input}
                  >
                    <option value="Seedling">Seedling</option>
                    <option value="Vegetative">Vegetative</option>
                    <option value="Flowering">Flowering</option>
                    <option value="Fruiting">Fruiting</option>
                    <option value="Maturity">Maturity</option>
                  </select>
                </div>
              </div>

              <div style={styles.twoColumn}>
                <div style={styles.field}>
                  <label style={styles.label}>Soil type</label>

                  <select
                    name="soilType"
                    value={formData.soilType}
                    onChange={handleChange}
                    style={styles.input}
                  >
                    <option value="">Not known</option>
                    <option value="Black Soil">Black Soil</option>
                    <option value="Red Soil">Red Soil</option>
                    <option value="Loamy">Loamy</option>
                    <option value="Clay">Clay</option>
                    <option value="Sandy">Sandy</option>
                    <option value="Silty">Silty</option>
                  </select>
                </div>

                <Field
                  label="Soil pH"
                  type="number"
                  name="soilPh"
                  value={formData.soilPh}
                  onChange={handleChange}
                  placeholder="Example: 6.5"
                />
              </div>

              <div style={styles.threeColumn}>
                <Field
                  label="Nitrogen (N)"
                  type="number"
                  name="nitrogen"
                  value={formData.nitrogen}
                  onChange={handleChange}
                  placeholder="Optional"
                />

                <Field
                  label="Phosphorus (P)"
                  type="number"
                  name="phosphorus"
                  value={formData.phosphorus}
                  onChange={handleChange}
                  placeholder="Optional"
                />

                <Field
                  label="Potassium (K)"
                  type="number"
                  name="potassium"
                  value={formData.potassium}
                  onChange={handleChange}
                  placeholder="Optional"
                />
              </div>

              <button type="submit" style={styles.primaryBtn}>
                Generate recommendation →
              </button>
            </form>
          </section>

          <section style={styles.card}>
            <p className="mono" style={styles.cardEyebrow}>
              RESULT
            </p>

            {!result ? (
              <div style={styles.empty}>
                <span style={styles.emptyIcon}>♧</span>
                <h3>No recommendation yet.</h3>
                <p>Enter crop and nutrient details to generate guidance.</p>
              </div>
            ) : (
              <div>
                <h2 style={styles.resultTitle}>
                  {result.cropName} — {result.growthStage}
                </h2>

                <div style={styles.resultBox}>
                  <strong>Stage advice</strong>
                  <p>{result.stageAdvice}</p>
                </div>

                <div style={styles.resultBox}>
                  <strong>Observations</strong>
                  <ul>
                    {result.observations.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div style={styles.resultBox}>
                  <strong>Recommendations</strong>
                  <ul>
                    {result.recommendations.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                <p style={styles.warning}>{result.warning}</p>
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
  container: { maxWidth: "1180px", margin: "0 auto" },
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
  title: { color: "#f3ede0", fontSize: "2rem", fontWeight: 500, margin: 0 },
  subtitle: { color: "#c9c0b2", lineHeight: 1.6, marginTop: "10px" },
  layout: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" },
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
  field: { marginTop: "16px" },
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
  twoColumn: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
  threeColumn: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
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
  resultTitle: { color: "#f3ede0", fontSize: "1.25rem", fontWeight: 500 },
  resultBox: {
    background: "#151310",
    border: "1px solid rgba(243,237,224,0.1)",
    color: "#cfc8b8",
    padding: "14px",
    borderRadius: "4px",
    marginTop: "13px",
    lineHeight: 1.6,
    fontSize: "0.86rem",
  },
  warning: {
    color: "#ffc1a6",
    background: "rgba(224,122,79,0.08)",
    border: "1px solid rgba(224,122,79,0.22)",
    padding: "12px",
    borderRadius: "3px",
    marginTop: "14px",
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

export default FertilizerRecommendation;