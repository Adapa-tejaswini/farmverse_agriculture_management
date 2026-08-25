import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "./api.js";

const REGISTER_IMAGE =
  "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?auto=format&fit=crop&w=1600&q=85";

const Register = ({ onRegister }) => {
  const navigate = useNavigate();

  const [role, setRole] = useState("farmer");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const { name, email, phone, password, confirmPassword } = formData;

    if (
      !name.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError("Fill in every field to create your account.");
      return;
    }

    const cleanPhone = phone.replace(/\D/g, "").slice(-10);

    if (!/^\d{10}$/.test(cleanPhone)) {
      setError("Enter a valid 10-digit phone number.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const data = await registerUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: cleanPhone,
        password,
        role,
      });

      onRegister(data.user);
      navigate(data.user.role === "farmer" ? "/dashboard" : "/profile");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={styles.page}>
      <img src={REGISTER_IMAGE} alt="" style={styles.backgroundImage} />
      <div style={styles.overlay} />

      <div style={styles.content}>
        <section style={styles.card}>
          <p className="mono" style={styles.eyebrow}>
            CREATE A FARMVERSE ACCOUNT
          </p>

          <h1 style={styles.title}>Start your record.</h1>

          <p style={styles.description}>
            Create a simple digital space for your farm, crop seasons, harvests,
            and local produce.
          </p>

          <div style={styles.roleToggle}>
            <button
              type="button"
              onClick={() => setRole("farmer")}
              style={role === "farmer" ? styles.roleActive : styles.roleButton}
              disabled={loading}
            >
              <span style={styles.roleIcon}>♧</span>
              <span>
                <strong>Farmer</strong>
                <small>Farms, crops & harvests</small>
              </span>
            </button>

            <button
              type="button"
              onClick={() => setRole("user")}
              style={role === "user" ? styles.roleActive : styles.roleButton}
              disabled={loading}
            >
              <span style={styles.roleIcon}>◉</span>
              <span>
                <strong>Buyer</strong>
                <small>Fresh local produce</small>
              </span>
            </button>
          </div>

          {role === "farmer" && (
            <div style={styles.farmerNote}>
              <span>☘</span>
              <span>
                You can begin with basic details. Soil pH, NPK, and soil reports
                are optional.
              </span>
            </div>
          )}

          {error && <div style={styles.errorBox}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={styles.field}>
              <label style={styles.label}>Full name</label>
              <input
                type="text"
                name="name"
                placeholder="Example: Ramesh Patil"
                value={formData.name}
                onChange={handleChange}
                style={styles.input}
                autoComplete="name"
                disabled={loading}
              />
            </div>

            <div style={styles.twoColumn}>
              <div style={styles.field}>
                <label style={styles.label}>Mobile number</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                  style={styles.input}
                  autoComplete="tel"
                  disabled={loading}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Email address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="you@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  style={styles.input}
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            </div>

            <div style={styles.field}>
              <div style={styles.labelRow}>
                <label style={styles.label}>Password</label>
                <button
                  type="button"
                  style={styles.showButton}
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={handleChange}
                style={styles.input}
                autoComplete="new-password"
                disabled={loading}
              />
            </div>

            <div style={styles.field}>
              <div style={styles.labelRow}>
                <label style={styles.label}>Confirm password</label>
                <button
                  type="button"
                  style={styles.showButton}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>

              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Enter password again"
                value={formData.confirmPassword}
                onChange={handleChange}
                style={styles.input}
                autoComplete="new-password"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              style={{
                ...styles.submitButton,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
              disabled={loading}
            >
              {loading ? (
                "Creating account..."
              ) : (
                <>
                  Create my account <span>→</span>
                </>
              )}
            </button>
          </form>

          <p style={styles.linkText}>
            Already registered?{" "}
            <Link to="/login" style={styles.link}>
              Sign in
            </Link>
          </p>
        </section>

        <section style={styles.rightPanel}>
          <div style={styles.brand}>
            <span style={styles.brandMark}>◆</span>
            Farmverse
          </div>

          <div style={styles.rightContent}>
            <p className="mono" style={styles.rightEyebrow}>
              FARMER-FIRST DIGITAL AGRICULTURE
            </p>

            <h2 style={styles.rightTitle}>
              From one field
              <br />
              to a better season.
            </h2>

            <p style={styles.rightText}>
              Build a record of your farm as the season unfolds — one crop, one
              harvest, one decision at a time.
            </p>
          </div>

          <div style={styles.steps}>
            <div>
              <span>01</span>
              <p>Create your account</p>
            </div>
            <div>
              <span>02</span>
              <p>Add a farm or field</p>
            </div>
            <div>
              <span>03</span>
              <p>Track your crop season</p>
            </div>
          </div>
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
    padding: "45px 24px",
  },
  backgroundImage: {
    position: "absolute",
    inset: 0,
    height: "100%",
    width: "100%",
    objectFit: "cover",
  },
  overlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(90deg, rgba(10,10,7,0.80) 0%, rgba(10,10,7,0.50) 48%, rgba(10,10,7,0.86) 100%)",
  },
  content: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    maxWidth: "1140px",
    display: "grid",
    gridTemplateColumns: "450px 1fr",
    alignItems: "center",
    gap: "100px",
  },
  card: {
    background: "rgba(23,21,16,0.95)",
    border: "1px solid rgba(201,162,39,0.30)",
    borderRadius: "8px",
    padding: "34px",
    boxShadow: "0 25px 70px rgba(0,0,0,0.42)",
    backdropFilter: "blur(10px)",
  },
  eyebrow: {
    color: "#c9a227",
    fontSize: "0.67rem",
    letterSpacing: "0.13em",
    marginBottom: "11px",
  },
  title: {
    color: "#f3ede0",
    fontSize: "1.65rem",
    fontWeight: 500,
  },
  description: {
    color: "#a8a094",
    fontSize: "0.84rem",
    lineHeight: 1.55,
    marginTop: "9px",
  },
  roleToggle: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "9px",
    marginTop: "22px",
  },
  roleButton: {
    display: "flex",
    alignItems: "center",
    textAlign: "left",
    gap: "8px",
    padding: "10px 8px",
    background: "#11100d",
    border: "1px solid rgba(243,237,224,0.12)",
    borderRadius: "4px",
    color: "#a8a094",
    cursor: "pointer",
  },
  roleActive: {
    display: "flex",
    alignItems: "center",
    textAlign: "left",
    gap: "8px",
    padding: "10px 8px",
    background: "rgba(201,162,39,0.12)",
    border: "1px solid rgba(201,162,39,0.58)",
    borderRadius: "4px",
    color: "#f3ede0",
    cursor: "pointer",
  },
  roleIcon: {
    color: "#d8b53f",
    fontSize: "1.12rem",
  },
  farmerNote: {
    display: "flex",
    gap: "8px",
    background: "rgba(201,162,39,0.07)",
    border: "1px solid rgba(201,162,39,0.17)",
    color: "#c6bcad",
    padding: "10px",
    borderRadius: "3px",
    fontSize: "0.76rem",
    lineHeight: 1.45,
    marginTop: "14px",
  },
  field: {
    marginTop: "16px",
  },
  twoColumn: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "11px",
  },
  label: {
    display: "block",
    color: "#b7aea0",
    fontSize: "0.77rem",
    marginBottom: "7px",
  },
  labelRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  showButton: {
    background: "transparent",
    border: "none",
    color: "#e3bc3f",
    cursor: "pointer",
    padding: 0,
    fontSize: "0.72rem",
  },
  input: {
    width: "100%",
    background: "#11100d",
    border: "1px solid rgba(243,237,224,0.14)",
    borderRadius: "3px",
    color: "#f3ede0",
    outline: "none",
    padding: "11px",
    fontSize: "0.87rem",
  },
  submitButton: {
    width: "100%",
    padding: "13px",
    border: "none",
    borderRadius: "3px",
    cursor: "pointer",
    background: "#c9a227",
    color: "#0b0a08",
    fontSize: "0.91rem",
    fontWeight: 700,
    marginTop: "28px",
  },
  errorBox: {
    marginTop: "14px",
    color: "#ffc1a6",
    background: "rgba(224,122,79,0.10)",
    border: "1px solid rgba(224,122,79,0.27)",
    padding: "10px",
    borderRadius: "3px",
    fontSize: "0.8rem",
  },
  linkText: {
    color: "#a8a094",
    textAlign: "center",
    fontSize: "0.83rem",
    marginTop: "20px",
  },
  link: {
    color: "#e3bc3f",
    textDecoration: "none",
    fontWeight: 600,
  },
  rightPanel: {
    color: "#f3ede0",
    minHeight: "570px",
    padding: "18px 0",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  brand: {
    fontFamily: "'Fraunces', serif",
    fontSize: "1.32rem",
    fontWeight: 600,
  },
  brandMark: {
    color: "#c9a227",
    fontSize: "0.85rem",
    marginRight: "10px",
  },
  rightContent: {
    maxWidth: "520px",
  },
  rightEyebrow: {
    color: "#d8b53f",
    fontSize: "0.68rem",
    letterSpacing: "0.14em",
    marginBottom: "17px",
  },
  rightTitle: {
    color: "#f7f0e4",
    fontSize: "3.4rem",
    fontWeight: 500,
    lineHeight: 1.1,
  },
  rightText: {
    color: "#d6cdbd",
    maxWidth: "440px",
    fontSize: "1rem",
    lineHeight: 1.65,
    marginTop: "19px",
  },
  steps: {
    display: "flex",
    gap: "35px",
  },
};

export default Register;