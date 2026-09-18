import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = ({ user, onLogout, onToggleSidebar, sidebarCollapsed }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  return (
    <header style={styles.wrap}>
      <div style={styles.bar}>
        <div style={styles.left}>
          {user?.role === "farmer" && (
            <button
              type="button"
              style={styles.menuBtn}
              onClick={onToggleSidebar}
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              ☰
            </button>
          )}

          <Link
            to={user?.role === "user" ? "/marketplace" : "/"}
            style={styles.brand}
          >
            <span style={styles.brandMark}>◆</span>
            Farmverse
          </Link>
        </div>

        <nav style={styles.links}>
          {/* Buyer should not see Home */}
          {user?.role !== "user" && (
            <Link to="/" style={styles.link}>
              Home
            </Link>
          )}

          {/* Buyer-only navigation */}
          {user?.role === "user" && (
            <>
              <Link to="/marketplace" style={styles.marketLink}>
                Marketplace
              </Link>

              <Link to="/collective-selling" style={styles.link}>
                Collective Lots
              </Link>

              <Link to="/buyer-orders" style={styles.link}>
                My Orders
              </Link>
            </>
          )}

          {/* Farmer quick navigation */}
          {user?.role === "farmer" && (
            <>
              <Link to="/collective-selling" style={styles.link}>
                Collective Lots
              </Link>

              <Link to="/vehicle-sharing" style={styles.link}>
                Vehicle Sharing
              </Link>

              <Link to="/assistant" style={styles.aiLink}>
                ✦ AI Assistant
              </Link>
            </>
          )}

          {/* Logged-in navigation */}
          {user ? (
            <>
              <Link to="/profile" style={styles.link}>
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
              <Link to="/login" style={styles.link}>
                Sign in
              </Link>

              <Link to="/register" style={styles.registerBtn}>
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
    background: "rgba(11,10,8,0.96)",
    backdropFilter: "blur(8px)",
  },
  bar: {
    minHeight: "64px",
    maxWidth: "1480px",
    margin: "0 auto",
    padding: "10px 28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "18px",
  },
  left: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  menuBtn: {
    width: "36px",
    height: "36px",
    border: "1px solid rgba(201,162,39,0.28)",
    borderRadius: "4px",
    background: "rgba(201,162,39,0.06)",
    color: "#e3bc3f",
    cursor: "pointer",
    fontSize: "1rem",
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
    justifyContent: "flex-end",
    gap: "14px",
    flexWrap: "wrap",
  },
  link: {
    color: "#b1a99c",
    fontSize: "0.82rem",
    textDecoration: "none",
    whiteSpace: "nowrap",
  },
  marketLink: {
    color: "#0b0a08",
    background: "#c9a227",
    borderRadius: "14px",
    padding: "6px 11px",
    fontSize: "0.76rem",
    fontWeight: 700,
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
};

export default Navbar;