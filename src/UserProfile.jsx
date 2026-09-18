import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { cancelBuyerOrder, getBuyerOrders } from "./api.js";

const UserProfile = ({ user, onLogout, onUpdateUser }) => {
  const [editing, setEditing] = useState(false);
  const [address, setAddress] = useState(user?.address || "");
  const [message, setMessage] = useState("");
  const [orders, setOrders] = useState([]);

  const loadOrders = () => {
    if (!user?.id) return;
    setOrders(getBuyerOrders(user.id));
  };

  useEffect(() => {
    loadOrders();
  }, [user?.id]);

  const saveAddress = () => {
    const updatedUser = {
      ...user,
      address,
    };

    onUpdateUser(updatedUser);

    setEditing(false);
    setMessage("Delivery address updated.");
  };

  const handleCancelOrder = (orderId) => {
    if (!window.confirm("Cancel this order request?")) return;

    const updatedOrders = cancelBuyerOrder(user.id, orderId);
    setOrders(updatedOrders);
    setMessage("Order request cancelled.");
  };

  const pendingOrders = orders.filter((order) => order.status === "Pending");
  const completedOrders = orders.filter((order) => order.status === "Completed");
  const totalOrderValue = orders.reduce(
    (total, order) => total + Number(order.totalPrice || 0),
    0
  );

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.heroCard}>
          <div>
            <p className="mono" style={styles.eyebrow}>
              BUYER ACCOUNT
            </p>

            <h1 style={styles.name}>{user?.name || "Buyer"}</h1>

            <p style={styles.contact}>
              {user?.email} {user?.phone && `· ${user.phone}`}
            </p>

            <p style={styles.heroText}>
              Browse fresh produce from farmers, request orders, and manage your
              delivery address.
            </p>
          </div>

          <button style={styles.logoutBtn} onClick={onLogout}>
            Sign out
          </button>
        </section>

        <section style={styles.statsGrid}>
          <StatCard label="TOTAL ORDERS" value={orders.length} icon="▣" />
          <StatCard label="PENDING" value={pendingOrders.length} icon="◌" />
          <StatCard label="COMPLETED" value={completedOrders.length} icon="✓" />
          <StatCard label="ORDER VALUE" value={`₹${totalOrderValue}`} icon="₹" />
        </section>

        <section style={styles.quickLinks}>
          <Link to="/marketplace" style={styles.primaryLink}>
            Open marketplace →
          </Link>

          <Link to="/buyer-orders" style={styles.secondaryLink}>
            View my orders →
          </Link>
        </section>

        <div className="furrow" style={{ margin: "28px 0" }} />

        <section style={styles.card}>
          <div style={styles.sectionHeader}>
            <div>
              <p className="mono" style={styles.sectionEyebrow}>
                DELIVERY DETAILS
              </p>

              <h2 style={styles.sectionTitle}>Delivery address</h2>
            </div>

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
        </section>

        <div className="furrow" style={{ margin: "28px 0" }} />

        <section style={styles.card}>
          <div style={styles.sectionHeader}>
            <div>
              <p className="mono" style={styles.sectionEyebrow}>
                ORDER HISTORY
              </p>

              <h2 style={styles.sectionTitle}>Recent produce requests</h2>
            </div>

            <Link to="/buyer-orders" style={styles.smallLink}>
              View all →
            </Link>
          </div>

          {orders.length === 0 ? (
            <div style={styles.emptyOrders}>
              <span style={styles.emptyIcon}>▣</span>

              <h3>No orders yet.</h3>

              <p>
                Open the marketplace and request fresh produce from local
                farmers.
              </p>

              <Link to="/marketplace" style={styles.primaryLink}>
                Browse marketplace →
              </Link>
            </div>
          ) : (
            <div style={styles.orderList}>
              {orders.slice(0, 4).map((order) => (
                <article key={order.id} style={styles.orderCard}>
                  <div style={styles.orderTop}>
                    <div>
                      <h3 style={styles.cropName}>{order.cropName}</h3>

                      <p style={styles.orderMeta}>
                        Farmer: {order.farmerName || "Farmer"}
                      </p>
                    </div>

                    <span
                      style={{
                        ...styles.statusBadge,
                        ...(order.status === "Cancelled"
                          ? styles.cancelledBadge
                          : {}),
                      }}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div style={styles.orderGrid}>
                    <div>
                      <span>Quantity</span>
                      <strong>
                        {order.quantity} {order.unit}
                      </strong>
                    </div>

                    <div>
                      <span>Price</span>
                      <strong>
                        ₹{order.pricePerUnit}/{order.unit}
                      </strong>
                    </div>

                    <div>
                      <span>Total</span>
                      <strong>₹{order.totalPrice}</strong>
                    </div>
                  </div>

                  <div style={styles.orderFooter}>
                    <span>
                      {new Date(order.createdAt).toLocaleDateString("en-IN")}
                    </span>

                    {order.status === "Pending" && (
                      <button
                        style={styles.cancelOrderBtn}
                        onClick={() => handleCancelOrder(order.id)}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

const StatCard = ({ label, value, icon }) => (
  <article style={styles.statCard}>
    <span style={styles.statIcon}>{icon}</span>

    <div>
      <span className="mono" style={styles.statLabel}>
        {label}
      </span>

      <strong style={styles.statValue}>{value}</strong>
    </div>
  </article>
);

const styles = {
  page: {
    minHeight: "calc(100vh - 65px)",
    padding: "42px 20px 65px",
  },

  container: {
    maxWidth: "980px",
    margin: "0 auto",
  },

  heroCard: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    background:
      "linear-gradient(135deg, rgba(61,51,27,0.55), rgba(26,23,18,1) 70%)",
    border: "1px solid rgba(201,162,39,0.25)",
    borderRadius: "6px",
    padding: "34px",
  },

  eyebrow: {
    color: "#c9a227",
    fontSize: "0.72rem",
    letterSpacing: "0.14em",
    marginBottom: "12px",
  },

  name: {
    color: "#f3ede0",
    fontSize: "2rem",
    fontWeight: 500,
  },

  contact: {
    color: "#a8a094",
    fontSize: "0.88rem",
    marginTop: "5px",
  },

  heroText: {
    color: "#c9c0b2",
    maxWidth: "560px",
    lineHeight: 1.6,
    marginTop: "14px",
  },

  logoutBtn: {
    padding: "9px 14px",
    background: "transparent",
    color: "#e07a4f",
    border: "1px solid rgba(224,122,79,0.4)",
    borderRadius: "3px",
    cursor: "pointer",
    height: "fit-content",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "12px",
    marginTop: "18px",
  },

  statCard: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
    background: "#1a1712",
    border: "1px solid rgba(243,237,224,0.1)",
    borderRadius: "4px",
    padding: "16px",
  },

  statIcon: {
    minWidth: "34px",
    height: "34px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#e3bc3f",
    background: "rgba(201,162,39,0.1)",
    borderRadius: "3px",
  },

  statLabel: {
    display: "block",
    color: "#7c5432",
    fontSize: "0.62rem",
    letterSpacing: "0.08em",
  },

  statValue: {
    display: "block",
    color: "#f3ede0",
    fontSize: "1.18rem",
    marginTop: "4px",
  },

  quickLinks: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginTop: "18px",
  },

  primaryLink: {
    display: "inline-block",
    background: "#c9a227",
    color: "#0b0a08",
    padding: "10px 14px",
    borderRadius: "3px",
    textDecoration: "none",
    fontWeight: 700,
    border: "none",
    cursor: "pointer",
  },

  secondaryLink: {
    display: "inline-block",
    color: "#e3bc3f",
    border: "1px solid rgba(201,162,39,0.4)",
    padding: "10px 14px",
    borderRadius: "3px",
    textDecoration: "none",
  },

  card: {
    background: "#1a1712",
    border: "1px solid rgba(201,162,39,0.2)",
    padding: "28px",
    borderRadius: "5px",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "18px",
    alignItems: "flex-start",
  },

  sectionEyebrow: {
    color: "#7c5432",
    fontSize: "0.67rem",
    letterSpacing: "0.1em",
    marginBottom: "7px",
  },

  sectionTitle: {
    color: "#f3ede0",
    fontSize: "1.16rem",
    fontWeight: 500,
  },

  placeholder: {
    color: "#a8a094",
    fontSize: "0.9rem",
    lineHeight: 1.6,
    marginTop: "15px",
  },

  editBtn: {
    background: "transparent",
    color: "#e3bc3f",
    border: "1px solid rgba(201,162,39,0.4)",
    borderRadius: "3px",
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
    borderRadius: "3px",
    cursor: "pointer",
    fontWeight: 700,
  },

  cancelBtn: {
    background: "transparent",
    color: "#a8a094",
    border: "1px solid rgba(243,237,224,0.2)",
    padding: "7px 12px",
    borderRadius: "3px",
    cursor: "pointer",
  },

  textarea: {
    width: "100%",
    marginTop: "14px",
    background: "#151310",
    color: "#f3ede0",
    border: "1px solid rgba(243,237,224,0.16)",
    borderRadius: "3px",
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

  smallLink: {
    color: "#e3bc3f",
    textDecoration: "none",
    fontSize: "0.78rem",
  },

  emptyOrders: {
    color: "#a8a094",
    textAlign: "center",
    padding: "50px 10px",
    lineHeight: 1.6,
  },

  emptyIcon: {
    display: "block",
    color: "#7c5432",
    fontSize: "2.4rem",
    marginBottom: "10px",
  },

  orderList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginTop: "20px",
  },

  orderCard: {
    background: "#151310",
    border: "1px solid rgba(243,237,224,0.1)",
    borderLeft: "3px solid rgba(201,162,39,0.65)",
    padding: "16px",
    borderRadius: "4px",
  },

  orderTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "15px",
  },

  cropName: {
    color: "#f3ede0",
    fontSize: "1rem",
    margin: 0,
  },

  orderMeta: {
    color: "#8f877b",
    fontSize: "0.76rem",
    margin: "5px 0 0",
  },

  statusBadge: {
    color: "#e3bc3f",
    border: "1px solid rgba(201,162,39,0.35)",
    borderRadius: "14px",
    padding: "4px 9px",
    fontSize: "0.72rem",
    height: "fit-content",
  },

  cancelledBadge: {
    color: "#e07a4f",
    border: "1px solid rgba(224,122,79,0.35)",
  },

  orderGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "10px",
    marginTop: "15px",
    color: "#a8a094",
    fontSize: "0.78rem",
  },

  orderFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "#756d62",
    fontSize: "0.72rem",
    marginTop: "15px",
  },

  cancelOrderBtn: {
    background: "transparent",
    color: "#e07a4f",
    border: "1px solid rgba(224,122,79,0.35)",
    padding: "6px 9px",
    borderRadius: "3px",
    cursor: "pointer",
    fontSize: "0.72rem",
  },
};

export default UserProfile;