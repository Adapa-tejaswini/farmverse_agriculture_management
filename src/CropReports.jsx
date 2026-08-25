import React, { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getCrops, getFarms, getListings } from "./api.js";

const COLORS = ["#c9a227", "#e3bc3f", "#8c6833", "#7c5432", "#e07a4f"];

const CropReports = ({ user }) => {
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [listings, setListings] = useState([]);

  useEffect(() => {
    if (!user?.id) return;

    setFarms(getFarms(user.id));
    setCrops(getCrops(user.id));
    setListings(getListings(user.id));
  }, [user?.id]);

  const totalYield = useMemo(
    () =>
      crops.reduce(
        (total, crop) => total + Number(crop.estimatedYield || 0),
        0
      ),
    [crops]
  );

  const activeCrops = crops.filter(
    (crop) => crop.cropStatus !== "Harvested"
  ).length;

  const harvestedCrops = crops.filter(
    (crop) => crop.cropStatus === "Harvested"
  ).length;

  const statusData = useMemo(() => {
    const statuses = {};

    crops.forEach((crop) => {
      const status = crop.cropStatus || "Planted";
      statuses[status] = (statuses[status] || 0) + 1;
    });

    return Object.entries(statuses).map(([name, value]) => ({
      name,
      value,
    }));
  }, [crops]);

  const yieldData = useMemo(
    () =>
      crops.map((crop) => ({
        crop: crop.cropName,
        yield: Number(crop.estimatedYield || 0),
      })),
    [crops]
  );

  const upcomingHarvests = useMemo(() => {
    return crops
      .filter((crop) => crop.expectedHarvestDate)
      .sort(
        (a, b) =>
          new Date(a.expectedHarvestDate) -
          new Date(b.expectedHarvestDate)
      )
      .slice(0, 5);
  }, [crops]);

  const soilDataCrops = crops.filter(
    (crop) =>
      crop.soilPh || crop.nitrogen || crop.phosphorus || crop.potassium
  ).length;

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.header}>
          <div>
            <p className="mono" style={styles.eyebrow}>
              FARM ANALYSIS & REPORTS
            </p>

            <h1 style={styles.title}>See your crop season clearly.</h1>

            <p style={styles.subtitle}>
              Farmverse turns your crop records into a simple seasonal report.
            </p>
          </div>

          <button
            style={styles.exportButton}
            onClick={() => window.print()}
          >
            Print report
          </button>
        </section>

        <section style={styles.summaryGrid}>
          <SummaryCard icon="⌖" label="TOTAL FARMS" value={farms.length} hint="Farm fields registered" />
          <SummaryCard icon="☘" label="ACTIVE CROPS" value={activeCrops} hint="Currently growing or planned" />
          <SummaryCard icon="▣" label="HARVESTED" value={harvestedCrops} hint="Crop records completed" />
          <SummaryCard icon="↗" label="ESTIMATED YIELD" value={`${totalYield} kg`} hint="Across all crop records" />
        </section>

        <div style={styles.analysisGrid}>
          <section style={styles.chartCard}>
            <div style={styles.cardHeader}>
              <div>
                <p className="mono" style={styles.cardEyebrow}>
                  CROP STATUS
                </p>
                <h2 style={styles.cardTitle}>Crop status distribution</h2>
              </div>
            </div>

            {statusData.length === 0 ? (
              <EmptyChart text="Add crop records to view crop status analysis." />
            ) : (
              <div style={styles.chartArea}>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={88}
                      innerRadius={46}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell
                          key={`${entry.name}-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>

                    <Tooltip
                      contentStyle={{
                        background: "#1a1712",
                        border: "1px solid rgba(201,162,39,0.3)",
                        color: "#f3ede0",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div style={styles.legend}>
                  {statusData.map((item, index) => (
                    <div key={item.name} style={styles.legendRow}>
                      <span
                        style={{
                          ...styles.legendColor,
                          background: COLORS[index % COLORS.length],
                        }}
                      />
                      <span>{item.name}</span>
                      <strong>{item.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section style={styles.chartCard}>
            <div style={styles.cardHeader}>
              <div>
                <p className="mono" style={styles.cardEyebrow}>
                  YIELD ESTIMATE
                </p>
                <h2 style={styles.cardTitle}>Estimated yield by crop</h2>
              </div>
            </div>

            {yieldData.length === 0 ? (
              <EmptyChart text="Add crop records with estimated yield to view yield analysis." />
            ) : (
              <div style={styles.chartArea}>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={yieldData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(243,237,224,0.08)"
                    />

                    <XAxis
                      dataKey="crop"
                      tick={{ fill: "#a8a094", fontSize: 12 }}
                      axisLine={{ stroke: "rgba(243,237,224,0.15)" }}
                    />

                    <YAxis
                      tick={{ fill: "#a8a094", fontSize: 12 }}
                      axisLine={{ stroke: "rgba(243,237,224,0.15)" }}
                    />

                    <Tooltip
                      contentStyle={{
                        background: "#1a1712",
                        border: "1px solid rgba(201,162,39,0.3)",
                        color: "#f3ede0",
                      }}
                    />

                    <Bar dataKey="yield" fill="#c9a227" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>
        </div>

        <section style={styles.reportGrid}>
          <section style={styles.reportCard}>
            <p className="mono" style={styles.cardEyebrow}>
              UPCOMING HARVESTS
            </p>

            <h2 style={styles.cardTitle}>Harvest planning</h2>

            {upcomingHarvests.length === 0 ? (
              <div style={styles.emptySmall}>
                No expected harvest dates added yet.
              </div>
            ) : (
              <div style={styles.harvestList}>
                {upcomingHarvests.map((crop) => {
                  const farm = farms.find(
                    (item) => item.id === crop.farmId
                  );

                  return (
                    <div key={crop.id} style={styles.harvestRow}>
                      <div>
                        <strong style={styles.harvestCrop}>
                          {crop.cropName}
                        </strong>

                        <p style={styles.harvestFarm}>
                          {farm?.farmName || "Farm not found"} ·{" "}
                          {crop.growthStage || "Stage not updated"}
                        </p>
                      </div>

                      <div style={styles.harvestDate}>
                        {new Date(
                          crop.expectedHarvestDate
                        ).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section style={styles.reportCard}>
            <p className="mono" style={styles.cardEyebrow}>
              SOIL DATA COVERAGE
            </p>

            <h2 style={styles.cardTitle}>Precision data readiness</h2>

            <div style={styles.soilOverview}>
              <strong>{soilDataCrops}</strong>
              <span>of {crops.length} crop records have soil data</span>
            </div>

            <div style={styles.soilTrack}>
              <div
                style={{
                  ...styles.soilFill,
                  width: `${
                    crops.length
                      ? Math.round((soilDataCrops / crops.length) * 100)
                      : 0
                  }%`,
                }}
              />
            </div>

            <p style={styles.soilText}>
              {soilDataCrops === 0
                ? "No soil test data has been added yet. You can still manage crops normally. Add Soil Health Card values later for more precise fertilizer and crop recommendations."
                : "Soil information is available for some crops. This can improve future fertilizer guidance and crop recommendations."}
            </p>
          </section>

          <section style={styles.reportCard}>
            <p className="mono" style={styles.cardEyebrow}>
              MARKET READINESS
            </p>

            <h2 style={styles.cardTitle}>Produce listing summary</h2>

            <div style={styles.marketNumber}>{listings.length}</div>

            <p style={styles.marketText}>
              {listings.length > 0
                ? "Your produce listings are ready to be shown to local buyers."
                : "No produce listings are active yet. When crops are ready, create listings from your Farmer Profile."}
            </p>
          </section>
        </section>
      </div>
    </main>
  );
};

const SummaryCard = ({ icon, label, value, hint }) => (
  <article style={styles.summaryCard}>
    <span style={styles.summaryIcon}>{icon}</span>

    <div>
      <span className="mono" style={styles.summaryLabel}>
        {label}
      </span>

      <strong style={styles.summaryValue}>{value}</strong>
      <span style={styles.summaryHint}>{hint}</span>
    </div>
  </article>
);

const EmptyChart = ({ text }) => (
  <div style={styles.emptyChart}>
    <span>◌</span>
    <p>{text}</p>
  </div>
);

const styles = {
  page: {
    minHeight: "calc(100vh - 65px)",
    padding: "45px 20px 65px",
  },
  container: {
    maxWidth: "1180px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    alignItems: "flex-start",
    marginBottom: "28px",
  },
  eyebrow: {
    color: "#c9a227",
    fontSize: "0.72rem",
    letterSpacing: "0.14em",
    marginBottom: "12px",
  },
  title: {
    color: "#f3ede0",
    fontSize: "2.15rem",
    fontWeight: 500,
  },
  subtitle: {
    color: "#a8a094",
    lineHeight: 1.6,
    marginTop: "10px",
  },
  exportButton: {
    background: "transparent",
    border: "1px solid rgba(201,162,39,0.4)",
    color: "#e3bc3f",
    padding: "10px 13px",
    borderRadius: "3px",
    cursor: "pointer",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "14px",
  },
  summaryCard: {
    display: "flex",
    gap: "12px",
    padding: "18px",
    background: "#1a1712",
    border: "1px solid rgba(243,237,224,0.1)",
    borderRadius: "4px",
  },
  summaryIcon: {
    width: "35px",
    minWidth: "35px",
    height: "35px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(201,162,39,0.1)",
    color: "#e3bc3f",
    borderRadius: "3px",
  },
  summaryLabel: {
    display: "block",
    color: "#7c5432",
    fontSize: "0.64rem",
    letterSpacing: "0.08em",
  },
  summaryValue: {
    display: "block",
    color: "#f3ede0",
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: "1.3rem",
    marginTop: "7px",
  },
  summaryHint: {
    display: "block",
    color: "#82796d",
    fontSize: "0.7rem",
    marginTop: "4px",
  },
  analysisGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    marginTop: "28px",
  },
  chartCard: {
    background: "#1a1712",
    border: "1px solid rgba(201,162,39,0.2)",
    borderRadius: "5px",
    padding: "25px",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
  },
  cardEyebrow: {
    color: "#7c5432",
    fontSize: "0.67rem",
    letterSpacing: "0.1em",
    marginBottom: "7px",
  },
  cardTitle: {
    color: "#f3ede0",
    fontSize: "1.12rem",
    fontWeight: 500,
  },
  chartArea: {
    marginTop: "16px",
  },
  emptyChart: {
    minHeight: "280px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    color: "#8d8579",
    fontSize: "0.84rem",
  },
  legend: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
    marginTop: "7px",
  },
  legendRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#a8a094",
    fontSize: "0.76rem",
  },
  legendColor: {
    width: "9px",
    height: "9px",
    borderRadius: "50%",
  },
  reportGrid: {
    display: "grid",
    gridTemplateColumns: "1.2fr 1fr 0.8fr",
    gap: "20px",
    marginTop: "20px",
  },
  reportCard: {
    background: "#1a1712",
    border: "1px solid rgba(201,162,39,0.2)",
    borderRadius: "5px",
    padding: "25px",
  },
  emptySmall: {
    color: "#8d8579",
    fontSize: "0.82rem",
    padding: "45px 0",
  },
  harvestList: {
    marginTop: "18px",
  },
  harvestRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    padding: "12px 0",
    borderBottom: "1px solid rgba(243,237,224,0.08)",
  },
  harvestCrop: {
    color: "#f3ede0",
    fontSize: "0.87rem",
  },
  harvestFarm: {
    color: "#8c8377",
    fontSize: "0.72rem",
    margin: "4px 0 0",
  },
  harvestDate: {
    color: "#e3bc3f",
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: "0.7rem",
    textAlign: "right",
  },
  soilOverview: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    marginTop: "22px",
    color: "#a8a094",
  },
  soilTrack: {
    height: "7px",
    background: "rgba(243,237,224,0.1)",
    borderRadius: "10px",
    marginTop: "14px",
    overflow: "hidden",
  },
  soilFill: {
    height: "100%",
    background: "#c9a227",
  },
  soilText: {
    color: "#a8a094",
    fontSize: "0.78rem",
    lineHeight: 1.55,
    marginTop: "16px",
  },
  marketNumber: {
    color: "#e3bc3f",
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: "3rem",
    marginTop: "22px",
  },
  marketText: {
    color: "#a8a094",
    fontSize: "0.8rem",
    lineHeight: 1.55,
    marginTop: "10px",
  },
};

export default CropReports;