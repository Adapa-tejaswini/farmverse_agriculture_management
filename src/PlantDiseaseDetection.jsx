import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  getCrops,
  getFarms,
  savePrediction,
  sendLeafImageMessage,
} from "./api.js";

const DISEASE_IMAGE =
  "https://images.unsplash.com/photo-1515150144380-bca9f1650ed9?auto=format&fit=crop&w=1600&q=85";

const PlantDiseaseDetection = ({ user }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const cropIdFromUrl = searchParams.get("cropId");

  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [cropId, setCropId] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fileInputRef = useRef(null);

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
        setCropId(String(selectedCrop.id));
      }
    }
  }, [user?.id, cropIdFromUrl]);

  const selectedCrop = crops.find((crop) => Number(crop.id) === Number(cropId));

  const selectedFarm = farms.find(
    (farm) => Number(farm.id) === Number(selectedCrop?.farmId)
  );

  const handleCropSelect = (event) => {
    const selectedCropId = event.target.value;

    setCropId(selectedCropId);
    setResult("");
    setMessage("");

    if (selectedCropId) {
      setSearchParams({ cropId: selectedCropId });
    } else {
      setSearchParams({});
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("Image size must be less than 5 MB.");
      return;
    }

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult("");
    setMessage("");
  };

  const removeImage = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setImage(null);
    setPreview("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const analyzeImage = async (event) => {
    event.preventDefault();
    setMessage("");
    setResult("");

    if (!image) {
      setMessage("Please upload a leaf or plant image.");
      return;
    }

    const prompt = `
Please analyze this crop/leaf image.

Crop name: ${selectedCrop?.cropName || "Not provided"}
Growth stage: ${selectedCrop?.growthStage || "Not provided"}
Crop status: ${selectedCrop?.cropStatus || "Not provided"}
Farm name: ${selectedFarm?.farmName || "Not provided"}
Farm location: ${selectedFarm?.location || "Not provided"}
Soil type: ${selectedFarm?.soilType || "Not provided"}
Irrigation: ${selectedFarm?.irrigationType || "Not provided"}
Farmer symptoms/notes: ${symptoms || "Not provided"}

Please detect possible pest, disease, water stress, heat stress, or nutrient deficiency.
Give safe immediate steps first.
Do not give exact pesticide, fungicide, insecticide, or fertilizer dosage.
Mention that exact chemical/fertilizer dosage requires KVK/agriculture officer/certified expert advice.
`;

    setLoading(true);

    try {
      const data = await sendLeafImageMessage({
        message: prompt,
        image,
        farmId: selectedFarm?.id || null,
        cropId: selectedCrop?.id || null,
      });

      setResult(data.reply);

      savePrediction(user.id, {
        predictionType: "Plant Disease Detection",
        result: selectedCrop?.cropName || "Leaf image scan",
        inputData: {
          cropId,
          cropName: selectedCrop?.cropName || "",
          farmName: selectedFarm?.farmName || "",
          symptoms,
          imageName: image.name,
        },
        recommendations: {
          reply: data.reply,
        },
      });
    } catch (err) {
      setMessage(err.message || "Could not analyze image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <img
            src={DISEASE_IMAGE}
            alt="Plant disease"
            style={styles.heroImage}
          />
          <div style={styles.heroOverlay} />

          <div style={styles.heroContent}>
            <p className="mono" style={styles.eyebrow}>
              PLANT DISEASE DETECTION
            </p>

            <h1 style={styles.title}>Upload a leaf image for AI analysis.</h1>

            <p style={styles.subtitle}>
              Detect possible pest, disease, water stress, or nutrient
              deficiency signs from crop images.
            </p>
          </div>
        </section>

        <div style={styles.layout}>
          <section style={styles.card}>
            <p className="mono" style={styles.cardEyebrow}>
              IMAGE SCAN
            </p>

            <h2 style={styles.sectionTitle}>Upload affected leaf or plant</h2>

            {cropIdFromUrl && selectedCrop && (
              <p style={styles.selectedHint}>
                Crop auto-selected from Crop Management:{" "}
                <strong>{selectedCrop.cropName}</strong>
                {selectedFarm?.farmName && ` from ${selectedFarm.farmName}`}
              </p>
            )}

            {message && <p style={styles.errorMessage}>{message}</p>}

            <form onSubmit={analyzeImage}>
              <div style={styles.field}>
                <label style={styles.label}>Connect crop record</label>

                <select
                  value={cropId}
                  onChange={handleCropSelect}
                  style={styles.input}
                >
                  <option value="">No crop selected</option>

                  {crops.map((crop) => (
                    <option key={crop.id} value={crop.id}>
                      {crop.cropName} — {crop.growthStage || "Stage not set"}
                    </option>
                  ))}
                </select>
              </div>

              {selectedCrop && (
                <div style={styles.cropContext}>
                  <span>
                    <strong>Crop:</strong> {selectedCrop.cropName}
                  </span>
                  <span>
                    <strong>Stage:</strong>{" "}
                    {selectedCrop.growthStage || "Not set"}
                  </span>
                  <span>
                    <strong>Farm:</strong>{" "}
                    {selectedFarm?.farmName || "Farm not found"}
                  </span>
                  <span>
                    <strong>Location:</strong>{" "}
                    {selectedFarm?.location || "Not set"}
                  </span>
                </div>
              )}

              <div style={styles.field}>
                <label style={styles.label}>Symptoms or farmer notes</label>

                <textarea
                  value={symptoms}
                  onChange={(event) => setSymptoms(event.target.value)}
                  placeholder="Example: Yellow spots, curling leaves, small insects under leaves..."
                  style={styles.textarea}
                  rows="4"
                />
              </div>

              <div style={styles.uploadBox}>
                {preview ? (
                  <>
                    <img
                      src={preview}
                      alt="Selected leaf"
                      style={styles.preview}
                    />

                    <button
                      type="button"
                      style={styles.removeBtn}
                      onClick={removeImage}
                    >
                      Remove image
                    </button>
                  </>
                ) : (
                  <>
                    <span style={styles.uploadIcon}>📷</span>

                    <p>Choose a clear image of the affected leaf or plant.</p>

                    <label style={styles.uploadBtn}>
                      Select image
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{ display: "none" }}
                      />
                    </label>
                  </>
                )}
              </div>

              {preview && (
                <label style={styles.changeBtn}>
                  Change image
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: "none" }}
                  />
                </label>
              )}

              <button
                type="submit"
                style={{
                  ...styles.primaryBtn,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
                disabled={loading}
              >
                {loading ? "Analyzing image..." : "Analyze image →"}
              </button>
            </form>
          </section>

          <section style={styles.card}>
            <p className="mono" style={styles.cardEyebrow}>
              ANALYSIS RESULT
            </p>

            {!result ? (
              <div style={styles.empty}>
                <span style={styles.emptyIcon}>☘</span>
                <h3>No image analysis yet.</h3>
                <p>Upload a clear image to detect possible crop issues.</p>
              </div>
            ) : (
              <div>
                <div style={styles.resultBox}>{result}</div>

                <p style={styles.warning}>
                  AI image analysis is only a possible indication. Consult local
                  agriculture officer or KVK before applying pesticide,
                  fungicide, or fertilizer.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
};

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
  cropContext: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
    background: "#151310",
    border: "1px solid rgba(243,237,224,0.1)",
    color: "#cfc8b8",
    padding: "12px",
    borderRadius: "4px",
    marginTop: "14px",
    fontSize: "0.78rem",
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
  textarea: {
    width: "100%",
    background: "#12110e",
    color: "#f3ede0",
    border: "1px solid rgba(243,237,224,0.15)",
    borderRadius: "3px",
    padding: "10px",
    outline: "none",
    resize: "vertical",
    fontFamily: "inherit",
  },
  uploadBox: {
    marginTop: "18px",
    minHeight: "240px",
    border: "1px dashed rgba(201,162,39,0.4)",
    background: "#12110e",
    color: "#a8a094",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    textAlign: "center",
    padding: "18px",
    borderRadius: "4px",
  },
  uploadIcon: { fontSize: "2rem", marginBottom: "10px" },
  uploadBtn: {
    marginTop: "10px",
    background: "#c9a227",
    color: "#0b0a08",
    padding: "10px 14px",
    borderRadius: "3px",
    cursor: "pointer",
    fontWeight: 700,
  },
  preview: {
    maxWidth: "100%",
    maxHeight: "260px",
    objectFit: "contain",
    borderRadius: "4px",
    border: "1px solid rgba(243,237,224,0.12)",
  },
  removeBtn: {
    marginTop: "12px",
    background: "transparent",
    color: "#e07a4f",
    border: "1px solid rgba(224,122,79,0.4)",
    padding: "8px 12px",
    borderRadius: "3px",
    cursor: "pointer",
  },
  changeBtn: {
    display: "inline-block",
    marginTop: "12px",
    color: "#e3bc3f",
    border: "1px solid rgba(201,162,39,0.35)",
    padding: "8px 12px",
    borderRadius: "3px",
    cursor: "pointer",
    fontSize: "0.8rem",
  },
  primaryBtn: {
    marginTop: "22px",
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
  resultBox: {
    whiteSpace: "pre-wrap",
    background: "#151310",
    border: "1px solid rgba(243,237,224,0.1)",
    color: "#ded6ca",
    padding: "16px",
    borderRadius: "4px",
    lineHeight: 1.6,
    fontSize: "0.86rem",
  },
  warning: {
    color: "#ffc1a6",
    background: "rgba(224,122,79,0.08)",
    border: "1px solid rgba(224,122,79,0.22)",
    padding: "12px",
    borderRadius: "3px",
    fontSize: "0.82rem",
    lineHeight: 1.55,
    marginTop: "14px",
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

export default PlantDiseaseDetection;