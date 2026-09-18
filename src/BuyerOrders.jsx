import React, { useEffect, useState } from "react";
import { cancelBuyerOrder, getBuyerOrders } from "./api.js";

const BuyerOrders = ({ user }) => {
  const [orders, setOrders] = useState([]);

  const loadOrders = () => {
    if (!user?.id) return;
    setOrders(getBuyerOrders(user.id));
  };

  useEffect(() => {
    loadOrders();
  }, [user?.id]);

  const handleCancel = (orderId) => {
    if (!window.confirm("Cancel this order request?")) return;

    const updated = cancelBuyerOrder(user.id, orderId);
    setOrders(updated);
  };

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.header}>
          <p className="mono" style={styles.eyebrow}>
            BUYER ORDERS
          </p>

          <h1 style={styles.title}>My produce order requests.</h1>

          <p style={styles.subtitle}>
            Track produce requests you created from the marketplace.
          </p>
        </section>

        {orders.length === 0 ? (
          <section style={styles.empty}>
            <span style={styles.emptyIcon}>▣</span>
            <h2>No orders yet.</h2>
            <p>Open marketplace and request produce from farmers.</p>
          </section>
        ) : (
          <section style={styles.list}>
            {orders.map((order) => (
              <article key={order.id} style={styles.card}>
                <div style={styles.top}>
                  <div>
                    <h2 style={styles.cropName}>{order.cropName}</h2>
                    <p style={styles.meta}>Farmer: {order.farmerName}</p>
                  </div>

                  <span
                    style={{
                      ...styles.status,
                      ...(order.status === "Cancelled" ? styles.cancelled : {}),
                    }}
                  >
                    {order.status}
                  </span>
                </div>

                <div style={styles.grid}>
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

                {order.deliveryAddress && (
                  <p style={styles.note}>
                    <strong>Address:</strong> {order.deliveryAddress}
                  </p>
                )}

                {order.buyerNote && (
                  <p style={styles.note}>
                    <strong>Note:</strong> {order.buyerNote}
                  </p>
                )}

                <div style={styles.footer}>
                  <span>{new Date(order.createdAt).toLocaleString("en-IN")}</span>

                  {order.status === "Pending" && (
                    <button
                      style={styles.cancelBtn}
                      onClick={() => handleCancel(order.id)}
                    >
                      Cancel request
                    </button>
                  )}
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
};

const styles = {
  page: {
    minHeight: "calc(100vh - 65px)",
    padding: "38px 20px 65px",
  },
  container: {
    maxWidth: "980px",
    margin: "0 auto",
  },
  header: {
    marginBottom: "24px",
  },
  eyebrow: {
    color: "#c9a227",
    fontSize: "0.7rem",
    letterSpacing: "0.14em",
    marginBottom: "10px",
  },
  title: {
    color: "#f3ede0",
    fontSize: "2rem",
    fontWeight: 500,
  },
  subtitle: {
    color: "#a8a094",
    lineHeight: 1.6,
    marginTop: "8px",
  },
  empty: {
    background: "#1a1712",
    border: "1px solid rgba(201,162,39,0.2)",
    color: "#a8a094",
    textAlign: "center",
    padding: "80px 20px",
    borderRadius: "5px",
  },
  emptyIcon: {
    display: "block",
    color: "#7c5432",
    fontSize: "2.4rem",
    marginBottom: "10px",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  card: {
    background: "#1a1712",
    border: "1px solid rgba(201,162,39,0.2)",
    borderLeft: "3px solid rgba(201,162,39,0.65)",
    borderRadius: "5px",
    padding: "20px",
  },
  top: {
    display: "flex",
    justifyContent: "space-between",
    gap: "15px",
  },
  cropName: {
    color: "#f3ede0",
    fontSize: "1.15rem",
    margin: 0,
  },
  meta: {
    color: "#8f877b",
    fontSize: "0.78rem",
    marginTop: "5px",
  },
  status: {
    color: "#e3bc3f",
    border: "1px solid rgba(201,162,39,0.35)",
    borderRadius: "14px",
    padding: "4px 9px",
    fontSize: "0.72rem",
    height: "fit-content",
  },
  cancelled: {
    color: "#e07a4f",
    border: "1px solid rgba(224,122,79,0.35)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "10px",
    marginTop: "18px",
  },
  note: {
    color: "#a8a094",
    background: "#151310",
    border: "1px solid rgba(243,237,224,0.08)",
    padding: "10px",
    fontSize: "0.8rem",
    lineHeight: 1.5,
    marginTop: "12px",
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "#756d62",
    fontSize: "0.72rem",
    marginTop: "16px",
  },
  cancelBtn: {
    background: "transparent",
    color: "#e07a4f",
    border: "1px solid rgba(224,122,79,0.4)",
    padding: "7px 10px",
    borderRadius: "3px",
    cursor: "pointer",
  },
};

export default BuyerOrders;