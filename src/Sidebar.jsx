import React from "react";
import { NavLink } from "react-router-dom";

const menuGroups = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", path: "/dashboard", icon: "▦" },
      { label: "Alerts", path: "/notifications", icon: "🔔" },
    ],
  },
  {
    title: "Farm Records",
    items: [
      { label: "Farms", path: "/farm-management", icon: "🌾" },
      { label: "Crops", path: "/crop-management", icon: "☘️" },
      { label: "Reports", path: "/reports", icon: "📋" },
    ],
  },
  {
    title: "AI Tools",
    items: [
      { label: "AI Assistant", path: "/assistant", icon: "✦" },
      { label: "Fertilizer", path: "/fertilizer", icon: "🧪" },
      { label: "Crop Advisor", path: "/crop-recommendation", icon: "🌱" },
      { label: "Disease Scan", path: "/disease-detection", icon: "🔍" },
    ],
  },
  {
    title: "Commerce",
    items: [
      { label: "Collective Lots", path: "/collective-selling", icon: "📦" },
      { label: "Vehicle Sharing", path: "/vehicle-sharing", icon: "🚛" },
      { label: "Produce Listings", path: "/profile", icon: "▣" },
    ],
  },
  {
    title: "Conditions",
    items: [{ label: "Weather", path: "/weather", icon: "☁️" }],
  },
];

const Sidebar = ({ user, collapsed }) => {
  if (!user || user.role !== "farmer") return null;

  return (
    <aside
      style={{
        ...styles.sidebar,
        width: collapsed ? "78px" : "248px",
      }}
    >
      <div
        style={{
          ...styles.workspace,
          justifyContent: collapsed ? "center" : "flex-start",
        }}
      >
        <span style={styles.workspaceIcon}>◆</span>

        {!collapsed && (
          <div>
            <strong style={styles.workspaceTitle}>Farm Workspace</strong>

            <p style={styles.workspaceText}>
              {user?.name?.split(" ")[0] || "Farmer"}
            </p>
          </div>
        )}
      </div>

      <nav style={styles.nav}>
        {menuGroups.map((group) => (
          <div key={group.title} style={styles.group}>
            {!collapsed && (
              <p className="mono" style={styles.groupTitle}>
                {group.title}
              </p>
            )}

            {group.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                title={collapsed ? item.label : ""}
                style={({ isActive }) => ({
                  ...styles.link,
                  ...(isActive ? styles.activeLink : {}),
                  justifyContent: collapsed ? "center" : "flex-start",
                  padding: collapsed ? "8px 0" : "9px 10px",
                })}
              >
                <span style={styles.icon}>{item.icon}</span>

                {!collapsed && <span style={styles.label}>{item.label}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {!collapsed && (
        <div style={styles.note}>
          <strong>Tip</strong>
          <p>
            Add crop records and produce listings first. Collective lots and
            vehicle sharing become more useful with real harvest data.
          </p>
        </div>
      )}
    </aside>
  );
};

const styles = {
  sidebar: {
    position: "fixed",
    left: 0,
    top: "65px",
    height: "calc(100vh - 65px)",
    background: "#11100d",
    borderRight: "1px solid rgba(201,162,39,0.18)",
    zIndex: 90,
    padding: "16px 10px",
    overflowY: "auto",
    overflowX: "hidden",
    transition: "width 0.25s ease",
    boxSizing: "border-box",
  },

  workspace: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
    padding: "9px",
    background: "rgba(201,162,39,0.08)",
    border: "1px solid rgba(201,162,39,0.20)",
    borderRadius: "7px",
    marginBottom: "18px",
    boxSizing: "border-box",
  },

  workspaceIcon: {
    minWidth: "38px",
    width: "38px",
    height: "38px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    background: "#c9a227",
    color: "#0b0a08",
    fontSize: "0.95rem",
    fontWeight: 800,
    boxShadow: "0 0 16px rgba(201,162,39,0.25)",
  },

  workspaceTitle: {
    color: "#f3ede0",
    fontSize: "0.88rem",
  },

  workspaceText: {
    color: "#8f877b",
    fontSize: "0.72rem",
    margin: "3px 0 0",
  },

  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },

  group: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },

  groupTitle: {
    color: "#8a623a",
    fontSize: "0.65rem",
    letterSpacing: "0.12em",
    margin: "8px 10px 5px",
  },

  link: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
    color: "#b1a99c",
    textDecoration: "none",
    borderRadius: "7px",
    fontSize: "0.86rem",
    border: "1px solid transparent",
    minHeight: "48px",
    boxSizing: "border-box",
    transition: "background 0.2s ease, border 0.2s ease, color 0.2s ease",
  },

  activeLink: {
    color: "#f3ede0",
    background: "rgba(201,162,39,0.13)",
    border: "1px solid rgba(201,162,39,0.34)",
    boxShadow: "inset 3px 0 0 #c9a227",
  },

  icon: {
    width: "38px",
    minWidth: "38px",
    height: "38px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "8px",
    background: "rgba(201,162,39,0.12)",
    color: "#e3bc3f",
    fontSize: "1.25rem",
    lineHeight: 1,
    boxShadow: "0 0 0 1px rgba(201,162,39,0.14)",
  },

  label: {
    whiteSpace: "nowrap",
  },

  note: {
    marginTop: "22px",
    padding: "13px",
    color: "#aa9f91",
    background: "rgba(224,122,79,0.06)",
    border: "1px solid rgba(224,122,79,0.16)",
    borderRadius: "5px",
    fontSize: "0.74rem",
    lineHeight: 1.5,
  },
};

export default Sidebar;