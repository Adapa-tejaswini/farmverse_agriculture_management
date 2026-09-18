import React from "react";
import { Link } from "react-router-dom";

const IMAGES = {
  hero:
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1800&q=90",
  farmer:
    "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1000&q=85",
  vegetables:
    "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1000&q=85",
};

const features = [
  {
    no: "01",
    title: "Farm Records",
    text: "Farmers can save farm name, location, land size, soil type, irrigation method, and farming practice.",
    linkText: "Manage farms",
    path: "/farm-management",
    icon: "🌾",
    farmerOnly: true,
  },
  {
    no: "02",
    title: "Crop Tracking",
    text: "Track planting dates, crop stages, expected harvest dates, yield, and soil nutrient values.",
    linkText: "Track crops",
    path: "/crop-management",
    icon: "☘️",
    farmerOnly: true,
  },
  {
    no: "03",
    title: "Local Marketplace",
    text: "Buyers can discover fresh produce listings added by farmers and request orders.",
    linkText: "Open marketplace",
    path: "/marketplace",
    icon: "▣",
    farmerOnly: false,
  },
];

const aiTools = [
  {
    title: "Fertilizer Guidance",
    text: "Get safe nutrient guidance using crop stage, soil pH, and NPK values.",
    path: "/fertilizer",
    icon: "🧪",
  },
  {
    title: "Crop Advisor",
    text: "Find suitable crops based on season, soil, irrigation, and water availability.",
    path: "/crop-recommendation",
    icon: "🌱",
  },
  {
    title: "Disease Scan",
    text: "Upload a leaf image to detect possible pest, disease, or deficiency symptoms.",
    path: "/disease-detection",
    icon: "🔍",
  },
  {
    title: "Smart Alerts",
    text: "View farm reminders for harvest, crop stage, soil data, weather checks, and schemes.",
    path: "/notifications",
    icon: "🔔",
  },
];

const Home = ({ user }) => {
  const destination =
    user?.role === "farmer" ? "/dashboard" : user ? "/marketplace" : "/register";

  const getFeaturePath = (feature) => {
    if (!user) return "/register";

    if (feature.farmerOnly && user.role !== "farmer") {
      return "/marketplace";
    }

    return feature.path;
  };

  const getToolPath = (path) => {
    if (!user) return "/register";
    if (user.role !== "farmer") return "/marketplace";
    return path;
  };

  return (
    <main>
      <section style={styles.hero}>
        <img
          src={IMAGES.hero}
          alt="Green agricultural field"
          style={styles.heroImage}
        />
        <div style={styles.heroOverlay} />

        <div style={styles.heroContent}>
          <p className="mono" style={styles.eyebrow}>
            FARMVERSE · SMART FARM MANAGEMENT
          </p>

          <h1 style={styles.heroTitle}>
            Grow smarter.
            <br />
            Sell better.
            <br />
            Buy fresher.
          </h1>

          <p style={styles.heroText}>
            Farmverse helps farmers manage farms, track crops, use AI guidance,
            scan leaf images, list produce, and helps buyers discover fresh
            local harvests.
          </p>

          <div style={styles.buttonRow}>
            <Link to={destination} style={styles.primaryBtn}>
              {user
                ? user.role === "farmer"
                  ? "Open my workspace"
                  : "Open marketplace"
                : "Start with Farmverse"}{" "}
              →
            </Link>

            {!user && (
              <Link to="/login" style={styles.secondaryBtn}>
                Sign in
              </Link>
            )}
          </div>

          <div style={styles.heroPoints}>
            <span>✓ Farm records</span>
            <span>✓ Crop tracking</span>
            <span>✓ Produce marketplace</span>
            <span>✓ AI guidance</span>
          </div>
        </div>

        <div style={styles.heroBottom}>
          <div>
            <span className="mono">01</span>
            <p>Manage farms</p>
          </div>
          <div>
            <span className="mono">02</span>
            <p>List produce</p>
          </div>
          <div>
            <span className="mono">03</span>
            <p>Buy fresh crops</p>
          </div>
        </div>
      </section>

      <section style={styles.intro}>
        <div style={styles.container}>
          <p className="mono" style={styles.sectionEyebrow}>
            FARMING AND MARKETPLACE MADE SIMPLE
          </p>

          <div style={styles.introGrid}>
            <h2 style={styles.sectionTitle}>
              One place for farmers to manage records and buyers to find fresh produce.
            </h2>

            <p style={styles.introText}>
              Farmers can record farms, crops, harvest plans, and produce
              listings. Buyers can browse available crops, compare quantity and
              price, and request orders from local farmers.
            </p>
          </div>
        </div>
      </section>

      <div className="furrow" />

      <section style={styles.cardsSection}>
        <div style={styles.container}>
          <div style={styles.cards}>
            {features.map((feature) => (
              <article key={feature.no} style={styles.card}>
                <div style={styles.cardIcon}>{feature.icon}</div>

                <span className="mono" style={styles.cardNo}>
                  {feature.no} / FARMVERSE
                </span>

                <h3 style={styles.cardTitle}>{feature.title}</h3>

                <p style={styles.cardText}>{feature.text}</p>

                <Link to={getFeaturePath(feature)} style={styles.cardLink}>
                  {feature.linkText} →
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section style={styles.aiSection}>
        <div style={styles.container}>
          <div style={styles.sectionHeader}>
            <div>
              <p className="mono" style={styles.sectionEyebrow}>
                AI FARM TOOLS
              </p>

              <h2 style={styles.sectionTitle}>
                Tools for crop decisions, fertilizer, leaf problems, and farm alerts.
              </h2>
            </div>

            <Link
              to={user?.role === "farmer" ? "/assistant" : user ? "/marketplace" : "/register"}
              style={styles.textLink}
            >
              {user?.role === "farmer" ? "Try AI assistant" : "Open marketplace"} →
            </Link>
          </div>

          <div style={styles.aiGrid}>
            {aiTools.map((tool) => (
              <Link key={tool.title} to={getToolPath(tool.path)} style={styles.aiCard}>
                <span style={styles.aiIcon}>{tool.icon}</span>
                <h3>{tool.title}</h3>
                <p>{tool.text}</p>
                <span style={styles.aiLink}>
                  {user?.role === "farmer" ? "Open tool" : "For farmers"} →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section style={styles.splitSection}>
        <div style={styles.container}>
          <div style={styles.splitGrid}>
            <div style={styles.imageWrap}>
              <img
                src={IMAGES.farmer}
                alt="Farmer working in crop field"
                style={styles.splitImage}
              />

              <div style={styles.imageCaption}>
                <span className="mono">FOR FARMERS</span>
                <strong>One place for every season.</strong>
              </div>
            </div>

            <div style={styles.splitContent}>
              <p className="mono" style={styles.sectionEyebrow}>
                FARMER WORKSPACE
              </p>

              <h2 style={styles.sectionTitle}>
                From planting day to selling day.
              </h2>

              <p style={styles.splitText}>
                Add farms, create crop records, update crop stages, estimate
                yield, scan leaves, get fertilizer guidance, and list produce
                when harvest is ready.
              </p>

              <div style={styles.checkList}>
                <p>✓ Multiple farm and field records</p>
                <p>✓ Crop growth and harvest planning</p>
                <p>✓ Fertilizer and crop recommendation tools</p>
                <p>✓ Produce listings for buyers</p>
              </div>

              <Link
                to={user?.role === "farmer" ? "/dashboard" : "/register"}
                style={styles.textLink}
              >
                {user?.role === "farmer" ? "Open workspace" : "Create farmer account"} →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section style={{ ...styles.splitSection, background: "#151310" }}>
        <div style={styles.container}>
          <div style={{ ...styles.splitGrid, direction: "rtl" }}>
            <div style={{ ...styles.imageWrap, direction: "ltr" }}>
              <img
                src={IMAGES.vegetables}
                alt="Fresh vegetables from local farms"
                style={styles.splitImage}
              />

              <div style={styles.imageCaption}>
                <span className="mono">FOR BUYERS</span>
                <strong>Fresh produce from nearby farms.</strong>
              </div>
            </div>

            <div style={{ ...styles.splitContent, direction: "ltr" }}>
              <p className="mono" style={styles.sectionEyebrow}>
                LOCAL FARM TO LOCAL MARKET
              </p>

              <h2 style={styles.sectionTitle}>
                Buy fresh produce directly from farmers.
              </h2>

              <p style={styles.splitText}>
                Buyers can browse available produce listings, check quantity,
                price, farmer location, and create order requests.
              </p>

              <div style={styles.checkList}>
                <p>✓ Browse crop listings</p>
                <p>✓ Search by crop and location</p>
                <p>✓ Request quantity from farmers</p>
              </div>

              <Link
                to={user?.role === "user" ? "/marketplace" : "/register"}
                style={styles.textLink}
              >
                {user?.role === "user" ? "Open marketplace" : "Create buyer account"} →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section style={styles.cta}>
        <p className="mono" style={styles.sectionEyebrow}>
          FARMVERSE · GROW AND TRADE WITH CLARITY
        </p>

        <h2 style={styles.ctaTitle}>
          Farmers manage.
          <br />
          Buyers discover.
          <br />
          Harvests move faster.
        </h2>

        <Link to={destination} style={styles.primaryBtn}>
          {user
            ? user.role === "farmer"
              ? "Go to workspace"
              : "Go to marketplace"
            : "Create free account"}{" "}
          →
        </Link>
      </section>
    </main>
  );
};

const styles = {
  hero: {
    minHeight: "650px",
    position: "relative",
    display: "flex",
    alignItems: "center",
    overflow: "hidden",
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
      "linear-gradient(90deg, rgba(10,9,7,0.96) 10%, rgba(10,9,7,0.72) 52%, rgba(10,9,7,0.18) 100%)",
  },
  heroContent: {
    position: "relative",
    zIndex: 1,
    maxWidth: "720px",
    padding: "65px 48px 105px",
  },
  eyebrow: {
    color: "#d8b53f",
    fontSize: "0.7rem",
    letterSpacing: "0.14em",
    marginBottom: "18px",
  },
  heroTitle: {
    color: "#f7f1e7",
    fontSize: "3.9rem",
    lineHeight: 1.06,
    fontWeight: 500,
  },
  heroText: {
    color: "#d5cbbb",
    maxWidth: "560px",
    fontSize: "1.03rem",
    lineHeight: 1.7,
    marginTop: "20px",
  },
  buttonRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    marginTop: "30px",
  },
  primaryBtn: {
    display: "inline-block",
    background: "#c9a227",
    color: "#0b0a08",
    padding: "14px 21px",
    borderRadius: "3px",
    fontWeight: 700,
    textDecoration: "none",
  },
  secondaryBtn: {
    display: "inline-block",
    color: "#f3ede0",
    border: "1px solid rgba(243,237,224,0.38)",
    padding: "14px 21px",
    borderRadius: "3px",
    textDecoration: "none",
  },
  heroPoints: {
    display: "flex",
    flexWrap: "wrap",
    gap: "16px",
    color: "#c1b7a8",
    fontSize: "0.76rem",
    marginTop: "24px",
  },
  heroBottom: {
    position: "absolute",
    zIndex: 2,
    bottom: 0,
    left: 0,
    right: 0,
    display: "flex",
    gap: "44px",
    padding: "17px 48px",
    background: "rgba(9,8,6,0.8)",
    borderTop: "1px solid rgba(201,162,39,0.22)",
    color: "#d8d0c3",
  },
  intro: {
    padding: "90px 30px",
  },
  container: {
    maxWidth: "1120px",
    width: "100%",
    margin: "0 auto",
  },
  sectionEyebrow: {
    color: "#c9a227",
    fontSize: "0.68rem",
    letterSpacing: "0.14em",
    marginBottom: "13px",
  },
  introGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "80px",
    alignItems: "end",
  },
  sectionTitle: {
    color: "#f3ede0",
    fontSize: "2.25rem",
    fontWeight: 500,
    lineHeight: 1.2,
  },
  introText: {
    color: "#a8a094",
    lineHeight: 1.75,
    margin: 0,
  },
  cardsSection: {
    padding: "78px 30px",
  },
  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "16px",
  },
  card: {
    display: "flex",
    flexDirection: "column",
    minHeight: "285px",
    background: "#1a1712",
    border: "1px solid rgba(243,237,224,0.1)",
    borderTop: "2px solid rgba(201,162,39,0.6)",
    padding: "26px",
    borderRadius: "4px",
  },
  cardIcon: {
    color: "#e3bc3f",
    fontSize: "1.7rem",
    marginBottom: "15px",
  },
  cardNo: {
    color: "#7c5432",
    fontSize: "0.68rem",
  },
  cardTitle: {
    color: "#f3ede0",
    fontSize: "1.25rem",
    fontWeight: 500,
    marginTop: "18px",
  },
  cardText: {
    color: "#a8a094",
    fontSize: "0.88rem",
    lineHeight: 1.65,
  },
  cardLink: {
    color: "#e3bc3f",
    textDecoration: "none",
    fontSize: "0.83rem",
    fontWeight: 600,
    marginTop: "auto",
  },
  aiSection: {
    padding: "85px 30px",
    background: "#151310",
    borderTop: "1px solid rgba(201,162,39,0.16)",
    borderBottom: "1px solid rgba(201,162,39,0.16)",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: "25px",
    marginBottom: "28px",
  },
  aiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "14px",
  },
  aiCard: {
    background: "#1a1712",
    border: "1px solid rgba(201,162,39,0.18)",
    borderRadius: "5px",
    padding: "22px",
    textDecoration: "none",
    color: "#f3ede0",
    minHeight: "225px",
    display: "flex",
    flexDirection: "column",
  },
  aiIcon: {
    fontSize: "1.55rem",
    marginBottom: "14px",
  },
  aiLink: {
    color: "#e3bc3f",
    fontSize: "0.78rem",
    fontWeight: 700,
    marginTop: "auto",
  },
  splitSection: {
    padding: "95px 30px",
  },
  splitGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    alignItems: "center",
    gap: "75px",
  },
  imageWrap: {
    position: "relative",
  },
  splitImage: {
    width: "100%",
    height: "400px",
    objectFit: "cover",
    borderRadius: "4px",
    border: "1px solid rgba(201,162,39,0.2)",
  },
  imageCaption: {
    position: "absolute",
    left: "18px",
    bottom: "18px",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    background: "rgba(11,10,8,0.88)",
    border: "1px solid rgba(201,162,39,0.25)",
    padding: "12px 14px",
    color: "#f3ede0",
  },
  splitContent: {
    maxWidth: "500px",
  },
  splitText: {
    color: "#a8a094",
    lineHeight: 1.75,
    marginTop: "18px",
  },
  checkList: {
    color: "#cfc5b5",
    fontSize: "0.88rem",
    lineHeight: 1.8,
    marginTop: "22px",
  },
  textLink: {
    display: "inline-block",
    color: "#e3bc3f",
    textDecoration: "none",
    fontWeight: 600,
    marginTop: "18px",
  },
  cta: {
    padding: "100px 20px",
    textAlign: "center",
    background:
      "linear-gradient(135deg, rgba(92,66,31,0.45), rgba(11,10,8,1) 68%)",
    borderTop: "1px solid rgba(201,162,39,0.25)",
  },
  ctaTitle: {
    color: "#f3ede0",
    fontSize: "2.8rem",
    fontWeight: 500,
    lineHeight: 1.15,
    marginBottom: "30px",
  },
};

export default Home;