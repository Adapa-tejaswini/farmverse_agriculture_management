import React, { useEffect, useState } from "react";
import { getFarms } from "./api.js";

const forecastData = [
  {
    day: "Today",
    shortDay: "Mon",
    icon: "☀",
    high: 29,
    low: 20,
    rain: 20,
    rainfall: 0,
  },
  {
    day: "Tomorrow",
    shortDay: "Tue",
    icon: "⛅",
    high: 28,
    low: 19,
    rain: 45,
    rainfall: 2,
  },
  {
    day: "Wednesday",
    shortDay: "Wed",
    icon: "🌧",
    high: 26,
    low: 18,
    rain: 72,
    rainfall: 9,
  },
  {
    day: "Thursday",
    shortDay: "Thu",
    icon: "🌧",
    high: 25,
    low: 18,
    rain: 65,
    rainfall: 6,
  },
  {
    day: "Friday",
    shortDay: "Fri",
    icon: "⛅",
    high: 27,
    low: 19,
    rain: 30,
    rainfall: 1,
  },
  {
    day: "Saturday",
    shortDay: "Sat",
    icon: "☀",
    high: 30,
    low: 20,
    rain: 15,
    rainfall: 0,
  },
  {
    day: "Sunday",
    shortDay: "Sun",
    icon: "☀",
    high: 31,
    low: 21,
    rain: 10,
    rainfall: 0,
  },
];

const WeatherForecast = ({ user }) => {
  const [farms, setFarms] = useState([]);
  const [selectedFarmId, setSelectedFarmId] = useState("");

  useEffect(() => {
    if (!user?.id) return;

    const farmData = getFarms(user.id);

    setFarms(farmData);

    if (farmData.length > 0) {
      setSelectedFarmId(String(farmData[0].id));
    }
  }, [user?.id]);

  const selectedFarm = farms.find(
    (farm) => String(farm.id) === String(selectedFarmId)
  );

  const location =
    selectedFarm?.location || user?.location || "Farm location not added";

  const weeklyRainfall = forecastData.reduce(
    (total, day) => total + Number(day.rainfall),
    0
  );

  const rainyDays = forecastData.filter((day) => day.rain >= 60).length;

  const advisories = [
    {
      icon: "💧",
      title: "Irrigation advisory",
      text:
        rainyDays > 0
          ? `Rain is likely on ${rainyDays} day(s) this week. Check the soil moisture before irrigating your crops.`
          : "Low rainfall is expected this week. Monitor soil moisture and irrigate crops when needed.",
    },
    {
      icon: "☘",
      title: "Crop care advisory",
      text:
        rainyDays > 1
          ? "Rain and humidity can increase the risk of fungal disease. Inspect leaves and avoid waterlogging."
          : "Weather is stable for routine crop monitoring. Continue checking crop health and soil moisture.",
    },
    {
      icon: "🌬",
      title: "Spraying advisory",
      text:
        rainyDays > 0
          ? "Avoid pesticide or fertilizer spraying before expected rainfall."
          : "Spraying should be done only during calm morning or evening conditions.",
    },
  ];

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.header}>
          <div>
            <p className="mono" style={styles.eyebrow}>
              WEATHER & FARM ADVISORY
            </p>

            <h1 style={styles.title}>Plan your farm week ahead.</h1>

            <p style={styles.subtitle}>
              View weather conditions, rainfall forecast, and simple farm
              advisories for your selected farm.
            </p>
          </div>

          {farms.length > 0 && (
            <div style={styles.farmSelectorWrap}>
              <label style={styles.selectLabel}>Select farm</label>

              <select
                value={selectedFarmId}
                onChange={(event) => setSelectedFarmId(event.target.value)}
                style={styles.farmSelect}
              >
                {farms.map((farm) => (
                  <option key={farm.id} value={farm.id}>
                    {farm.farmName}
                  </option>
                ))}
              </select>
            </div>
          )}
        </section>

        <section style={styles.weatherHero}>
          <div style={styles.weatherHeroLeft}>
            <p className="mono" style={styles.locationLabel}>
              FARM LOCATION
            </p>

            <h2 style={styles.location}>{location}</h2>

            <p style={styles.updatedText}>
              Forecast preview · Live API connection will be added in backend
            </p>

            <div style={styles.currentWeather}>
              <span style={styles.bigWeatherIcon}>☀</span>

              <div>
                <strong style={styles.temperature}>29°</strong>
                <p style={styles.condition}>Partly sunny</p>
              </div>
            </div>
          </div>

          {/* WEATHER METRICS */}
          <div style={styles.weatherMetrics}>
            <div style={styles.metricCard}>
              <span style={styles.metricLabel}>HUMIDITY</span>
              <strong style={styles.metricValue}>68%</strong>
            </div>

            <div style={styles.metricCard}>
              <span style={styles.metricLabel}>WIND SPEED</span>
              <strong style={styles.metricValue}>12 km/h</strong>
            </div>

            <div style={styles.metricCard}>
              <span style={styles.metricLabel}>RAIN CHANCE</span>
              <strong style={styles.metricValue}>20%</strong>
            </div>

            <div style={styles.metricCard}>
              <span style={styles.metricLabel}>WEEKLY RAIN</span>
              <strong style={styles.metricValue}>{weeklyRainfall} mm</strong>
            </div>
          </div>
        </section>

        <section style={styles.forecastSection}>
          <div style={styles.sectionHeader}>
            <div>
              <p className="mono" style={styles.sectionEyebrow}>
                7-DAY WEATHER FORECAST
              </p>

              <h2 style={styles.sectionTitle}>Weather outlook</h2>
            </div>

            <span style={styles.demoLabel}>
              Demo data · Open-Meteo backend next
            </span>
          </div>

          <div style={styles.forecastGrid}>
            {forecastData.map((day) => (
              <article key={day.shortDay} style={styles.forecastCard}>
                <strong style={styles.forecastDay}>{day.day}</strong>

                <span style={styles.forecastDate}>{day.shortDay}</span>

                <span style={styles.forecastIcon}>{day.icon}</span>

                <div style={styles.tempRow}>
                  <strong>{day.high}°</strong>
                  <span>{day.low}°</span>
                </div>

                <div style={styles.rainInfo}>
                  <span>Rain: {day.rain}%</span>
                  <span>{day.rainfall} mm</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section style={styles.advisorySection}>
          <div style={styles.sectionHeader}>
            <div>
              <p className="mono" style={styles.sectionEyebrow}>
                FARM ADVISORY
              </p>

              <h2 style={styles.sectionTitle}>
                What this forecast means for your farm
              </h2>
            </div>
          </div>

          <div style={styles.advisoryGrid}>
            {advisories.map((advisory) => (
              <article key={advisory.title} style={styles.advisoryCard}>
                <span style={styles.advisoryIcon}>{advisory.icon}</span>

                <h3 style={styles.advisoryTitle}>{advisory.title}</h3>

                <p style={styles.advisoryText}>{advisory.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section style={styles.note}>
          <strong>Important:</strong> This is currently frontend demo weather
          data. The backend version will use Open-Meteo API and show actual
          weather forecast based on your farm location.
        </section>
      </div>
    </main>
  );
};

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
    alignItems: "flex-start",
    gap: "20px",
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
    margin: 0,
  },

  subtitle: {
    color: "#a8a094",
    maxWidth: "680px",
    lineHeight: 1.6,
    marginTop: "10px",
  },

  farmSelectorWrap: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    minWidth: "190px",
  },

  selectLabel: {
    color: "#a8a094",
    fontSize: "0.75rem",
  },

  farmSelect: {
    background: "#1a1712",
    color: "#f3ede0",
    border: "1px solid rgba(201,162,39,0.35)",
    padding: "11px 13px",
    borderRadius: "3px",
    outline: "none",
    fontFamily: "inherit",
  },

  weatherHero: {
    display: "grid",
    gridTemplateColumns: "0.85fr 1.15fr",
    background:
      "linear-gradient(135deg, rgba(65,56,30,0.86), rgba(26,23,18,1) 72%)",
    border: "1px solid rgba(201,162,39,0.3)",
    borderRadius: "6px",
    overflow: "hidden",
  },

  weatherHeroLeft: {
    padding: "32px",
    borderRight: "1px solid rgba(243,237,224,0.1)",
  },

  locationLabel: {
    color: "#d8b53f",
    fontSize: "0.67rem",
    letterSpacing: "0.1em",
    marginBottom: "8px",
  },

  location: {
    color: "#f3ede0",
    fontSize: "1.35rem",
    fontWeight: 500,
    margin: 0,
  },

  updatedText: {
    color: "#978e81",
    fontSize: "0.73rem",
    marginTop: "8px",
    lineHeight: 1.45,
  },

  currentWeather: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginTop: "27px",
  },

  bigWeatherIcon: {
    fontSize: "3.7rem",
  },

  temperature: {
    color: "#f3ede0",
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: "3.4rem",
    fontWeight: 400,
  },

  condition: {
    color: "#cfc6b7",
    margin: 0,
    fontSize: "0.84rem",
  },

  weatherMetrics: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
  },

  metricCard: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    minHeight: "135px",
    padding: "24px",
    borderBottom: "1px solid rgba(243,237,224,0.1)",
    borderRight: "1px solid rgba(243,237,224,0.1)",
  },

  metricLabel: {
    color: "#b8ad9e",
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: "0.66rem",
    letterSpacing: "0.08em",
  },

  metricValue: {
    color: "#f3ede0",
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: "1.45rem",
    fontWeight: 500,
    marginTop: "9px",
  },

  forecastSection: {
    marginTop: "32px",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: "20px",
    marginBottom: "17px",
  },

  sectionEyebrow: {
    color: "#7c5432",
    fontSize: "0.67rem",
    letterSpacing: "0.1em",
    marginBottom: "7px",
  },

  sectionTitle: {
    color: "#f3ede0",
    fontSize: "1.25rem",
    fontWeight: 500,
    margin: 0,
  },

  demoLabel: {
    color: "#867d70",
    fontSize: "0.73rem",
  },

  forecastGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "10px",
  },

  forecastCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    background: "#1a1712",
    border: "1px solid rgba(243,237,224,0.1)",
    padding: "16px 9px",
    borderRadius: "4px",
  },

  forecastDay: {
    color: "#f3ede0",
    fontSize: "0.79rem",
  },

  forecastDate: {
    color: "#867d70",
    fontSize: "0.67rem",
    marginTop: "3px",
  },

  forecastIcon: {
    fontSize: "1.55rem",
    margin: "14px 0",
  },

  tempRow: {
    display: "flex",
    alignItems: "baseline",
    gap: "6px",
    color: "#f3ede0",
  },

  rainInfo: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    color: "#9a9184",
    fontSize: "0.66rem",
    marginTop: "12px",
  },

  advisorySection: {
    marginTop: "34px",
  },

  advisoryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "14px",
  },

  advisoryCard: {
    background: "#1a1712",
    border: "1px solid rgba(201,162,39,0.18)",
    borderTop: "2px solid rgba(201,162,39,0.6)",
    padding: "22px",
    borderRadius: "4px",
  },

  advisoryIcon: {
    fontSize: "1.45rem",
  },

  advisoryTitle: {
    color: "#f3ede0",
    fontSize: "1rem",
    fontWeight: 500,
    marginTop: "14px",
  },

  advisoryText: {
    color: "#a8a094",
    fontSize: "0.82rem",
    lineHeight: 1.6,
    marginTop: "8px",
  },

  note: {
    marginTop: "28px",
    color: "#aaa094",
    background: "rgba(201,162,39,0.06)",
    border: "1px solid rgba(201,162,39,0.17)",
    padding: "14px",
    fontSize: "0.78rem",
    lineHeight: 1.55,
  },
};

export default WeatherForecast;