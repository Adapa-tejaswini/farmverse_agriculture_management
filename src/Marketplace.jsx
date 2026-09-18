import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { createBuyerOrder, getMarketplaceListings } from "./api.js";

const MARKET_IMAGE =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1800&q=85";

const Marketplace = ({ user }) => {
  const [listings, setListings] = useState([]);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("latest");
  const [selectedListing, setSelectedListing] = useState(null);
  const [orderData, setOrderData] = useState({
    quantity: "",
    deliveryAddress: user?.address || "",
    buyerNote: "",
  });
  const [message, setMessage] = useState("");

  const loadListings = () => {
    setListings(getMarketplaceListings());
  };

  useEffect(() => {
    loadListings();
  }, []);

  const filteredListings = useMemo(() => {
    let result = [...listings];

    if (search.trim()) {
      result = result.filter((listing) =>
        listing.cropName.toLowerCase().includes(search.trim().toLowerCase())
      );
    }

    if (location.trim()) {
      result = result.filter((listing) =>
        String(listing.location || "")
          .toLowerCase()
          .includes(location.trim().toLowerCase())
      );
    }

    if (maxPrice && Number(maxPrice) > 0) {
      result = result.filter((listing) => Number(listing.price) <= Number(maxPrice));
    }

    if (sort === "price_low") {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    }

    if (sort === "price_high") {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    }

    if (sort === "quantity_high") {
      result.sort((a, b) => Number(b.quantity) - Number(a.quantity));
    }

    if (sort === "latest") {
      result.sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
    }

    return result;
  }, [listings, search, location, maxPrice, sort]);

  const openOrder = (listing) => {
    setSelectedListing(listing);
    setMessage("");
    setOrderData({
      quantity: "",
      deliveryAddress: user?.address || "",
      buyerNote: "",
    });
  };

  const closeOrder = () => {
    setSelectedListing(null);
    setOrderData({
      quantity: "",
      deliveryAddress: user?.address || "",
      buyerNote: "",
    });
  };

  const handleOrderChange = (event) => {
    setOrderData({
      ...orderData,
      [event.target.name]: event.target.value,
    });
  };

  const handleCreateOrder = () => {
    setMessage("");

    if (!selectedListing) return;

    try {
      const order = createBuyerOrder(user.id, {
        listing: selectedListing,
        quantity: orderData.quantity,
        deliveryAddress: orderData.deliveryAddress,
        buyerNote: orderData.buyerNote,
      });

      setMessage(
        `Order request created for ${order.quantity} ${order.unit} ${order.cropName}.`
      );

      closeOrder();
    } catch (err) {
      setMessage(err.message || "Could not create order request.");
    }
  };

  const totalPrice =
    selectedListing && orderData.quantity
      ? Number(orderData.quantity) * Number(selectedListing.price)
      : 0;

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <img src={MARKET_IMAGE} alt="Fresh vegetables" style={styles.heroImage} />
          <div style={styles.heroOverlay} />

          <div style={styles.heroContent}>
            <p className="mono" style={styles.eyebrow}>
              FARMVERSE MARKETPLACE
            </p>

            <h1 style={styles.title}>Buy fresh produce from local farmers.</h1>

            <p style={styles.subtitle}>
              Browse crop listings added by farmers. Search by crop, location,
              price, and available quantity.
            </p>

            <div style={styles.heroButtons}>
              <Link to="/buyer-orders" style={styles.primaryBtn}>
                My orders →
              </Link>

              <button style={styles.secondaryBtn} onClick={loadListings}>
                Refresh listings
              </button>
            </div>
          </div>

          <div style={styles.heroStats}>
            <div>
              <span>AVAILABLE LISTINGS</span>
              <strong>{listings.length}</strong>
            </div>
            <div>
              <span>SHOWING</span>
              <strong>{filteredListings.length}</strong>
            </div>
          </div>
        </section>

        {message && <p style={styles.message}>{message}</p>}

        <section style={styles.filters}>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search crop e.g. tomato"
            style={styles.input}
          />

          <input
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="Filter location"
            style={styles.input}
          />

          <input
            type="number"
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
            placeholder="Max price"
            style={styles.input}
          />

          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            style={styles.input}
          >
            <option value="latest">Latest</option>
            <option value="price_low">Price: Low to high</option>
            <option value="price_high">Price: High to low</option>
            <option value="quantity_high">Quantity: High first</option>
          </select>
        </section>

        {filteredListings.length === 0 ? (
          <section style={styles.empty}>
            <span style={styles.emptyIcon}>▣</span>
            <h2>No produce listings found.</h2>
            <p>
              Ask a farmer to add produce listings from their profile. Listings
              will appear here for buyers.
            </p>
          </section>
        ) : (
          <section style={styles.grid}>
            {filteredListings.map((listing) => (
              <article key={`${listing.farmerId}-${listing.id}`} style={styles.card}>
                <div style={styles.cardTop}>
                  <div style={styles.cropAvatar}>
                    {listing.cropName?.charAt(0)?.toUpperCase() || "C"}
                  </div>

                  <div>
                    <h2 style={styles.cropName}>{listing.cropName}</h2>
                    <p style={styles.farmerName}>
                      By {listing.farmerName || "Farmer"}
                    </p>
                  </div>

                  <span style={styles.badge}>Fresh</span>
                </div>

                <div style={styles.details}>
                  <div>
                    <span>Available</span>
                    <strong>
                      {listing.quantity} {listing.unit}
                    </strong>
                  </div>

                  <div>
                    <span>Price</span>
                    <strong>
                      ₹{listing.price}/{listing.unit}
                    </strong>
                  </div>
                </div>

                <div style={styles.locationBox}>
                  <span>📍</span>
                  <p>
                    <strong>{listing.farmName}</strong>
                    <br />
                    {listing.location}
                  </p>
                </div>

                <div style={styles.cardFooter}>
                  <button style={styles.requestBtn} onClick={() => openOrder(listing)}>
                    Request order
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}

        {selectedListing && (
          <div style={styles.modalBackdrop}>
            <div style={styles.modal}>
              <div style={styles.modalHeader}>
                <div>
                  <p className="mono" style={styles.modalEyebrow}>
                    ORDER REQUEST
                  </p>
                  <h2 style={styles.modalTitle}>{selectedListing.cropName}</h2>
                </div>

                <button style={styles.closeBtn} onClick={closeOrder}>
                  ✕
                </button>
              </div>

              <div style={styles.orderSummary}>
                <p>
                  Farmer: <strong>{selectedListing.farmerName}</strong>
                </p>
                <p>
                  Available:{" "}
                  <strong>
                    {selectedListing.quantity} {selectedListing.unit}
                  </strong>
                </p>
                <p>
                  Price:{" "}
                  <strong>
                    ₹{selectedListing.price}/{selectedListing.unit}
                  </strong>
                </p>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Quantity *</label>
                <input
                  type="number"
                  min="1"
                  max={selectedListing.quantity}
                  name="quantity"
                  value={orderData.quantity}
                  onChange={handleOrderChange}
                  placeholder="Example: 20"
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Delivery address</label>
                <textarea
                  name="deliveryAddress"
                  value={orderData.deliveryAddress}
                  onChange={handleOrderChange}
                  placeholder="Enter your address or pickup details"
                  style={styles.textarea}
                  rows="3"
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Buyer note</label>
                <textarea
                  name="buyerNote"
                  value={orderData.buyerNote}
                  onChange={handleOrderChange}
                  placeholder="Example: Need fresh harvest tomorrow"
                  style={styles.textarea}
                  rows="3"
                />
              </div>

              <div style={styles.totalBox}>
                <span>Total price</span>
                <strong>₹{totalPrice || 0}</strong>
              </div>

              <button style={styles.confirmBtn} onClick={handleCreateOrder}>
                Send order request →
              </button>
            </div>
          </div>
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
    maxWidth: "1180px",
    margin: "0 auto",
  },
  hero: {
    minHeight: "270px",
    position: "relative",
    overflow: "hidden",
    borderRadius: "6px",
    border: "1px solid rgba(201,162,39,0.24)",
    display: "flex",
    alignItems: "center",
    marginBottom: "22px",
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
      "linear-gradient(90deg, rgba(11,10,8,0.96), rgba(11,10,8,0.72), rgba(11,10,8,0.25))",
  },
  heroContent: {
    position: "relative",
    zIndex: 1,
    maxWidth: "680px",
    padding: "35px",
  },
  eyebrow: {
    color: "#d9b538",
    fontSize: "0.69rem",
    letterSpacing: "0.14em",
    marginBottom: "10px",
  },
  title: {
    color: "#f3ede0",
    fontSize: "2.1rem",
    fontWeight: 500,
    margin: 0,
  },
  subtitle: {
    color: "#c9c0b2",
    lineHeight: 1.6,
    marginTop: "10px",
  },
  heroButtons: {
    display: "flex",
    gap: "10px",
    marginTop: "22px",
  },
  primaryBtn: {
    background: "#c9a227",
    color: "#0b0a08",
    textDecoration: "none",
    border: "none",
    borderRadius: "3px",
    padding: "11px 15px",
    fontWeight: 700,
    cursor: "pointer",
  },
  secondaryBtn: {
    background: "transparent",
    color: "#f3ede0",
    border: "1px solid rgba(243,237,224,0.32)",
    borderRadius: "3px",
    padding: "11px 15px",
    cursor: "pointer",
  },
  heroStats: {
    position: "absolute",
    right: "28px",
    bottom: "24px",
    zIndex: 2,
    display: "flex",
    gap: "10px",
    color: "#f3ede0",
  },
  message: {
    color: "#e3bc3f",
    background: "rgba(201,162,39,0.08)",
    border: "1px solid rgba(201,162,39,0.2)",
    padding: "10px",
    borderRadius: "3px",
  },
  filters: {
    display: "grid",
    gridTemplateColumns: "1.2fr 1fr 0.8fr 1fr",
    gap: "12px",
    background: "#1a1712",
    border: "1px solid rgba(201,162,39,0.2)",
    padding: "16px",
    borderRadius: "5px",
    marginBottom: "20px",
  },
  input: {
    width: "100%",
    background: "#12110e",
    color: "#f3ede0",
    border: "1px solid rgba(243,237,224,0.15)",
    borderRadius: "3px",
    padding: "10px",
    outline: "none",
    fontFamily: "inherit",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))",
    gap: "16px",
  },
  card: {
    background: "#1a1712",
    border: "1px solid rgba(201,162,39,0.2)",
    borderLeft: "3px solid rgba(201,162,39,0.65)",
    borderRadius: "5px",
    padding: "20px",
  },
  cardTop: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  cropAvatar: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    background: "rgba(201,162,39,0.13)",
    color: "#e3bc3f",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Fraunces', serif",
    fontSize: "1.25rem",
  },
  cropName: {
    color: "#f3ede0",
    fontSize: "1.16rem",
    margin: 0,
    textTransform: "capitalize",
  },
  farmerName: {
    color: "#8f877b",
    fontSize: "0.76rem",
    margin: "4px 0 0",
  },
  badge: {
    marginLeft: "auto",
    color: "#e3bc3f",
    border: "1px solid rgba(201,162,39,0.35)",
    borderRadius: "14px",
    padding: "4px 8px",
    fontSize: "0.68rem",
  },
  details: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    marginTop: "18px",
  },
  locationBox: {
    display: "flex",
    gap: "9px",
    color: "#a8a094",
    background: "#151310",
    padding: "11px",
    marginTop: "15px",
    border: "1px solid rgba(243,237,224,0.08)",
    fontSize: "0.78rem",
    lineHeight: 1.5,
  },
  cardFooter: {
    marginTop: "18px",
  },
  requestBtn: {
    width: "100%",
    background: "#c9a227",
    color: "#0b0a08",
    border: "none",
    padding: "11px",
    borderRadius: "3px",
    fontWeight: 700,
    cursor: "pointer",
  },
  empty: {
    background: "#1a1712",
    border: "1px solid rgba(201,162,39,0.2)",
    color: "#a8a094",
    textAlign: "center",
    padding: "70px 20px",
    borderRadius: "5px",
  },
  emptyIcon: {
    display: "block",
    color: "#7c5432",
    fontSize: "2.4rem",
    marginBottom: "10px",
  },
  modalBackdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.72)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
    padding: "20px",
  },
  modal: {
    width: "100%",
    maxWidth: "480px",
    background: "#1a1712",
    border: "1px solid rgba(201,162,39,0.25)",
    borderRadius: "6px",
    padding: "24px",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "15px",
  },
  modalEyebrow: {
    color: "#7c5432",
    fontSize: "0.66rem",
    letterSpacing: "0.1em",
  },
  modalTitle: {
    color: "#f3ede0",
    margin: "4px 0 0",
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    color: "#e07a4f",
    cursor: "pointer",
    fontSize: "1rem",
  },
  orderSummary: {
    color: "#a8a094",
    background: "#151310",
    border: "1px solid rgba(243,237,224,0.08)",
    padding: "12px",
    borderRadius: "4px",
    marginTop: "15px",
    fontSize: "0.82rem",
  },
  field: {
    marginTop: "15px",
  },
  label: {
    display: "block",
    color: "#a8a094",
    fontSize: "0.78rem",
    marginBottom: "6px",
  },
  textarea: {
    width: "100%",
    background: "#12110e",
    color: "#f3ede0",
    border: "1px solid rgba(243,237,224,0.15)",
    borderRadius: "3px",
    padding: "10px",
    outline: "none",
    resize: "vertical",
    fontFamily: "inherit",
  },
  totalBox: {
    display: "flex",
    justifyContent: "space-between",
    color: "#f3ede0",
    background: "rgba(201,162,39,0.08)",
    border: "1px solid rgba(201,162,39,0.2)",
    padding: "12px",
    borderRadius: "4px",
    marginTop: "16px",
  },
  confirmBtn: {
    width: "100%",
    background: "#c9a227",
    color: "#0b0a08",
    border: "none",
    padding: "12px",
    borderRadius: "3px",
    cursor: "pointer",
    fontWeight: 700,
    marginTop: "18px",
  },
};

export default Marketplace;