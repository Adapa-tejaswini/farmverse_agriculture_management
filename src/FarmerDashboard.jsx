import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getCrops, getFarms, getListings, getPredictions } from "./api.js";

const DASHBOARD_IMAGE =
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1800&q=85";

const getGrowthProgress = (stage) => {
  const stages = {
    Seedling: 18,
    Vegetative: 40,
    Flowering: 62,
    Fruiting: 80,
    Maturity: 95,
  };

  return stages[stage] || 10;
};

const daysUntil = (dateValue) => {
  if (!dateValue) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(dateValue);
  target.setHours(0, 0, 0, 0);

  return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
};

const buildDashboardAlerts = ({ farms, crops }) => {
  const alerts = [];

  if (farms.length === 0) {
    alerts.push({
      type: "Setup",
      title: "Add your first farm",
      text: "Create a farm record with location, land area, soil type, and irrigation details.",
      path: "/farm-management",
      priority: "high",
    });
  }

  if (farms.length > 0 && crops.length === 0) {
    alerts.push({
      type: "Setup",
      title: "Add crop records",
      text: "Add active crops to receive crop stage, fertilizer, harvest, and disease guidance.",
      path: "/crop-management",
      priority: "high",
    });
  }

  crops.forEach((crop) => {
    const harvestDays = daysUntil(crop.expectedHarvestDate);

    if (
      harvestDays !== null &&
      harvestDays >= 0 &&
      harvestDays <= 7 &&
      crop.cropStatus !== "Harvested"
    ) {
      alerts.push({
        type: "Harvest",
        title: `${crop.cropName} harvest reminder`,
        text:
          harvestDays === 0
            ? "Expected harvest is today. Check crop maturity before harvesting."
            : `Expected harvest is in ${harvestDays} day(s). Prepare labor, crates, storage, and market plan.`,
        path: "/crop-management",
        priority: "high",
      });
    }

    if (crop.growthStage === "Flowering") {
      alerts.push({
        type: "Crop stage",
        title: `${crop.cropName} is flowering`,
        text: "Maintain stable moisture and monitor flower drop, thrips, and fungal signs.",
        path: `/fertilizer?cropId=${crop.id}`,
        priority: "medium",
      });
    }

    if (crop.growthStage === "Fruiting") {
      alerts.push({
        type: "Crop stage",
        title: `${crop.cropName} is fruiting`,
        text: "Check fruit borer, spots, nutrient stress, and irrigation consistency.",
        path: `/disease-detection?cropId=${crop.id}`,
        priority: "medium",
      });
    }

    if (!crop.soilPh && !crop.nitrogen && !crop.phosphorus && !crop.potassium) {
      alerts.push({
        type: "Fertilizer",
        title: `Soil data missing for ${crop.cropName}`,
        text: "Add soil pH and NPK values from a Soil Health Card for better fertilizer guidance.",
        path: `/fertilizer?cropId=${crop.id}`,
        priority: "medium",
      });
    }
  });

  return alerts.slice(0, 5);
};

const FarmerDashboard = ({ user }) => {
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [listings, setListings] = useState([]);
  const [predictions, setPredictions] = useState([]);

  useEffect(() => {
    if (!user?.id) return;

    setFarms(getFarms(user.id));
    setCrops(getCrops(user.id));
    setListings(getListings(user.id));
    setPredictions(getPredictions(user.id));
  }, [user?.id]);

  const activeCrops = crops.filter((crop) => crop.cropStatus !== "Harvested");

  const totalYield = crops.reduce(
    (total, crop) => total + Number(crop.estimatedYield || 0),
    0
  );

  const totalLand = farms.reduce(
    (total, farm) => total + Number(farm.landSize || 0),
    0
  );

  const alerts = useMemo(
    () => buildDashboardAlerts({ farms, crops }),
    [farms, crops]
  );

  const currentDate = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const recentCrops = crops.slice(0, 4);
  const recentPredictions = predictions.slice(0, 3);

  const quickActions = [
    {
      no: "01",
      title: "Manage farms",
      text: "Add fields, land area, location, irrigation, and soil type.",
      path: "/farm-management",
      icon: "🌾",
    },
    {
      no: "02",
      title: "Manage crops",
      text: "Track crop stages, planting dates, yield, and harvest plans.",
      path: "/crop-management",
      icon: "☘️",
    },
    {
      no: "03",
      title: "Fertilizer guidance",
      text: "Use soil pH and NPK values to get safe nutrient guidance.",
      path: "/fertilizer",
      icon: "🧪",
    },
    {
      no: "04",
      title: "Disease scan",
      text: "Upload a leaf image to detect possible pest or disease signs.",
      path: "/disease-detection",
      icon: "🔍",
    },
    {
      no: "05",
      title: "Crop advisor",
      text: "Get crop suggestions based on season, soil, and water.",
      path: "/crop-recommendation",
      icon: "🌱",
    },
    {
      no: "06",
      title: "AI assistant",
      text: "Ask questions using text, image, or voice input.",
      path: "/assistant",
      icon: "✦",
    },
  ];

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <img src={DASHBOARD_IMAGE} alt="Agricultural field" style={styles.heroImage} />
          <div style={styles.heroOverlay} />

          <div style={styles.heroContent}>
            <div>
              <p className="mono" style={styles.eyebrow}>
                FARMER WORKSPACE
              </p>

              <h1 style={styles.title}>
                Good morning, {user?.name?.split(" ")[0] || "Farmer"}.
              </h1>

              <p style={styles.subtitle}>
                Your farms, crops, AI tools, harvest plans, and alerts are ready.
              </p>

              <p style={styles.date}>
                <span>◌</span> {currentDate}
              </p>
            </div>

            <div style={styles.heroActions}>
              <Link to="/notifications" style={styles.heroSecondaryBtn}>
                View alerts
              </Link>

              <Link to="/crop-management" style={styles.heroPrimaryBtn}>
                + Add crop
              </Link>
            </div>
          </div>

          <div style={styles.heroFooter}>
            <span>
              <strong>{farms.length}</strong> farms
            </span>
            <span>
              <strong>{activeCrops.length}</strong> active crops
            </span>
            <span>
              <strong>{alerts.length}</strong> smart alerts
            </span>
          </div>
        </section>

        <section style={styles.overviewSection}>
          <div style={styles.sectionTop}>
            <div>
              <p className="mono" style={styles.sectionEyebrow}>
                FARM OVERVIEW
              </p>

              <h2 style={styles.sectionTitle}>This season at a glance</h2>
            </div>

            <span style={styles.updatedText}>Records update as you add data</span>
          </div>

          <div style={styles.statsGrid}>
            <StatCard icon="🌾" label="TOTAL FARMS" value={farms.length} hint={`${totalLand} acres recorded`} />
            <StatCard icon="☘️" label="ACTIVE CROPS" value={activeCrops.length} hint="Currently in progress" />
            <StatCard icon="▣" label="LISTINGS" value={listings.length} hint="Produce ready for buyers" />
            <StatCard icon="↗" label="EST. YIELD" value={`${totalYield} kg`} hint="Across recorded crops" />
          </div>
        </section>

        <div className="furrow" style={{ margin: "35px 0" }} />

        <section style={styles.mainGrid}>
          <article style={styles.largePanel}>
            <div style={styles.panelHeader}>
              <div>
                <p className="mono" style={styles.panelEyebrow}>
                  FIELD ACTIVITY
                </p>

                <h2 style={styles.panelTitle}>Your crop season</h2>
              </div>

              <Link to="/crop-management" style={styles.panelLink}>
                View all crops →
              </Link>
            </div>

            {recentCrops.length === 0 ? (
              <EmptyState
                icon="☘️"
                title="No crops on record yet."
                text="Add your first crop to track planting dates, growth stages, yield, and harvest planning."
                path="/crop-management"
                linkText="Add first crop"
              />
            ) : (
              <div style={styles.cropList}>
                {recentCrops.map((crop) => {
                  const farm = farms.find(
                    (item) => Number(item.id) === Number(crop.farmId)
                  );
                  const progress = getGrowthProgress(crop.growthStage);

                  return (
                    <div key={crop.id} style={styles.cropRow}>
                      <div style={styles.cropTopRow}>
                        <div style={styles.cropInfo}>
                          <div style={styles.cropAvatar}>
                            {crop.cropName?.charAt(0)?.toUpperCase() || "C"}
                          </div>

                          <div>
                            <h3 style={styles.cropName}>{crop.cropName}</h3>
                            <p style={styles.cropMeta}>
                              {farm?.farmName || "Farm not selected"} ·{" "}
                              {crop.season || "Season not set"}
                            </p>
                          </div>
                        </div>

                        <div style={styles.cropStatusWrap}>
                          <span style={styles.statusBadge}>
                            {crop.cropStatus || "Planted"}
                          </span>
                          <span style={styles.cropStage}>
                            {crop.growthStage || "Planning"}
                          </span>
                        </div>
                      </div>

                      <div style={styles.progressMeta}>
                        <span>Crop growth</span>
                        <span>{progress}%</span>
                      </div>

                      <div style={styles.progressTrack}>
                        <div
                          style={{
                            ...styles.progressFill,
                            width: `${progress}%`,
                          }}
                        />
                      </div>

                      <div style={styles.cropFooter}>
                        <span>
                          Estimated yield:{" "}
                          <strong>{crop.estimatedYield || "0"} kg</strong>
                        </span>

                        <span>
                          Harvest:{" "}
                          <strong>{crop.expectedHarvestDate || "Not set"}</strong>
                        </span>
                      </div>

                      <div style={styles.cropActions}>
                        <Link to={`/fertilizer?cropId=${crop.id}`}>Fertilizer</Link>
                        <Link to={`/disease-detection?cropId=${crop.id}`}>Disease scan</Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </article>

          <aside style={styles.sideColumn}>
            <article style={styles.alertCard}>
              <div style={styles.panelHeader}>
                <div>
                  <p className="mono" style={styles.panelEyebrow}>
                    SMART NOTIFICATIONS
                  </p>
                  <h2 style={styles.panelTitle}>Farm alerts</h2>
                </div>

                <Link to="/notifications" style={styles.panelLink}>
                  Open →
                </Link>
              </div>

              {alerts.length === 0 ? (
                <p style={styles.alertEmpty}>
                  No urgent alerts. Add farm and crop records to generate smart reminders.
                </p>
              ) : (
                <div style={styles.alertList}>
                  {alerts.map((alert, index) => (
                    <Link key={`${alert.title}-${index}`} to={alert.path} style={styles.alertItem}>
                      <span style={styles.alertType}>{alert.type}</span>
                      <strong>{alert.title}</strong>
                      <p>{alert.text}</p>
                    </Link>
                  ))}
                </div>
              )}
            </article>

            <article style={styles.weatherCard}>
              <div style={styles.weatherTop}>
                <div>
                  <p className="mono" style={styles.panelEyebrow}>
                    LOCAL WEATHER
                  </p>
                  <h2 style={styles.panelTitle}>Field conditions</h2>
                </div>

                <span style={styles.weatherIcon}>☀</span>
              </div>

              <div style={styles.weatherMain}>
                <strong>29°</strong>
                <span>Partly sunny</span>
              </div>

              <div style={styles.weatherGrid}>
                <div>
                  <span>Humidity</span>
                  <strong>68%</strong>
                </div>
                <div>
                  <span>Rain chance</span>
                  <strong>30%</strong>
                </div>
                <div>
                  <span>Wind</span>
                  <strong>12 km/h</strong>
                </div>
              </div>

              <Link to="/weather" style={styles.weatherLink}>
                Open weather forecast →
              </Link>
            </article>

            <article style={styles.recommendationCard}>
              <div style={styles.panelHeader}>
                <div>
                  <p className="mono" style={styles.panelEyebrow}>
                    RECENT AI RESULTS
                  </p>
                  <h2 style={styles.panelTitle}>Saved guidance</h2>
                </div>

                <Link to="/prediction" style={styles.panelLink}>
                  History →
                </Link>
              </div>

              {recentPredictions.length === 0 ? (
                <div style={styles.advisorContent}>
                  <div style={styles.advisorIcon}>✦</div>
                  <h3 style={styles.advisorEmptyTitle}>
                    Try your AI tools
                  </h3>
                  <p style={styles.advisorText}>
                    Use crop advisor, fertilizer guidance, disease scan, or AI assistant.
                  </p>
                  <Link to="/assistant" style={styles.advisorButton}>
                    Open AI assistant →
                  </Link>
                </div>
              ) : (
                <div style={styles.predictionList}>
                  {recentPredictions.map((prediction) => (
                    <div key={prediction.id} style={styles.predictionItem}>
                      <span>{prediction.predictionType || "Prediction"}</span>
                      <strong>{prediction.result}</strong>
                    </div>
                  ))}
                </div>
              )}
            </article>
          </aside>
        </section>

        <section style={styles.quickSection}>
          <div style={styles.sectionTop}>
            <div>
              <p className="mono" style={styles.sectionEyebrow}>
                FARMVERSE TOOLS
              </p>
              <h2 style={styles.sectionTitle}>What would you like to do?</h2>
            </div>
          </div>

          <div style={styles.quickGrid}>
            {quickActions.map((action) => (
              <Link key={action.no} to={action.path} style={styles.actionCard}>
                <span style={styles.actionNumber}>{action.no}</span>
                <span style={styles.actionIcon}>{action.icon}</span>
                <h3>{action.title}</h3>
                <p>{action.text}</p>
                <span style={styles.actionLink}>Open →</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
};

const StatCard = ({ icon, label, value, hint }) => (
  <article style={styles.statCard}>
    <div style={styles.statIcon}>{icon}</div>
    <div>
      <span className="mono" style={styles.statLabel}>
        {label}
      </span>
      <strong style={styles.statValue}>{value}</strong>
      <p style={styles.statHint}>{hint}</p>
    </div>
  </article>
);

const EmptyState = ({ icon, title, text, path, linkText }) => (
  <div style={styles.emptyState}>
    <span style={styles.emptyIcon}>{icon}</span>
    <h3>{title}</h3>
    <p>{text}</p>
    <Link to={path} style={styles.emptyButton}>
      {linkText} →
    </Link>
  </div>
);

const styles = {
  page: {
    minHeight: "calc(100vh - 65px)",
    padding: "38px 20px 60px",
  },
  container: {
    width: "100%",
    maxWidth: "1180px",
    margin: "0 auto",
  },
  hero: {
    position: "relative",
    minHeight: "300px",
    overflow: "hidden",
    borderRadius: "7px",
    border: "1px solid rgba(201,162,39,0.24)",
    display: "flex",
    alignItems: "center",
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
      "linear-gradient(90deg, rgba(11,10,8,0.95) 8%, rgba(11,10,8,0.78) 50%, rgba(11,10,8,0.24) 100%)",
  },
  heroContent: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    padding: "42px 42px 70px",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "25px",
  },
  eyebrow: {
    color: "#d9b538",
    fontSize: "0.7rem",
    letterSpacing: "0.14em",
    marginBottom: "11px",
  },
  title: {
    color: "#f7f1e7",
    fontSize: "2.25rem",
    fontWeight: 500,
    lineHeight: 1.18,
  },
  subtitle: {
    color: "#d3cabb",
    marginTop: "9px",
    lineHeight: 1.55,
    maxWidth: "550px",
  },
  date: {
    color: "#a99f91",
    fontSize: "0.78rem",
    marginTop: "16px",
  },
  heroActions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  heroPrimaryBtn: {
    background: "#c9a227",
    color: "#0b0a08",
    textDecoration: "none",
    borderRadius: "3px",
    padding: "11px 16px",
    fontWeight: 700,
    fontSize: "0.85rem",
    whiteSpace: "nowrap",
  },
  heroSecondaryBtn: {
    color: "#f3ede0",
    textDecoration: "none",
    border: "1px solid rgba(243,237,224,0.32)",
    borderRadius: "3px",
    padding: "11px 16px",
    fontSize: "0.85rem",
    whiteSpace: "nowrap",
  },
  heroFooter: {
    position: "absolute",
    zIndex: 2,
    left: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    gap: "28px",
    padding: "15px 42px",
    background: "rgba(8,8,6,0.75)",
    borderTop: "1px solid rgba(243,237,224,0.1)",
    color: "#b6ac9d",
    fontSize: "0.77rem",
  },
  overviewSection: {
    paddingTop: "32px",
  },
  sectionTop: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: "20px",
    marginBottom: "17px",
  },
  sectionEyebrow: {
    color: "#7c5432",
    fontSize: "0.67rem",
    letterSpacing: "0.11em",
    marginBottom: "7px",
  },
  sectionTitle: {
    color: "#f3ede0",
    fontSize: "1.35rem",
    fontWeight: 500,
  },
  updatedText: {
    color: "#756d62",
    fontSize: "0.76rem",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "14px",
  },
  statCard: {
    display: "flex",
    alignItems: "flex-start",
    gap: "13px",
    background: "#1a1712",
    border: "1px solid rgba(243,237,224,0.09)",
    borderRadius: "4px",
    padding: "19px",
  },
  statIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "38px",
    height: "38px",
    background: "rgba(201,162,39,0.1)",
    border: "1px solid rgba(201,162,39,0.2)",
    color: "#d9b538",
    borderRadius: "3px",
    fontSize: "1.25rem",
  },
  statLabel: {
    color: "#92897d",
    fontSize: "0.63rem",
    letterSpacing: "0.07em",
  },
  statValue: {
    display: "block",
    color: "#f3ede0",
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: "1.35rem",
    fontWeight: 500,
    marginTop: "6px",
  },
  statHint: {
    color: "#70685d",
    fontSize: "0.72rem",
    margin: "4px 0 0",
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "1.15fr 0.85fr",
    gap: "18px",
  },
  largePanel: {
    background: "#1a1712",
    border: "1px solid rgba(201,162,39,0.18)",
    borderRadius: "5px",
    padding: "27px",
  },
  sideColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
  },
  panelEyebrow: {
    color: "#7c5432",
    fontSize: "0.66rem",
    letterSpacing: "0.1em",
    marginBottom: "7px",
  },
  panelTitle: {
    color: "#f3ede0",
    fontSize: "1.16rem",
    fontWeight: 500,
  },
  panelLink: {
    color: "#e3bc3f",
    textDecoration: "none",
    fontSize: "0.78rem",
    whiteSpace: "nowrap",
  },
  cropList: {
    marginTop: "18px",
  },
  cropRow: {
    padding: "16px 0",
    borderBottom: "1px solid rgba(243,237,224,0.08)",
  },
  cropTopRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "15px",
  },
  cropInfo: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
  },
  cropAvatar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "35px",
    height: "35px",
    borderRadius: "50%",
    background: "rgba(201,162,39,0.13)",
    color: "#e3bc3f",
    fontFamily: "'Fraunces', serif",
    fontSize: "1rem",
  },
  cropName: {
    color: "#f3ede0",
    fontSize: "0.98rem",
    fontWeight: 500,
    margin: 0,
  },
  cropMeta: {
    color: "#8d8579",
    fontSize: "0.74rem",
    margin: "4px 0 0",
  },
  cropStatusWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "4px",
  },
  statusBadge: {
    color: "#e3bc3f",
    border: "1px solid rgba(201,162,39,0.36)",
    borderRadius: "14px",
    padding: "3px 8px",
    fontSize: "0.67rem",
  },
  cropStage: {
    color: "#756d62",
    fontSize: "0.7rem",
  },
  progressMeta: {
    display: "flex",
    justifyContent: "space-between",
    color: "#8d8579",
    fontSize: "0.7rem",
    marginTop: "14px",
  },
  progressTrack: {
    width: "100%",
    height: "5px",
    background: "rgba(243,237,224,0.09)",
    borderRadius: "10px",
    overflow: "hidden",
    marginTop: "6px",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #8d6f20, #d9b538)",
    borderRadius: "10px",
  },
  cropFooter: {
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "8px",
    color: "#81796e",
    fontSize: "0.72rem",
    marginTop: "11px",
  },
  cropActions: {
    display: "flex",
    gap: "12px",
    marginTop: "12px",
    fontSize: "0.75rem",
  },
  alertCard: {
    background: "#1a1712",
    border: "1px solid rgba(201,162,39,0.18)",
    borderRadius: "5px",
    padding: "24px",
  },
  alertEmpty: {
    color: "#a8a094",
    fontSize: "0.8rem",
    lineHeight: 1.55,
    marginTop: "15px",
  },
  alertList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "16px",
  },
  alertItem: {
    background: "#151310",
    border: "1px solid rgba(243,237,224,0.08)",
    borderLeft: "3px solid rgba(201,162,39,0.65)",
    padding: "12px",
    textDecoration: "none",
    color: "#f3ede0",
  },
  alertType: {
    color: "#e3bc3f",
    fontSize: "0.65rem",
    textTransform: "uppercase",
  },
  weatherCard: {
    background:
      "linear-gradient(135deg, rgba(61,51,27,0.52), rgba(26,23,18,1) 72%)",
    border: "1px solid rgba(201,162,39,0.23)",
    borderRadius: "5px",
    padding: "24px",
  },
  weatherTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  weatherIcon: {
    color: "#e3bc3f",
    fontSize: "1.6rem",
  },
  weatherMain: {
    display: "flex",
    alignItems: "baseline",
    gap: "10px",
    marginTop: "17px",
    color: "#f3ede0",
  },
  weatherGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "8px",
    borderTop: "1px solid rgba(243,237,224,0.1)",
    marginTop: "19px",
    paddingTop: "16px",
    color: "#a8a094",
    fontSize: "0.75rem",
  },
  weatherLink: {
    display: "inline-block",
    color: "#e3bc3f",
    textDecoration: "none",
    fontSize: "0.78rem",
    marginTop: "18px",
  },
  recommendationCard: {
    background: "#1a1712",
    border: "1px solid rgba(201,162,39,0.18)",
    borderRadius: "5px",
    padding: "24px",
  },
  advisorContent: {
    marginTop: "17px",
    padding: "17px",
    background: "rgba(201,162,39,0.06)",
    border: "1px solid rgba(201,162,39,0.13)",
  },
  advisorIcon: {
    color: "#d9b538",
    fontSize: "1.45rem",
  },
  advisorEmptyTitle: {
    color: "#f3ede0",
    fontSize: "1rem",
    fontWeight: 500,
    margin: "12px 0 0",
  },
  advisorText: {
    color: "#a8a094",
    fontSize: "0.78rem",
    lineHeight: 1.55,
    marginTop: "9px",
  },
  advisorButton: {
    display: "inline-block",
    color: "#e3bc3f",
    textDecoration: "none",
    fontSize: "0.78rem",
    fontWeight: 600,
    marginTop: "14px",
  },
  predictionList: {
    display: "flex",
    flexDirection: "column",
    gap: "9px",
    marginTop: "15px",
  },
  predictionItem: {
    background: "#151310",
    border: "1px solid rgba(243,237,224,0.08)",
    padding: "12px",
    color: "#e3bc3f",
    fontSize: "0.78rem",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 25px 35px",
    color: "#a8a094",
  },
  emptyIcon: {
    display: "block",
    color: "#7c5432",
    fontSize: "2.4rem",
    marginBottom: "10px",
  },
  emptyButton: {
    display: "inline-block",
    marginTop: "13px",
    color: "#e3bc3f",
    textDecoration: "none",
    fontSize: "0.84rem",
  },
  quickSection: {
    marginTop: "35px",
  },
  quickGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "14px",
  },
  actionCard: {
    position: "relative",
    minHeight: "205px",
    display: "flex",
    flexDirection: "column",
    background: "#1a1712",
    border: "1px solid rgba(243,237,224,0.1)",
    borderRadius: "4px",
    padding: "22px",
    color: "#f3ede0",
    textDecoration: "none",
  },
  actionNumber: {
    position: "absolute",
    top: "15px",
    right: "16px",
    color: "#6f5135",
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: "0.68rem",
  },
  actionIcon: {
    color: "#d9b538",
    fontSize: "1.45rem",
  },
  actionLink: {
    color: "#e3bc3f",
    fontSize: "0.76rem",
    fontWeight: 600,
    marginTop: "auto",
    paddingTop: "16px",
  },
};

export default FarmerDashboard;