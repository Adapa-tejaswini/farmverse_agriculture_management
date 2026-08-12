import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const LOGIN_IMAGE =
  "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1600&q=85";

const Login = ({ onLogin }) => {
  const navigate = useNavigate();

  const [role, setRole] = useState("farmer");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    if (!formData.identifier || !formData.password) {
      setError("Enter your email or phone number and password.");
      return;
    }

    // Existing LocalStorage login logic — unchanged
    const savedUsers = JSON.parse(
      localStorage.getItem("farmverse_accounts") || "[]"
    );

    const existingUser = savedUsers.find(
      (account) =>
        (account.email === formData.identifier ||
          account.phone === formData.identifier) &&
        account.password === formData.password &&
        account.role === role
    );

    if (!existingUser) {
      setError(
        "Account not found. Check your details or create a Farmverse account first."
      );
      return;
    }

    const loggedInUser = {
      id: existingUser.id,
      name: existingUser.name,
      email: existingUser.email,
      phone: existingUser.phone,
      role: existingUser.role,
      farmName: existingUser.farmName || "",
      location: existingUser.location || "",
      farmSize: existingUser.farmSize || "",
      farmingType: existingUser.farmingType || "",
      address: existingUser.address || "",
    };

    onLogin(loggedInUser);
    navigate(role === "farmer" ? "/dashboard" : "/profile");
  };

  return (
    <main style={styles.page}>
      <img src={LOGIN_IMAGE} alt="" style={styles.backgroundImage} />
      <div style={styles.overlay} />

      <div style={styles.content}>
        <section style={styles.leftPanel}>
          <div style={styles.brand}>
            <span style={styles.brandMark}>◆</span>
            <span>Farmverse</span>
          </div>

          <div style={styles.leftContent}>
            <p className="mono" style={styles.eyebrow}>
              FARM RECORDS · LOCAL HARVESTS · BETTER SEASONS
            </p>

            <h1 style={styles.heroTitle}>
              The work starts
              <br />
              before sunrise.
            </h1>

            <p style={styles.heroText}>
              Keep your farm, crops, harvests, and produce records close at hand.
            </p>
          </div>

          <div style={styles.photoCaption}>
            <span style={styles.captionLine} />
            <span>Made for the people who grow.</span>
          </div>
        </section>

        <section style={styles.card}>
          <p className="mono" style={styles.cardEyebrow}>
            WELCOME BACK
          </p>

          <h2 style={styles.title}>
            {role === "farmer" ? "Sign in to your farm." : "Sign in to Farmverse."}
          </h2>

          <p style={styles.description}>
            {role === "farmer"
              ? "Manage fields, crops, harvest plans, and produce listings."
              : "View your saved farms, local produce, and account details."}
          </p>

          <div style={styles.roleToggle}>
            <button
              type="button"
              onClick={() => setRole("farmer")}
              style={role === "farmer" ? styles.roleActive : styles.roleButton}
            >
              <span style={styles.roleSymbol}>♧</span>
              <span>
                <strong>Farmer</strong>
                <small>Farm workspace</small>
              </span>
            </button>

            <button
              type="button"
              onClick={() => setRole("user")}
              style={role === "user" ? styles.roleActive : styles.roleButton}
            >
              <span style={styles.roleSymbol}>◉</span>
              <span>
                <strong>Buyer</strong>
                <small>Local produce</small>
              </span>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {error && <div style={styles.errorBox}>{error}</div>}

            <div style={styles.field}>
              <label style={styles.label}>Mobile number or email</label>
              <input
                type="text"
                name="identifier"
                placeholder="9876543210 or you@email.com"
                value={formData.identifier}
                onChange={handleChange}
                style={styles.input}
                autoComplete="username"
              />
            </div>

            <div style={styles.field}>
              <div style={styles.passwordRow}>
                <label style={styles.label}>Password</label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.showButton}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                style={styles.input}
                autoComplete="current-password"
              />
            </div>

            <button type="submit" style={styles.submitButton}>
              Sign in <span>→</span>
            </button>
          </form>

          <div style={styles.bottomLine} />

          <p style={styles.linkText}>
            New to Farmverse?{" "}
            <Link to="/register" style={styles.link}>
              Create an account
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
};

const styles = {
  page: {
    minHeight: "calc(100vh - 65px)",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 24px",
  },
  backgroundImage: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  overlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(90deg, rgba(8,8,6,0.94) 0%, rgba(8,8,6,0.78) 45%, rgba(8,8,6,0.58) 100%)",
  },
  content: {
    width: "100%",
    maxWidth: "1150px",
    minHeight: "570px",
    position: "relative",
    zIndex: 1,
    display: "grid",
    gridTemplateColumns: "1fr 430px",
    gap: "70px",
    alignItems: "center",
  },
  leftPanel: {
    minHeight: "530px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "18px 0",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#f3ede0",
    fontFamily: "'Fraunces', serif",
    fontSize: "1.35rem",
    fontWeight: 600,
  },
  brandMark: {
    color: "#c9a227",
    fontSize: "0.85rem",
  },
  leftContent: {
    maxWidth: "600px",
  },
  eyebrow: {
    color: "#d8b53f",
    fontSize: "0.69rem",
    letterSpacing: "0.14em",
    marginBottom: "17px",
  },
  heroTitle: {
    color: "#f8f2e8",
    fontSize: "3.6rem",
    fontWeight: 500,
    lineHeight: 1.08,
    textShadow: "0 3px 24px rgba(0,0,0,0.4)",
  },
  heroText: {
    maxWidth: "430px",
    color: "#d4ccbd",
    fontSize: "1rem",
    lineHeight: 1.7,
    marginTop: "20px",
  },
  photoCaption: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#b5ab9d",
    fontSize: "0.78rem",
  },
  captionLine: {
    width: "42px",
    height: "1px",
    background: "#c9a227",
  },
  card: {
    background: "rgba(24,22,17,0.94)",
    border: "1px solid rgba(201,162,39,0.30)",
    borderRadius: "8px",
    padding: "36px",
    boxShadow: "0 25px 70px rgba(0,0,0,0.36)",
    backdropFilter: "blur(10px)",
  },
  cardEyebrow: {
    color: "#c9a227",
    fontSize: "0.68rem",
    letterSpacing: "0.14em",
    marginBottom: "12px",
  },
  title: {
    color: "#f3ede0",
    fontSize: "1.65rem",
    fontWeight: 500,
  },
  description: {
    color: "#a8a094",
    fontSize: "0.85rem",
    lineHeight: 1.55,
    marginTop: "9px",
  },
  roleToggle: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "9px",
    marginTop: "24px",
  },
  roleButton: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    textAlign: "left",
    padding: "11px 9px",
    background: "#12110e",
    border: "1px solid rgba(243,237,224,0.12)",
    borderRadius: "4px",
    color: "#9f978a",
    cursor: "pointer",
  },
  roleActive: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    textAlign: "left",
    padding: "11px 9px",
    background: "rgba(201,162,39,0.12)",
    border: "1px solid rgba(201,162,39,0.6)",
    borderRadius: "4px",
    color: "#f3ede0",
    cursor: "pointer",
  },
  roleSymbol: {
    color: "#d8b53f",
    fontSize: "1.15rem",
  },
  field: {
    marginTop: "19px",
  },
  label: {
    display: "block",
    color: "#b6ada0",
    fontSize: "0.78rem",
    marginBottom: "7px",
  },
  passwordRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  showButton: {
    color: "#d8b53f",
    border: "none",
    padding: 0,
    background: "transparent",
    cursor: "pointer",
    fontSize: "0.74rem",
  },
  input: {
    width: "100%",
    padding: "12px 12px",
    background: "#11100d",
    border: "1px solid rgba(243,237,224,0.14)",
    borderRadius: "3px",
    color: "#f3ede0",
    outline: "none",
    fontSize: "0.9rem",
  },
  submitButton: {
    width: "100%",
    marginTop: "29px",
    padding: "13px",
    border: "none",
    borderRadius: "3px",
    background: "#c9a227",
    color: "#0b0a08",
    cursor: "pointer",
    fontSize: "0.92rem",
    fontWeight: 700,
  },
  errorBox: {
    marginTop: "18px",
    padding: "10px",
    color: "#ffc4aa",
    background: "rgba(224,122,79,0.10)",
    border: "1px solid rgba(224,122,79,0.28)",
    borderRadius: "3px",
    fontSize: "0.81rem",
    lineHeight: 1.45,
  },
  bottomLine: {
    height: "1px",
    background: "rgba(243,237,224,0.10)",
    marginTop: "25px",
  },
  linkText: {
    color: "#a8a094",
    fontSize: "0.84rem",
    textAlign: "center",
    marginTop: "18px",
  },
  link: {
    color: "#e3bc3f",
    fontWeight: 600,
    textDecoration: "none",
  },
};

export default Login;