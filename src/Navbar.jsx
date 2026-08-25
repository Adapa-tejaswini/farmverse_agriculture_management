import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = ({ user, onLogout }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const closeMenu = () => setOpen(false);

  const handleLogout = () => {
    onLogout();
    closeMenu();
    navigate("/");
  };

  return (
    <header style={styles.wrap}>
      <div style={styles.bar}>
        <Link to="/" style={styles.brand} onClick={closeMenu}>
          <span style={styles.brandMark}>◆</span>
          Farmverse
        </Link>

        <button
          type="button"
          style={styles.menuBtn}
          className="menu-btn"
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation menu"
        >
          {open ? "✕" : "☰"}
        </button>

        <nav
          className={`nav-links ${open ? "open" : ""}`}
          style={styles.links}
        >
          <Link to="/" style={styles.link} onClick={closeMenu}>
            Home
          </Link>

          {/* Farmer-only navigation */}
          {user?.role === "farmer" && (
            <>
              <Link to="/dashboard" style={styles.link} onClick={closeMenu}>
                Dashboard
              </Link>

              <Link to="/farm-management" style={styles.link} onClick={closeMenu}>
                Farms
              </Link>

              <Link to="/crop-management" style={styles.link} onClick={closeMenu}>
                Crops
              </Link>

              <Link to="/weather" style={styles.link} onClick={closeMenu}>
                Weather
              </Link>

              <Link to="/reports" style={styles.link} onClick={closeMenu}>
                Reports
              </Link>

              <Link to="/assistant" style={styles.aiLink} onClick={closeMenu}>
                ✦ AI Assistant
              </Link>
            </>
          )}

          {/* Logged-in navigation */}
          {user ? (
            <>
              <Link to="/profile" style={styles.link} onClick={closeMenu}>
                Profile
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                style={styles.logoutBtn}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.link} onClick={closeMenu}>
                Sign in
              </Link>

              <Link
                to="/register"
                style={styles.registerBtn}
                onClick={closeMenu}
              >
                Join Farmverse
              </Link>
            </>
          )}
        </nav>
      </div>

      <div className="furrow" />
    </header>
  );
};

const styles = {
  wrap: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    background: "rgba(11,10,8,0.95)",
    backdropFilter: "blur(8px)",
  },

  bar: {
    maxWidth: "1380px",
    margin: "0 auto",
    padding: "18px 38px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#f3ede0",
    fontFamily: "'Fraunces', serif",
    fontSize: "1.3rem",
    fontWeight: 600,
    textDecoration: "none",
    whiteSpace: "nowrap",
  },

  brandMark: {
    color: "#c9a227",
    fontSize: "0.85rem",
  },

  links: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },

  link: {
    color: "#b1a99c",
    fontSize: "0.85rem",
    textDecoration: "none",
    whiteSpace: "nowrap",
  },

  aiLink: {
    color: "#e3bc3f",
    border: "1px solid rgba(201,162,39,0.4)",
    borderRadius: "14px",
    padding: "6px 10px",
    fontSize: "0.76rem",
    textDecoration: "none",
    whiteSpace: "nowrap",
  },

  registerBtn: {
    border: "1px solid #c9a227",
    borderRadius: "3px",
    color: "#e3bc3f",
    padding: "8px 14px",
    textDecoration: "none",
    fontSize: "0.82rem",
    whiteSpace: "nowrap",
  },

  logoutBtn: {
    background: "transparent",
    border: "1px solid rgba(243,237,224,0.22)",
    borderRadius: "3px",
    color: "#b1a99c",
    cursor: "pointer",
    padding: "8px 13px",
    fontSize: "0.82rem",
    whiteSpace: "nowrap",
  },

  menuBtn: {
    display: "none",
    background: "transparent",
    border: "none",
    color: "#f3ede0",
    cursor: "pointer",
    fontSize: "1.5rem",
  },
};

export default Navbar;