import React, { useState } from "react";

const UserProfile = ({ user, onLogout, onUpdateUser }) => {
  const [editing, setEditing] = useState(false);
  const [address, setAddress] = useState(user?.address || "");
  const [message, setMessage] = useState("");

  const saveAddress = () => {
    const updatedUser = {
      ...user,
      address,
    };

    onUpdateUser(updatedUser);

    setEditing(false);
    setMessage("Delivery address updated.");
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div>
            <p className="mono" style={styles.eyebrow}>
              BUYER ACCOUNT
            </p>
            <h1 style={styles.name}>{user?.name || "Buyer"}</h1>
            <p style={styles.contact}>
              {user?.email} {user?.phone && `· ${user.phone}`}
            </p>
          </div>

          <button style={styles.logoutBtn} onClick={onLogout}>
            Sign out
          </button>
        </div>

        <div className="furrow" style={{ margin: "26px 0" }} />

        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Delivery address</h2>

          {!editing ? (
            <button style={styles.editBtn} onClick={() => setEditing(true)}>
              Edit
            </button>
          ) : (
            <div style={styles.actions}>
              <button style={styles.saveBtn} onClick={saveAddress}>
                Save
              </button>
              <button
                style={styles.cancelBtn}
                onClick={() => {
                  setEditing(false);
                  setAddress(user?.address || "");
                }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {message && <p style={styles.message}>{message}</p>}

        {editing ? (
          <textarea
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            placeholder="House number, street, village/city, district, state, PIN code"
            style={styles.textarea}
            rows="4"
          />
        ) : (
          <p style={styles.placeholder}>
            {user?.address || "No delivery address saved yet."}
          </p>
        )}

        <div className="furrow" style={{ margin: "26px 0" }} />

        <h2 style={styles.sectionTitle}>Saved farms</h2>
        <p style={styles.placeholder}>You have not saved any farms yet.</p>

        <div className="furrow" style={{ margin: "26px 0" }} />

        <h2 style={styles.sectionTitle}>Order history</h2>
        <p style={styles.placeholder}>No orders placed yet.</p>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "calc(100vh - 65px)",
    display: "flex",
    justifyContent: "center",
    padding: "50px 20px",
  },
  card: {
    width: "100%",
    maxWidth: "560px",
    background: "#1a1712",
    border: "1px solid rgba(201,162,39,0.2)",
    padding: "40px",
    borderRadius: "4px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: "18px",
  },
  eyebrow: {
    color: "#c9a227",
    fontSize: "0.72rem",
    letterSpacing: "0.14em",
    marginBottom: "12px",
  },
  name: {
    color: "#f3ede0",
    fontSize: "1.6rem",
    fontWeight: 500,
  },
  contact: {
    color: "#a8a094",
    fontSize: "0.88rem",
    marginTop: "5px",
  },
  logoutBtn: {
    padding: "9px 14px",
    background: "transparent",
    color: "#e07a4f",
    border: "1px solid rgba(224,122,79,0.4)",
    borderRadius: "2px",
    cursor: "pointer",
    height: "fit-content",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    color: "#f3ede0",
    fontSize: "1.05rem",
    fontWeight: 500,
  },
  placeholder: {
    color: "#a8a094",
    fontSize: "0.9rem",
    lineHeight: 1.6,
    marginTop: "11px",
  },
  editBtn: {
    background: "transparent",
    color: "#e3bc3f",
    border: "1px solid rgba(201,162,39,0.4)",
    borderRadius: "2px",
    padding: "7px 12px",
    cursor: "pointer",
  },
  actions: {
    display: "flex",
    gap: "8px",
  },
  saveBtn: {
    background: "#c9a227",
    color: "#0b0a08",
    border: "none",
    padding: "7px 12px",
    borderRadius: "2px",
    cursor: "pointer",
    fontWeight: 700,
  },
  cancelBtn: {
    background: "transparent",
    color: "#a8a094",
    border: "1px solid rgba(243,237,224,0.2)",
    padding: "7px 12px",
    borderRadius: "2px",
    cursor: "pointer",
  },
  textarea: {
    width: "100%",
    marginTop: "14px",
    background: "#151310",
    color: "#f3ede0",
    border: "1px solid rgba(243,237,224,0.16)",
    borderRadius: "2px",
    padding: "10px",
    resize: "vertical",
    outline: "none",
    fontFamily: "inherit",
  },
  message: {
    color: "#e3bc3f",
    fontSize: "0.84rem",
    marginTop: "10px",
  },
};

export default UserProfile;