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
          aria-label="Toggle menu"
        >
          {open ? "✕" : "☰"}
        </button>

        <nav className={`nav-links ${open ? "open" : ""}`} style={styles.links}>
          <Link to="/" style={styles.link} onClick={closeMenu}>
            Home
          </Link>

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
            </>
          )}

          {user ? (
            <>
              <Link to="/profile" style={styles.link} onClick={closeMenu}>
                Profile
              </Link>

              <button type="button" onClick={handleLogout} style={styles.logoutBtn}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.link} onClick={closeMenu}>
                Sign in
              </Link>

              <Link to="/register" style={styles.registerBtn} onClick={closeMenu}>
                Join
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
    maxWidth: "1280px",
    margin: "0 auto",
    padding: "18px 48px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
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
  },
  brandMark: {
    color: "#c9a227",
    fontSize: "0.85rem",
  },
  links: {
    display: "flex",
    alignItems: "center",
    gap: "28px",
  },
  link: {
    color: "#a8a094",
    fontSize: "0.9rem",
    textDecoration: "none",
  },
  registerBtn: {
    border: "1px solid #c9a227",
    borderRadius: "2px",
    color: "#e3bc3f",
    padding: "8px 18px",
    textDecoration: "none",
    fontSize: "0.88rem",
  },
  logoutBtn: {
    background: "transparent",
    border: "1px solid rgba(243,237,224,0.22)",
    borderRadius: "2px",
    color: "#a8a094",
    cursor: "pointer",
    padding: "8px 16px",
    fontSize: "0.88rem",
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