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

const Home = ({ user }) => {
  const destination =
    user?.role === "farmer" ? "/dashboard" : user ? "/profile" : "/register";

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
            FARMVERSE · PRECISION AGRICULTURE MANAGEMENT
          </p>

          <h1 style={styles.heroTitle}>
            Every field.
            <br />
            Every crop.
            <br />
            One clear record.
          </h1>

          <p style={styles.heroText}>
            Farmverse helps farmers manage farms, track crops, plan harvests,
            and list fresh produce for local buyers.
          </p>

          <div style={styles.buttonRow}>
            <Link to={destination} style={styles.primaryBtn}>
              {user ? "Open my workspace" : "Start your farm record"} →
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
            <span>✓ Harvest listings</span>
          </div>
        </div>

        <div style={styles.heroBottom}>
          <div>
            <span className="mono">01</span>
            <p>Manage fields</p>
          </div>
          <div>
            <span className="mono">02</span>
            <p>Track crops</p>
          </div>
          <div>
            <span className="mono">03</span>
            <p>List harvests</p>
          </div>
        </div>
      </section>

      <section style={styles.intro}>
        <div style={styles.container}>
          <p className="mono" style={styles.sectionEyebrow}>
            FARMING MADE ORGANIZED
          </p>

          <div style={styles.introGrid}>
            <h2 style={styles.sectionTitle}>
              Your farm does not need complicated software.
            </h2>

            <p style={styles.introText}>
              Start with the details you already know: your farm location, land
              size, crops, season, water availability, and harvest plans.
            </p>
          </div>
        </div>
      </section>

      <div className="furrow" />

      <section style={styles.cardsSection}>
        <div style={styles.container}>
          <div style={styles.cards}>
            <article style={styles.card}>
              <span className="mono" style={styles.cardNo}>
                01 / FARM
              </span>
              <h3 style={styles.cardTitle}>Keep every field on record.</h3>
              <p style={styles.cardText}>
                Add farm location, land size, irrigation method, soil type, and
                farming practice.
              </p>
              <Link
                to={user ? "/farm-management" : "/register"}
                style={styles.cardLink}
              >
                Manage farms →
              </Link>
            </article>

            <article style={styles.card}>
              <span className="mono" style={styles.cardNo}>
                02 / CROP
              </span>
              <h3 style={styles.cardTitle}>Follow each crop season.</h3>
              <p style={styles.cardText}>
                Track planting dates, crop stages, expected harvest, and
                estimated production.
              </p>
              <Link
                to={user ? "/crop-management" : "/register"}
                style={styles.cardLink}
              >
                Track crops →
              </Link>
            </article>

            <article style={styles.card}>
              <span className="mono" style={styles.cardNo}>
                03 / MARKET
              </span>
              <h3 style={styles.cardTitle}>Sell what is ready.</h3>
              <p style={styles.cardText}>
                Add produce quantity and price so local buyers know what is
                available from your farm.
              </p>
              <Link to={user ? "/profile" : "/register"} style={styles.cardLink}>
                View listings →
              </Link>
            </article>
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
                From planting day to harvest day.
              </h2>

              <p style={styles.splitText}>
                Add farms, create crop records, update crop stages, estimate
                yield, and prepare produce listings when your harvest is ready.
              </p>

              <div style={styles.checkList}>
                <p>✓ Multiple farm and field records</p>
                <p>✓ Crop growth and harvest planning</p>
                <p>✓ Soil values optional, not compulsory</p>
              </div>

              <Link to={destination} style={styles.textLink}>
                {user ? "Open workspace" : "Create your record"} →
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
                Know where your food comes from.
              </h2>

              <p style={styles.splitText}>
                Farmverse connects farm produce records with local buyers.
                Farmers can list quantity and price while buyers can discover
                fresh produce from real farms.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section style={styles.cta}>
        <p className="mono" style={styles.sectionEyebrow}>
          FARMVERSE · GROW WITH CLARITY
        </p>

        <h2 style={styles.ctaTitle}>
          Start with one farm.
          <br />
          Keep growing from there.
        </h2>

        <Link to={destination} style={styles.primaryBtn}>
          {user ? "Go to Farmverse" : "Create free account"} →
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
    maxWidth: "680px",
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
    maxWidth: "520px",
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
  },
  intro: {
    padding: "95px 30px",
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
    fontSize: "2.4rem",
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
    minHeight: "260px",
    background: "#1a1712",
    border: "1px solid rgba(243,237,224,0.1)",
    borderTop: "2px solid rgba(201,162,39,0.6)",
    padding: "26px",
    borderRadius: "4px",
  },
  cardNo: {
    color: "#7c5432",
    fontSize: "0.68rem",
  },
  cardTitle: {
    color: "#f3ede0",
    fontSize: "1.25rem",
    fontWeight: 500,
    marginTop: "20px",
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
    maxWidth: "480px",
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
    fontSize: "2.9rem",
    fontWeight: 500,
    lineHeight: 1.15,
    marginBottom: "30px",
  },
};

export default Home;