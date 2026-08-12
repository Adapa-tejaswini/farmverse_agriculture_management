import React, { useEffect, useState } from "react";
import { getPredictions, savePrediction } from "./api.js";

const simpleInitialForm = {
  state: "",
  district: "",
  village: "",
  season: "",
  waterAvailability: "",
  soilType: "",
  cropPreference: "",
};

const advancedInitialForm = {
  nitrogen: "",
  phosphorus: "",
  potassium: "",
  temperature: "",
  humidity: "",
  ph: "",
  rainfall: "",
};

const Prediction = ({ user }) => {
  const [mode, setMode] = useState("simple");
  const [simpleForm, setSimpleForm] = useState(simpleInitialForm);
  const [advancedForm, setAdvancedForm] = useState(advancedInitialForm);
  const [results, setResults] = useState([]);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.id) {
      setHistory(getPredictions(user.id));
    }
  }, [user]);

  const handleSimpleChange = (event) => {
    setSimpleForm({
      ...simpleForm,
      [event.target.name]: event.target.value,
    });
  };

  const handleAdvancedChange = (event) => {
    setAdvancedForm({
      ...advancedForm,
      [event.target.name]: event.target.value,
    });
  };

  /*
    Simple crop recommendation logic.

    Later this function will be replaced with:
    React -> Node.js API -> ML/Python Model -> PostgreSQL
  */
  const getSimpleRecommendation = (data) => {
    const { season, waterAvailability, soilType, cropPreference } = data;

    let cropOptions = [];

    // KHARIF / MONSOON
    if (season === "Kharif") {
      if (waterAvailability === "low") {
        cropOptions = [
          {
            crop: "Bajra (Pearl Millet)",
            reason: "Needs less water and performs well in rain-dependent areas.",
            duration: "75–90 days",
            water: "Low",
          },
          {
            crop: "Jowar (Sorghum)",
            reason: "Suitable for dry conditions and low irrigation.",
            duration: "100–120 days",
            water: "Low",
          },
          {
            crop: "Tur (Pigeon Pea)",
            reason: "A drought-tolerant pulse crop suitable for Kharif.",
            duration: "150–180 days",
            water: "Low to Medium",
          },
        ];
      } else if (waterAvailability === "medium") {
        cropOptions = [
          {
            crop: "Soybean",
            reason: "Suitable for Kharif season with medium rainfall and irrigation.",
            duration: "90–110 days",
            water: "Medium",
          },
          {
            crop: "Maize",
            reason: "A good Kharif option with moderate water availability.",
            duration: "100–120 days",
            water: "Medium",
          },
          {
            crop: "Cotton",
            reason: "Suitable where the season is warm and water is moderately available.",
            duration: "150–180 days",
            water: "Medium",
          },
        ];
      } else if (waterAvailability === "high") {
        cropOptions = [
          {
            crop: "Rice",
            reason: "Suitable for areas with high water availability during monsoon.",
            duration: "120–150 days",
            water: "High",
          },
          {
            crop: "Sugarcane",
            reason: "Suitable where reliable irrigation is available throughout the season.",
            duration: "10–12 months",
            water: "High",
          },
          {
            crop: "Vegetables",
            reason: "Tomato, chilli, okra, and brinjal can grow well with good irrigation.",
            duration: "60–120 days",
            water: "Medium to High",
          },
        ];
      }
    }

    // RABI / WINTER
    if (season === "Rabi") {
      if (waterAvailability === "low") {
        cropOptions = [
          {
            crop: "Chana (Chickpea)",
            reason: "A suitable Rabi pulse crop requiring comparatively less water.",
            duration: "100–120 days",
            water: "Low",
          },
          {
            crop: "Mustard",
            reason: "Works well in cool weather with limited irrigation.",
            duration: "110–130 days",
            water: "Low",
          },
          {
            crop: "Safflower",
            reason: "A drought-tolerant oilseed crop for Rabi season.",
            duration: "120–140 days",
            water: "Low",
          },
        ];
      } else if (waterAvailability === "medium") {
        cropOptions = [
          {
            crop: "Wheat",
            reason: "Suitable for winter season with regular but moderate irrigation.",
            duration: "110–130 days",
            water: "Medium",
          },
          {
            crop: "Onion",
            reason: "A common high-value crop when moderate irrigation is available.",
            duration: "120–150 days",
            water: "Medium",
          },
          {
            crop: "Chana (Chickpea)",
            reason: "Good pulse crop option for Rabi season.",
            duration: "100–120 days",
            water: "Low to Medium",
          },
        ];
      } else if (waterAvailability === "high") {
        cropOptions = [
          {
            crop: "Wheat",
            reason: "Suitable for well-irrigated fields during winter.",
            duration: "110–130 days",
            water: "Medium",
          },
          {
            crop: "Potato",
            reason: "Suitable in cool conditions with consistent irrigation.",
            duration: "90–120 days",
            water: "Medium to High",
          },
          {
            crop: "Tomato",
            reason: "Can be profitable when irrigation and crop care are available.",
            duration: "90–120 days",
            water: "Medium to High",
          },
        ];
      }
    }

    // ZAID / SUMMER
    if (season === "Zaid") {
      if (waterAvailability === "low") {
        cropOptions = [
          {
            crop: "Moong (Green Gram)",
            reason: "Short-duration crop suitable for warmer months.",
            duration: "60–70 days",
            water: "Low to Medium",
          },
          {
            crop: "Sesame",
            reason: "Can be grown with less water compared to many summer crops.",
            duration: "80–100 days",
            water: "Low",
          },
          {
            crop: "Cowpea",
            reason: "A heat-tolerant pulse/vegetable crop.",
            duration: "60–90 days",
            water: "Low to Medium",
          },
        ];
      } else {
        cropOptions = [
          {
            crop: "Watermelon",
            reason: "Suitable for summer when irrigation is available.",
            duration: "80–100 days",
            water: "Medium to High",
          },
          {
            crop: "Muskmelon",
            reason: "A good summer crop with reliable irrigation.",
            duration: "80–100 days",
            water: "Medium to High",
          },
          {
            crop: "Cucumber",
            reason: "Quick-growing vegetable crop for irrigated fields.",
            duration: "45–60 days",
            water: "Medium",
          },
        ];
      }
    }

    // Soil type adjustments
    if (soilType === "black") {
      cropOptions.unshift({
        crop: "Cotton",
        reason: "Black soil is commonly suitable for cotton and soybean cultivation.",
        duration: "150–180 days",
        water: "Medium",
      });
    }

    if (soilType === "red") {
      cropOptions.unshift({
        crop: "Groundnut",
        reason: "Red soil can be suitable for groundnut with proper moisture management.",
        duration: "100–120 days",
        water: "Medium",
      });
    }

    if (soilType === "sandy") {
      cropOptions.unshift({
        crop: "Groundnut",
        reason: "Well-drained sandy soil is often suitable for groundnut.",
        duration: "100–120 days",
        water: "Medium",
      });
    }

    if (soilType === "clay") {
      cropOptions.unshift({
        crop: "Rice",
        reason: "Clay soil holds water well and can be suitable for paddy cultivation.",
        duration: "120–150 days",
        water: "High",
      });
    }

    if (soilType === "loamy") {
      cropOptions.unshift({
        crop: "Vegetables",
        reason: "Loamy soil is generally suitable for many vegetables and field crops.",
        duration: "60–120 days",
        water: "Medium",
      });
    }

    // Crop preference filtering
    if (cropPreference === "vegetables") {
      cropOptions.unshift(
        {
          crop: "Tomato",
          reason: "A popular vegetable crop with market demand and irrigation support.",
          duration: "90–120 days",
          water: "Medium",
        },
        {
          crop: "Okra (Bhindi)",
          reason: "Suitable for warm conditions and local vegetable markets.",
          duration: "50–70 days",
          water: "Medium",
        }
      );
    }

    if (cropPreference === "pulses") {
      cropOptions.unshift(
        {
          crop: "Tur (Pigeon Pea)",
          reason: "Popular pulse crop, especially for Kharif season.",
          duration: "150–180 days",
          water: "Low to Medium",
        },
        {
          crop: "Chana (Chickpea)",
          reason: "Common Rabi pulse crop requiring less water.",
          duration: "100–120 days",
          water: "Low",
        }
      );
    }

    if (cropPreference === "cash") {
      cropOptions.unshift(
        {
          crop: "Cotton",
          reason: "A common commercial crop suitable in warm climates.",
          duration: "150–180 days",
          water: "Medium",
        },
        {
          crop: "Sugarcane",
          reason: "A commercial crop suitable where water is reliably available.",
          duration: "10–12 months",
          water: "High",
        }
      );
    }

    // Remove duplicate crops and return first 3
    const uniqueOptions = cropOptions.filter(
      (item, index, self) =>
        index === self.findIndex((option) => option.crop === item.crop)
    );

    return uniqueOptions.slice(0, 3);
  };

  /*
    Advanced Soil Test / NPK recommendation logic.
    This is temporary logic for frontend.
    Later it should call an ML model.
  */
  const getAdvancedRecommendation = (data) => {
    const N = Number(data.nitrogen);
    const P = Number(data.phosphorus);
    const K = Number(data.potassium);
    const temperature = Number(data.temperature);
    const humidity = Number(data.humidity);
    const ph = Number(data.ph);
    const rainfall = Number(data.rainfall);

    if (rainfall >= 180 && humidity >= 75 && temperature >= 20 && temperature <= 32) {
      return [
        {
          crop: "Rice",
          reason: "High rainfall and humidity are favorable for rice cultivation.",
          duration: "120–150 days",
          water: "High",
        },
        {
          crop: "Sugarcane",
          reason: "Suitable with high water availability and warm climate.",
          duration: "10–12 months",
          water: "High",
        },
        {
          crop: "Banana",
          reason: "Warm and humid conditions can support banana cultivation.",
          duration: "10–14 months",
          water: "High",
        },
      ];
    }

    if (N >= 70 && P >= 35 && K >= 35 && rainfall >= 80) {
      return [
        {
          crop: "Cotton",
          reason: "The entered nutrient values and rainfall are favorable for cotton.",
          duration: "150–180 days",
          water: "Medium",
        },
        {
          crop: "Maize",
          reason: "Suitable with balanced nutrients and moderate rainfall.",
          duration: "100–120 days",
          water: "Medium",
        },
        {
          crop: "Soybean",
          reason: "A suitable crop option with balanced NPK values.",
          duration: "90–110 days",
          water: "Medium",
        },
      ];
    }

    if (temperature < 25 && rainfall < 120 && ph >= 6 && ph <= 8) {
      return [
        {
          crop: "Wheat",
          reason: "Cool temperatures and suitable soil pH support wheat cultivation.",
          duration: "110–130 days",
          water: "Medium",
        },
        {
          crop: "Chana (Chickpea)",
          reason: "Suitable for moderate soil pH and lower rainfall conditions.",
          duration: "100–120 days",
          water: "Low",
        },
        {
          crop: "Mustard",
          reason: "Suitable for relatively cool and dry conditions.",
          duration: "110–130 days",
          water: "Low",
        },
      ];
    }

    if (ph >= 6 && ph <= 7.5 && rainfall < 120 && temperature >= 22) {
      return [
        {
          crop: "Chickpea",
          reason: "Soil pH and climate values are suitable for chickpea.",
          duration: "100–120 days",
          water: "Low",
        },
        {
          crop: "Groundnut",
          reason: "A possible option in well-drained soil conditions.",
          duration: "100–120 days",
          water: "Medium",
        },
        {
          crop: "Millet",
          reason: "Millets are generally resilient crops for varied conditions.",
          duration: "75–100 days",
          water: "Low",
        },
      ];
    }

    return [
      {
        crop: "Millet (Bajra)",
        reason: "Millet is a resilient crop option for varied soil and weather conditions.",
        duration: "75–90 days",
        water: "Low",
      },
      {
        crop: "Maize",
        reason: "Maize can be considered with suitable irrigation and nutrient management.",
        duration: "100–120 days",
        water: "Medium",
      },
      {
        crop: "Pigeon Pea (Tur)",
        reason: "Tur is a drought-tolerant pulse crop option.",
        duration: "150–180 days",
        water: "Low to Medium",
      },
    ];
  };

  const handleSimpleSubmit = (event) => {
    event.preventDefault();
    setError("");
    setResults([]);

    if (
      !simpleForm.state ||
      !simpleForm.district ||
      !simpleForm.season ||
      !simpleForm.waterAvailability
    ) {
      setError(
        "Please select your state, enter district, choose season, and select water availability."
      );
      return;
    }

    const cropResults = getSimpleRecommendation(simpleForm);

    setResults(cropResults);

    savePrediction(user.id, {
      type: "Simple Crop Recommendation",
      result: cropResults[0].crop,
      input: simpleForm,
      recommendations: cropResults,
    });

    setHistory(getPredictions(user.id));
  };

  const handleAdvancedSubmit = (event) => {
    event.preventDefault();
    setError("");
    setResults([]);

    const filled = Object.values(advancedForm).every(
      (value) => value !== ""
    );

    if (!filled) {
      setError("Please enter all soil test and weather values.");
      return;
    }

    const cropResults = getAdvancedRecommendation(advancedForm);

    setResults(cropResults);

    savePrediction(user.id, {
      type: "Advanced Soil-Test Recommendation",
      result: cropResults[0].crop,
      input: advancedForm,
      recommendations: cropResults,
    });

    setHistory(getPredictions(user.id));
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <p className="mono" style={styles.eyebrow}>
          SMART FARMING ADVISOR
        </p>

        <h1 style={styles.title}>Find suitable crops for your farm.</h1>

        <p style={styles.subtitle}>
          You do not need soil test values to get started. Select your location,
          season, and water availability for a simple crop suggestion. Use the
          advanced option only if you have a Soil Health Card or soil test report.
        </p>

        <div className="furrow" style={{ margin: "28px 0" }} />

        <div style={styles.modeToggle}>
          <button
            type="button"
            onClick={() => {
              setMode("simple");
              setError("");
              setResults([]);
            }}
            style={mode === "simple" ? styles.modeActive : styles.modeButton}
          >
            <span style={styles.modeIcon}>☘</span>
            <span>
              <strong>Simple recommendation</strong>
              <small>No soil report needed</small>
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("advanced");
              setError("");
              setResults([]);
            }}
            style={mode === "advanced" ? styles.modeActive : styles.modeButton}
          >
            <span style={styles.modeIcon}>◫</span>
            <span>
              <strong>Soil test recommendation</strong>
              <small>I have NPK and pH values</small>
            </span>
          </button>
        </div>

        <div style={styles.layout}>
          <section style={styles.formCard}>
            {mode === "simple" ? (
              <>
                <p className="mono" style={styles.cardEyebrow}>
                  SIMPLE FARMER FORM
                </p>

                <h2 style={styles.sectionTitle}>
                  Tell us about your farm.
                </h2>

                <p style={styles.formDescription}>
                  Fill only the details you know. Soil type is optional.
                </p>

                {error && <p style={styles.error}>{error}</p>}

                <form onSubmit={handleSimpleSubmit}>
                  <div style={styles.twoColumn}>
                    <div style={styles.field}>
                      <label style={styles.label}>State *</label>
                      <select
                        name="state"
                        value={simpleForm.state}
                        onChange={handleSimpleChange}
                        style={styles.input}
                      >
                        <option value="">Select state</option>
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Karnataka">Karnataka</option>
                        <option value="Gujarat">Gujarat</option>
                        <option value="Madhya Pradesh">Madhya Pradesh</option>
                        <option value="Uttar Pradesh">Uttar Pradesh</option>
                        <option value="Rajasthan">Rajasthan</option>
                        <option value="Tamil Nadu">Tamil Nadu</option>
                        <option value="Telangana">Telangana</option>
                        <option value="Andhra Pradesh">Andhra Pradesh</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div style={styles.field}>
                      <label style={styles.label}>District *</label>
                      <input
                        type="text"
                        name="district"
                        placeholder="Example: Nashik"
                        value={simpleForm.district}
                        onChange={handleSimpleChange}
                        style={styles.input}
                      />
                    </div>
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>Village / Taluka (optional)</label>
                    <input
                      type="text"
                      name="village"
                      placeholder="Example: Sinnar"
                      value={simpleForm.village}
                      onChange={handleSimpleChange}
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.twoColumn}>
                    <div style={styles.field}>
                      <label style={styles.label}>Which season? *</label>
                      <select
                        name="season"
                        value={simpleForm.season}
                        onChange={handleSimpleChange}
                        style={styles.input}
                      >
                        <option value="">Select season</option>
                        <option value="Kharif">Kharif / Monsoon</option>
                        <option value="Rabi">Rabi / Winter</option>
                        <option value="Zaid">Zaid / Summer</option>
                      </select>
                    </div>

                    <div style={styles.field}>
                      <label style={styles.label}>Water availability *</label>
                      <select
                        name="waterAvailability"
                        value={simpleForm.waterAvailability}
                        onChange={handleSimpleChange}
                        style={styles.input}
                      >
                        <option value="">Select water availability</option>
                        <option value="low">
                          Low — mostly rain dependent
                        </option>
                        <option value="medium">
                          Medium — limited irrigation
                        </option>
                        <option value="high">
                          Good — regular irrigation available
                        </option>
                      </select>
                    </div>
                  </div>

                  <div style={styles.twoColumn}>
                    <div style={styles.field}>
                      <label style={styles.label}>
                        Soil type (optional)
                      </label>
                      <select
                        name="soilType"
                        value={simpleForm.soilType}
                        onChange={handleSimpleChange}
                        style={styles.input}
                      >
                        <option value="">I do not know</option>
                        <option value="black">Black soil</option>
                        <option value="red">Red soil</option>
                        <option value="clay">Clay soil</option>
                        <option value="sandy">Sandy soil</option>
                        <option value="loamy">Loamy soil</option>
                      </select>
                    </div>

                    <div style={styles.field}>
                      <label style={styles.label}>
                        Crop preference (optional)
                      </label>
                      <select
                        name="cropPreference"
                        value={simpleForm.cropPreference}
                        onChange={handleSimpleChange}
                        style={styles.input}
                      >
                        <option value="">Any crop</option>
                        <option value="food">Food crops</option>
                        <option value="vegetables">Vegetables</option>
                        <option value="pulses">Pulses / Dal crops</option>
                        <option value="cash">Cash crops</option>
                      </select>
                    </div>
                  </div>

                  <button type="submit" style={styles.primaryBtn}>
                    Get simple crop suggestions
                  </button>
                </form>
              </>
            ) : (
              <>
                <p className="mono" style={styles.cardEyebrow}>
                  SOIL HEALTH CARD MODE
                </p>

                <h2 style={styles.sectionTitle}>
                  Enter soil test values.
                </h2>

                <p style={styles.formDescription}>
                  Use this option only if you have a soil report from a lab,
                  agriculture office, or Soil Health Card.
                </p>

                {error && <p style={styles.error}>{error}</p>}

                <form onSubmit={handleAdvancedSubmit}>
                  <p className="mono" style={styles.groupTitle}>
                    SOIL NUTRIENTS
                  </p>

                  <div style={styles.threeColumn}>
                    <div style={styles.field}>
                      <label style={styles.label}>Nitrogen (N)</label>
                      <input
                        type="number"
                        name="nitrogen"
                        placeholder="90"
                        value={advancedForm.nitrogen}
                        onChange={handleAdvancedChange}
                        style={styles.input}
                      />
                    </div>

                    <div style={styles.field}>
                      <label style={styles.label}>Phosphorus (P)</label>
                      <input
                        type="number"
                        name="phosphorus"
                        placeholder="42"
                        value={advancedForm.phosphorus}
                        onChange={handleAdvancedChange}
                        style={styles.input}
                      />
                    </div>

                    <div style={styles.field}>
                      <label style={styles.label}>Potassium (K)</label>
                      <input
                        type="number"
                        name="potassium"
                        placeholder="43"
                        value={advancedForm.potassium}
                        onChange={handleAdvancedChange}
                        style={styles.input}
                      />
                    </div>
                  </div>

                  <p
                    className="mono"
                    style={{ ...styles.groupTitle, marginTop: "28px" }}
                  >
                    WEATHER AND SOIL CONDITIONS
                  </p>

                  <div style={styles.twoColumn}>
                    <div style={styles.field}>
                      <label style={styles.label}>Temperature (°C)</label>
                      <input
                        type="number"
                        step="0.1"
                        name="temperature"
                        placeholder="25"
                        value={advancedForm.temperature}
                        onChange={handleAdvancedChange}
                        style={styles.input}
                      />
                    </div>

                    <div style={styles.field}>
                      <label style={styles.label}>Humidity (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        name="humidity"
                        placeholder="80"
                        value={advancedForm.humidity}
                        onChange={handleAdvancedChange}
                        style={styles.input}
                      />
                    </div>

                    <div style={styles.field}>
                      <label style={styles.label}>Soil pH</label>
                      <input
                        type="number"
                        step="0.1"
                        name="ph"
                        placeholder="6.5"
                        value={advancedForm.ph}
                        onChange={handleAdvancedChange}
                        style={styles.input}
                      />
                    </div>

                    <div style={styles.field}>
                      <label style={styles.label}>Rainfall (mm)</label>
                      <input
                        type="number"
                        step="0.1"
                        name="rainfall"
                        placeholder="200"
                        value={advancedForm.rainfall}
                        onChange={handleAdvancedChange}
                        style={styles.input}
                      />
                    </div>
                  </div>

                  <button type="submit" style={styles.primaryBtn}>
                    Get soil-based recommendation
                  </button>
                </form>
              </>
            )}
          </section>

          <section style={styles.resultCard}>
            <p className="mono" style={styles.cardEyebrow}>
              FARMVERSE SUGGESTIONS
            </p>

            <h2 style={styles.sectionTitle}>Recommended crop options</h2>

            {results.length === 0 ? (
              <div style={styles.noResults}>
                <span style={styles.noResultIcon}>☘</span>
                <p>
                  Fill the form to see crop suggestions suitable for your farm.
                </p>
              </div>
            ) : (
              <>
                <p style={styles.resultNote}>
                  These are general recommendations. Before planting, consider
                  market price, seed availability, local weather, and advice from
                  your agriculture officer.
                </p>

                <div style={styles.resultsList}>
                  {results.map((item, index) => (
                    <article key={`${item.crop}-${index}`} style={styles.resultItem}>
                      <div style={styles.resultNumber}>{index + 1}</div>

                      <div style={styles.resultContent}>
                        <h3 style={styles.cropName}>{item.crop}</h3>
                        <p style={styles.cropReason}>{item.reason}</p>

                        <div style={styles.cropMeta}>
                          <span>⌛ {item.duration}</span>
                          <span>💧 {item.water} water</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}

            <div className="furrow" style={{ margin: "28px 0" }} />

            <p className="mono" style={styles.cardEyebrow}>
              RECENT RECOMMENDATIONS
            </p>

            {history.length === 0 ? (
              <p style={styles.historyEmpty}>No recommendation history yet.</p>
            ) : (
              <div style={styles.historyList}>
                {history.slice(0, 5).map((item) => (
                  <div key={item.id} style={styles.historyRow}>
                    <div>
                      <strong style={styles.historyCrop}>{item.result}</strong>
                      <p style={styles.historyDate}>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <span style={styles.historyType}>{item.type}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "calc(100vh - 65px)",
    padding: "48px 20px",
  },
  container: {
    maxWidth: "1150px",
    margin: "0 auto",
  },
  eyebrow: {
    color: "#c9a227",
    fontSize: "0.72rem",
    letterSpacing: "0.14em",
    marginBottom: "12px",
  },
  title: {
    color: "#f3ede0",
    fontSize: "2rem",
    fontWeight: 500,
  },
  subtitle: {
    maxWidth: "760px",
    color: "#a8a094",
    lineHeight: 1.65,
    marginTop: "10px",
  },
  modeToggle: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "14px",
    marginBottom: "20px",
  },
  modeButton: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    textAlign: "left",
    background: "#1a1712",
    border: "1px solid rgba(243,237,224,0.14)",
    borderRadius: "4px",
    color: "#a8a094",
    padding: "18px",
    cursor: "pointer",
  },
  modeActive: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    textAlign: "left",
    background: "rgba(201,162,39,0.09)",
    border: "1px solid rgba(201,162,39,0.6)",
    borderRadius: "4px",
    color: "#f3ede0",
    padding: "18px",
    cursor: "pointer",
  },
  modeIcon: {
    color: "#c9a227",
    fontSize: "1.8rem",
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "minmax(350px, 1.05fr) minmax(330px, 0.95fr)",
    gap: "20px",
  },
  formCard: {
    background: "#1a1712",
    border: "1px solid rgba(201,162,39,0.2)",
    borderRadius: "4px",
    padding: "30px",
  },
  resultCard: {
    background: "#1a1712",
    border: "1px solid rgba(201,162,39,0.2)",
    borderRadius: "4px",
    padding: "30px",
  },
  cardEyebrow: {
    color: "#7c5432",
    fontSize: "0.69rem",
    letterSpacing: "0.1em",
    marginBottom: "9px",
  },
  sectionTitle: {
    color: "#f3ede0",
    fontSize: "1.25rem",
    fontWeight: 500,
  },
  formDescription: {
    color: "#a8a094",
    fontSize: "0.87rem",
    lineHeight: 1.55,
    marginTop: "10px",
  },
  error: {
    color: "#e07a4f",
    background: "rgba(224,122,79,0.08)",
    border: "1px solid rgba(224,122,79,0.22)",
    fontSize: "0.84rem",
    lineHeight: 1.5,
    padding: "10px",
    marginTop: "16px",
  },
  field: {
    marginTop: "17px",
  },
  label: {
    display: "block",
    color: "#a8a094",
    fontSize: "0.79rem",
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    background: "#151310",
    color: "#f3ede0",
    border: "1px solid rgba(243,237,224,0.16)",
    borderRadius: "2px",
    padding: "10px",
    outline: "none",
    fontFamily: "inherit",
  },
  twoColumn: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "14px",
  },
  threeColumn: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
  },
  groupTitle: {
    color: "#c9a227",
    fontSize: "0.69rem",
    letterSpacing: "0.1em",
    marginTop: "22px",
    marginBottom: "0",
  },
  primaryBtn: {
    width: "100%",
    marginTop: "30px",
    padding: "13px",
    background: "#c9a227",
    color: "#0b0a08",
    border: "none",
    borderRadius: "2px",
    fontWeight: 700,
    fontSize: "0.93rem",
    cursor: "pointer",
  },
  noResults: {
    minHeight: "260px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#7f786c",
    textAlign: "center",
    padding: "20px",
    lineHeight: 1.6,
  },
  noResultIcon: {
    color: "#7c5432",
    fontSize: "3.3rem",
    marginBottom: "12px",
  },
  resultNote: {
    color: "#a8a094",
    fontSize: "0.82rem",
    lineHeight: 1.55,
    padding: "12px",
    background: "rgba(201,162,39,0.06)",
    border: "1px solid rgba(201,162,39,0.14)",
    marginTop: "18px",
  },
  resultsList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginTop: "15px",
  },
  resultItem: {
    display: "flex",
    gap: "13px",
    padding: "16px",
    background: "#151310",
    border: "1px solid rgba(243,237,224,0.1)",
    borderRadius: "3px",
  },
  resultNumber: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "27px",
    height: "27px",
    color: "#0b0a08",
    background: "#c9a227",
    borderRadius: "50%",
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: "0.76rem",
    fontWeight: 700,
  },
  resultContent: {
    flex: 1,
  },
  cropName: {
    color: "#f3ede0",
    fontSize: "1.03rem",
    fontWeight: 500,
  },
  cropReason: {
    color: "#a8a094",
    fontSize: "0.82rem",
    lineHeight: 1.5,
    margin: "7px 0 10px",
  },
  cropMeta: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    color: "#e3bc3f",
    fontSize: "0.72rem",
  },
  historyEmpty: {
    color: "#a8a094",
    fontSize: "0.85rem",
    marginTop: "14px",
  },
  historyList: {
    marginTop: "12px",
  },
  historyRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
    padding: "12px 0",
    borderBottom: "1px solid rgba(243,237,224,0.08)",
  },
  historyCrop: {
    color: "#f3ede0",
    fontSize: "0.9rem",
    fontWeight: 500,
  },
  historyDate: {
    color: "#7f786c",
    fontSize: "0.74rem",
    margin: "4px 0 0",
  },
  historyType: {
    maxWidth: "130px",
    color: "#e3bc3f",
    fontSize: "0.68rem",
    lineHeight: 1.4,
    textAlign: "right",
  },
};

export default Prediction;