import React, { useEffect, useState } from "react";
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

const getStageLabel = (stage) => {
  if (!stage) return "Planning stage";
  return stage;
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
  }, [user]);

  const totalYield = crops.reduce(
    (total, crop) => total + Number(crop.estimatedYield || 0),
    0
  );

  const activeCrops = crops.filter(
    (crop) => crop.cropStatus !== "Harvested"
  ).length;

  const latestPrediction = predictions[0];

  const currentDate = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const recentCrops = crops.slice(0, 4);

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        {/* Hero Dashboard Banner */}
        <section style={styles.hero}>
          <img
            src={DASHBOARD_IMAGE}
            alt="Agricultural field"
            style={styles.heroImage}
          />

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
                Here is what is happening across your fields today.
              </p>

              <p style={styles.date}>
                <span>◌</span> {currentDate}
              </p>
            </div>

            <div style={styles.heroActions}>
              <Link to="/farm-management" style={styles.heroSecondaryBtn}>
                Manage farms
              </Link>

              <Link to="/crop-management" style={styles.heroPrimaryBtn}>
                + Add crop
              </Link>
            </div>
          </div>

          <div style={styles.heroFooter}>
            <span>
              <strong>{farms.length}</strong> farms registered
            </span>
            <span>
              <strong>{activeCrops}</strong> active crops
            </span>
            <span>
              <strong>{listings.length}</strong> produce listings
            </span>
          </div>
        </section>

        {/* Overview */}
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
            <article style={styles.statCard}>
              <div style={styles.statIcon}>⌖</div>
              <div>
                <span className="mono" style={styles.statLabel}>
                  TOTAL FARMS
                </span>
                <strong style={styles.statValue}>{farms.length}</strong>
                <p style={styles.statHint}>Fields on your record</p>
              </div>
            </article>

            <article style={styles.statCard}>
              <div style={styles.statIcon}>☘</div>
              <div>
                <span className="mono" style={styles.statLabel}>
                  ACTIVE CROPS
                </span>
                <strong style={styles.statValue}>{activeCrops}</strong>
                <p style={styles.statHint}>Currently in progress</p>
              </div>
            </article>

            <article style={styles.statCard}>
              <div style={styles.statIcon}>▣</div>
              <div>
                <span className="mono" style={styles.statLabel}>
                  PRODUCE LISTINGS
                </span>
                <strong style={styles.statValue}>{listings.length}</strong>
                <p style={styles.statHint}>Available for buyers</p>
              </div>
            </article>

            <article style={styles.statCard}>
              <div style={styles.statIcon}>↗</div>
              <div>
                <span className="mono" style={styles.statLabel}>
                  ESTIMATED YIELD
                </span>
                <strong style={styles.statValue}>{totalYield} kg</strong>
                <p style={styles.statHint}>Across recorded crops</p>
              </div>
            </article>
          </div>
        </section>

        <div className="furrow" style={{ margin: "35px 0" }} />

        <section style={styles.mainGrid}>
          {/* Crop Overview */}
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
              <div style={styles.emptyState}>
                <span style={styles.emptyIcon}>☘</span>
                <h3>No crops on record yet.</h3>
                <p>
                  Add your first crop to track planting dates, growth stages,
                  yield, and harvest planning.
                </p>

                <Link to="/crop-management" style={styles.emptyButton}>
                  Add first crop →
                </Link>
              </div>
            ) : (
              <div style={styles.cropList}>
                {recentCrops.map((crop) => {
                  const farm = farms.find((item) => item.id === crop.farmId);
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
                            {getStageLabel(crop.growthStage)}
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
                          <strong>
                            {crop.expectedHarvestDate || "Not set"}
                          </strong>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </article>

          {/* Weather and Recommendation */}
          <aside style={styles.sideColumn}>
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

              <p style={styles.weatherNote}>
                Demo weather data. Connect Open-Meteo or OpenWeatherMap for
                live local weather.
              </p>
            </article>

            <article style={styles.recommendationCard}>
              <div style={styles.panelHeader}>
                <div>
                  <p className="mono" style={styles.panelEyebrow}>
                    FARM ADVISOR
                  </p>
                  <h2 style={styles.panelTitle}>Crop guidance</h2>
                </div>

                <Link to="/prediction" style={styles.panelLink}>
                  Open →
                </Link>
              </div>

              {latestPrediction ? (
                <div style={styles.advisorContent}>
                  <div style={styles.advisorIcon}>☘</div>

                  <p style={styles.advisorLabel}>LATEST SUGGESTION</p>

                  <h3 style={styles.advisorCrop}>
                    {latestPrediction.result}
                  </h3>

                  <p style={styles.advisorText}>
                    Your latest crop recommendation is saved in Farmverse.
                    Open the advisor to view details and run another suggestion.
                  </p>

                  <Link to="/prediction" style={styles.advisorButton}>
                    View recommendation →
                  </Link>
                </div>
              ) : (
                <div style={styles.advisorContent}>
                  <div style={styles.advisorIcon}>⌁</div>

                  <h3 style={styles.advisorEmptyTitle}>
                    Need help choosing a crop?
                  </h3>

                  <p style={styles.advisorText}>
                    Use your season, water availability, and location to get
                    simple crop suggestions. Soil values are optional.
                  </p>

                  <Link to="/prediction" style={styles.advisorButton}>
                    Try crop advisor →
                  </Link>
                </div>
              )}
            </article>
          </aside>
        </section>

        {/* Quick actions */}
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
            <Link to="/farm-management" style={styles.actionCard}>
              <span style={styles.actionNumber}>01</span>
              <span style={styles.actionIcon}>⌖</span>
              <h3>Manage farms</h3>
              <p>Add fields, land area, location, irrigation, and soil type.</p>
              <span style={styles.actionLink}>Open farms →</span>
            </Link>

            <Link to="/crop-management" style={styles.actionCard}>
              <span style={styles.actionNumber}>02</span>
              <span style={styles.actionIcon}>☘</span>
              <h3>Manage crops</h3>
              <p>Track crop stages, planting dates, yield, and harvest plans.</p>
              <span style={styles.actionLink}>Open crops →</span>
            </Link>

            <Link to="/profile" style={styles.actionCard}>
              <span style={styles.actionNumber}>03</span>
              <span style={styles.actionIcon}>▣</span>
              <h3>Produce listings</h3>
              <p>Add fresh produce and set quantity and price for buyers.</p>
              <span style={styles.actionLink}>Open profile →</span>
            </Link>

            <Link to="/prediction" style={styles.actionCard}>
              <span style={styles.actionNumber}>04</span>
              <span style={styles.actionIcon}>⌁</span>
              <h3>Crop advisor</h3>
              <p>Get simple crop suggestions based on local field conditions.</p>
              <span style={styles.actionLink}>Open advisor →</span>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
};

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
    minHeight: "290px",
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
    maxWidth: "520px",
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
    minWidth: "34px",
    height: "34px",
    background: "rgba(201,162,39,0.1)",
    border: "1px solid rgba(201,162,39,0.2)",
    color: "#d9b538",
    borderRadius: "3px",
    fontSize: "1.05rem",
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
    fontSize: "1.52rem",
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
    gridTemplateColumns: "1.25fr 0.75fr",
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
  },

  weatherGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "8px",
    borderTop: "1px solid rgba(243,237,224,0.1)",
    marginTop: "19px",
    paddingTop: "16px",
  },

  weatherNote: {
    color: "#7d7569",
    fontSize: "0.65rem",
    lineHeight: 1.45,
    margin: "16px 0 0",
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

  advisorLabel: {
    color: "#8d8579",
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: "0.64rem",
    letterSpacing: "0.08em",
    marginTop: "13px",
  },

  advisorCrop: {
    color: "#e3bc3f",
    fontSize: "1.45rem",
    fontWeight: 500,
    margin: "7px 0",
    textTransform: "capitalize",
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
    gridTemplateColumns: "repeat(4, 1fr)",
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