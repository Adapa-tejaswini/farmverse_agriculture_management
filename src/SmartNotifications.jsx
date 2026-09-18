import React, { useEffect, useMemo, useState } from "react";
import { getCrops, getFarms } from "./api.js";

const NOTIFICATION_IMAGE =
  "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1600&q=85";

const getReadKey = (userId) => `farmverse_notifications_read_${userId}`;

const readReadMap = (userId) => {
  try {
    return JSON.parse(localStorage.getItem(getReadKey(userId)) || "{}");
  } catch {
    return {};
  }
};

const saveReadMap = (userId, data) => {
  localStorage.setItem(getReadKey(userId), JSON.stringify(data));
};

const daysUntil = (dateValue) => {
  if (!dateValue) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(dateValue);
  target.setHours(0, 0, 0, 0);

  return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
};

const schemeAlerts = [
  {
    id: "scheme-pmkisan",
    type: "scheme",
    title: "PM-Kisan Samman Nidhi",
    message:
      "Check PM-Kisan status and e-KYC updates on the official portal if you are eligible.",
    priority: "medium",
  },
  {
    id: "scheme-pmfby",
    type: "scheme",
    title: "PMFBY Crop Insurance",
    message:
      "Crop insurance enrollment may be season-based. Check local deadline before sowing or early crop stage.",
    priority: "high",
  },
  {
    id: "scheme-soil-health-card",
    type: "scheme",
    title: "Soil Health Card",
    message:
      "Soil testing helps improve fertilizer planning. Check nearby agriculture office or KVK for soil testing support.",
    priority: "medium",
  },
  {
    id: "scheme-drip-subsidy",
    type: "scheme",
    title: "Micro-irrigation subsidy",
    message:
      "Drip and sprinkler irrigation subsidies may be available under government schemes. Confirm eligibility locally.",
    priority: "medium",
  },
];

const generateNotifications = ({ farms, crops }) => {
  const notifications = [];

  if (farms.length === 0) {
    notifications.push({
      id: "setup-add-farm",
      type: "setup",
      title: "Add your first farm",
      message:
        "Add farm location, soil type, and irrigation method to get better crop and weather guidance.",
      priority: "high",
    });
  }

  if (farms.length > 0 && crops.length === 0) {
    notifications.push({
      id: "setup-add-crop",
      type: "setup",
      title: "Add crop records",
      message:
        "Add your active crops with growth stage and harvest date to receive smart reminders.",
      priority: "high",
    });
  }

  farms.forEach((farm) => {
    notifications.push({
      id: `weather-${farm.id}`,
      type: "weather",
      title: `Weather check for ${farm.farmName}`,
      message:
        "Check rainfall forecast before irrigation. If rain chance is high, avoid unnecessary watering.",
      priority: "medium",
    });

    if (farm.irrigationType === "Rain-fed") {
      notifications.push({
        id: `rainfed-${farm.id}`,
        type: "weather",
        title: "Rain-fed farm advisory",
        message:
          `${farm.farmName} is marked as rain-fed. Track rainfall and plan drought-tolerant crops when rainfall is uncertain.`,
        priority: "high",
      });
    }
  });

  crops.forEach((crop) => {
    const harvestDays = daysUntil(crop.expectedHarvestDate);

    if (harvestDays !== null && harvestDays >= 0 && harvestDays <= 7) {
      notifications.push({
        id: `harvest-${crop.id}`,
        type: "harvest",
        title: `${crop.cropName} harvest reminder`,
        message:
          harvestDays === 0
            ? `${crop.cropName} may be ready for harvest today. Check maturity before harvesting.`
            : `${crop.cropName} expected harvest is in ${harvestDays} day(s). Prepare labor, crates, storage, and market plan.`,
        priority: "high",
      });
    }

    if (!crop.expectedHarvestDate) {
      notifications.push({
        id: `missing-harvest-${crop.id}`,
        type: "record",
        title: `Add harvest date for ${crop.cropName}`,
        message:
          "Expected harvest date is missing. Add it to receive reminders and planning support.",
        priority: "medium",
      });
    }

    if (crop.growthStage === "Flowering") {
      notifications.push({
        id: `flowering-${crop.id}`,
        type: "crop",
        title: `${crop.cropName} flowering stage alert`,
        message:
          "Maintain stable soil moisture. Monitor flower drop, thrips, whiteflies, and fungal symptoms.",
        priority: "high",
      });
    }

    if (crop.growthStage === "Fruiting") {
      notifications.push({
        id: `fruiting-${crop.id}`,
        type: "crop",
        title: `${crop.cropName} fruiting stage alert`,
        message:
          "Maintain regular irrigation and monitor fruit borer, spots, and nutrient stress.",
        priority: "high",
      });
    }

    if (
      !crop.soilPh &&
      !crop.nitrogen &&
      !crop.phosphorus &&
      !crop.potassium
    ) {
      notifications.push({
        id: `soil-missing-${crop.id}`,
        type: "fertilizer",
        title: `Soil data missing for ${crop.cropName}`,
        message:
          "Add soil pH and NPK values from a Soil Health Card for better fertilizer guidance.",
        priority: "medium",
      });
    }
  });

  return [...notifications, ...schemeAlerts];
};

const SmartNotifications = ({ user }) => {
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [readMap, setReadMap] = useState({});
  const [filter, setFilter] = useState("all");

  const loadData = () => {
    if (!user?.id) return;

    setFarms(getFarms(user.id));
    setCrops(getCrops(user.id));
    setReadMap(readReadMap(user.id));
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const notifications = useMemo(
    () => generateNotifications({ farms, crops }),
    [farms, crops]
  );

  const filteredNotifications =
    filter === "all"
      ? notifications
      : notifications.filter((item) => item.type === filter);

  const unreadCount = notifications.filter((item) => !readMap[item.id]).length;

  const markRead = (id) => {
    const updated = {
      ...readMap,
      [id]: true,
    };

    setReadMap(updated);
    saveReadMap(user.id, updated);
  };

  const markAllRead = () => {
    const updated = {};

    notifications.forEach((item) => {
      updated[item.id] = true;
    });

    setReadMap(updated);
    saveReadMap(user.id, updated);
  };

  const resetRead = () => {
    setReadMap({});
    saveReadMap(user.id, {});
  };

  const filters = [
    ["all", "All"],
    ["weather", "Weather"],
    ["crop", "Crop"],
    ["harvest", "Harvest"],
    ["fertilizer", "Fertilizer"],
    ["scheme", "Schemes"],
    ["setup", "Setup"],
    ["record", "Records"],
  ];

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <img src={NOTIFICATION_IMAGE} alt="Farm notifications" style={styles.heroImage} />
          <div style={styles.heroOverlay} />

          <div style={styles.heroContent}>
            <p className="mono" style={styles.eyebrow}>
              SMART NOTIFICATIONS
            </p>
            <h1 style={styles.title}>Important alerts for your farm.</h1>
            <p style={styles.subtitle}>
              View smart reminders for harvest, crop stage, weather checks, fertilizer records, and government schemes.
            </p>
          </div>

          <div style={styles.heroStats}>
            <div>
              <span>ALERTS</span>
              <strong>{notifications.length}</strong>
            </div>
            <div>
              <span>UNREAD</span>
              <strong>{unreadCount}</strong>
            </div>
          </div>
        </section>

        <section style={styles.toolbar}>
          <div style={styles.filterList}>
            {filters.map(([value, label]) => (
              <button
                key={value}
                style={filter === value ? styles.filterActive : styles.filterBtn}
                onClick={() => setFilter(value)}
              >
                {label}
              </button>
            ))}
          </div>

          <div style={styles.actions}>
            <button style={styles.secondaryBtn} onClick={loadData}>
              Refresh
            </button>
            <button style={styles.primaryBtn} onClick={markAllRead}>
              Mark all read
            </button>
            <button style={styles.dangerBtn} onClick={resetRead}>
              Reset
            </button>
          </div>
        </section>

        {filteredNotifications.length === 0 ? (
          <div style={styles.empty}>
            <span style={styles.emptyIcon}>✦</span>
            <h3>No notifications in this category.</h3>
          </div>
        ) : (
          <section style={styles.notificationList}>
            {filteredNotifications.map((item) => {
              const isRead = Boolean(readMap[item.id]);

              return (
                <article
                  key={item.id}
                  style={{
                    ...styles.notificationCard,
                    opacity: isRead ? 0.65 : 1,
                  }}
                >
                  <div style={styles.notificationTop}>
                    <span style={styles.typeBadge}>{item.type}</span>
                    <span
                      style={
                        item.priority === "high"
                          ? styles.highPriority
                          : styles.mediumPriority
                      }
                    >
                      {item.priority}
                    </span>
                  </div>

                  <h3 style={styles.notificationTitle}>{item.title}</h3>
                  <p style={styles.notificationText}>{item.message}</p>

                  <div style={styles.cardFooter}>
                    <span style={styles.statusText}>
                      {isRead ? "Read" : "Unread"}
                    </span>

                    {!isRead && (
                      <button style={styles.readBtn} onClick={() => markRead(item.id)}>
                        Mark read
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        )}

        <p style={styles.warning}>
          These notifications are frontend-generated for now. Later, backend can generate them daily using database crops, weather API, and scheme records.
        </p>
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
  heroImage: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" },
  heroOverlay: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(90deg, rgba(11,10,8,0.96), rgba(11,10,8,0.72), rgba(11,10,8,0.25))",
  },
  heroContent: { position: "relative", zIndex: 1, maxWidth: "650px", padding: "35px" },
  eyebrow: { color: "#d9b538", fontSize: "0.69rem", letterSpacing: "0.14em", marginBottom: "10px" },
  title: { color: "#f3ede0", fontSize: "2rem", fontWeight: 500, margin: 0 },
  subtitle: { color: "#c9c0b2", lineHeight: 1.6, marginTop: "10px" },
  heroStats: {
    position: "absolute",
    zIndex: 2,
    right: "28px",
    bottom: "24px",
    display: "flex",
    gap: "10px",
    color: "#f3ede0",
  },
  toolbar: {
    background: "#1a1712",
    border: "1px solid rgba(201,162,39,0.2)",
    borderRadius: "5px",
    padding: "16px",
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "18px",
  },
  filterList: { display: "flex", gap: "8px", flexWrap: "wrap" },
  filterBtn: {
    background: "#12110e",
    color: "#a8a094",
    border: "1px solid rgba(243,237,224,0.12)",
    padding: "8px 10px",
    borderRadius: "3px",
    cursor: "pointer",
    fontSize: "0.78rem",
  },
  filterActive: {
    background: "rgba(201,162,39,0.14)",
    color: "#e3bc3f",
    border: "1px solid rgba(201,162,39,0.45)",
    padding: "8px 10px",
    borderRadius: "3px",
    cursor: "pointer",
    fontSize: "0.78rem",
  },
  actions: { display: "flex", gap: "8px", flexWrap: "wrap" },
  primaryBtn: {
    background: "#c9a227",
    color: "#0b0a08",
    border: "none",
    padding: "8px 11px",
    borderRadius: "3px",
    cursor: "pointer",
    fontWeight: 700,
  },
  secondaryBtn: {
    background: "transparent",
    color: "#e3bc3f",
    border: "1px solid rgba(201,162,39,0.4)",
    padding: "8px 11px",
    borderRadius: "3px",
    cursor: "pointer",
  },
  dangerBtn: {
    background: "transparent",
    color: "#e07a4f",
    border: "1px solid rgba(224,122,79,0.4)",
    padding: "8px 11px",
    borderRadius: "3px",
    cursor: "pointer",
  },
  notificationList: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "14px",
  },
  notificationCard: {
    background: "#1a1712",
    border: "1px solid rgba(201,162,39,0.2)",
    borderLeft: "3px solid rgba(201,162,39,0.65)",
    borderRadius: "5px",
    padding: "18px",
  },
  notificationTop: { display: "flex", justifyContent: "space-between", gap: "10px" },
  typeBadge: {
    color: "#e3bc3f",
    background: "rgba(201,162,39,0.08)",
    border: "1px solid rgba(201,162,39,0.25)",
    padding: "4px 7px",
    borderRadius: "12px",
    fontSize: "0.68rem",
    textTransform: "uppercase",
  },
  highPriority: { color: "#ffc1a6", fontSize: "0.7rem", textTransform: "uppercase" },
  mediumPriority: { color: "#cfc8b8", fontSize: "0.7rem", textTransform: "uppercase" },
  notificationTitle: { color: "#f3ede0", fontSize: "1.02rem", margin: "14px 0 0" },
  notificationText: { color: "#a8a094", fontSize: "0.82rem", lineHeight: 1.6, marginTop: "8px" },
  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "15px",
  },
  statusText: { color: "#7c7469", fontSize: "0.75rem" },
  readBtn: {
    background: "transparent",
    color: "#e3bc3f",
    border: "1px solid rgba(201,162,39,0.4)",
    padding: "6px 9px",
    borderRadius: "3px",
    cursor: "pointer",
    fontSize: "0.73rem",
  },
  empty: {
    background: "#1a1712",
    border: "1px solid rgba(201,162,39,0.2)",
    color: "#a8a094",
    textAlign: "center",
    padding: "70px 15px",
    lineHeight: 1.6,
  },
  emptyIcon: { display: "block", color: "#7c5432", fontSize: "2.4rem", marginBottom: "10px" },
  warning: {
    color: "#aa9f91",
    background: "rgba(224,122,79,0.06)",
    border: "1px solid rgba(224,122,79,0.17)",
    padding: "14px",
    fontSize: "0.76rem",
    lineHeight: 1.55,
    marginTop: "18px",
  },
};

export default SmartNotifications;