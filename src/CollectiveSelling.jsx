import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { createCollectiveBuyerOrder, getCollectiveLots } from "./api.js";

const buildFarmerDetails = (lot) => {
  if (!lot) return [];

  const grouped = {};

  if (Array.isArray(lot.listings)) {
    lot.listings.forEach((listing) => {
      const key = String(listing.farmerId || listing.farmerName || Date.now());

      if (!grouped[key]) {
        grouped[key] = {
          farmerId: listing.farmerId,
          farmerName: listing.farmerName || "Farmer",
          farmName: listing.farmName || "Farm not added",
          location: listing.location || "Location not added",
          quantity: 0,
          unit: listing.unit || lot.unit || "kg",
          totalValue: 0,
          minPrice: Number(listing.price || 0),
          maxPrice: Number(listing.price || 0),
          listingCount: 0,
        };
      }

      const quantity = Number(listing.quantity || 0);
      const price = Number(listing.price || 0);

      grouped[key].quantity += quantity;
      grouped[key].totalValue += quantity * price;
      grouped[key].minPrice = Math.min(grouped[key].minPrice, price);
      grouped[key].maxPrice = Math.max(grouped[key].maxPrice, price);
      grouped[key].listingCount += 1;
    });

    return Object.values(grouped)
      .map((farmer) => ({
        ...farmer,
        averagePrice:
          farmer.quantity > 0
            ? Math.round((farmer.totalValue / farmer.quantity) * 100) / 100
            : 0,
      }))
      .sort((a, b) => Number(b.quantity) - Number(a.quantity));
  }

  if (Array.isArray(lot.farmers)) {
    return lot.farmers.map((farmer, index) => ({
      farmerId: farmer.farmerId || index,
      farmerName: farmer.farmerName || `Farmer ${index + 1}`,
      farmName: farmer.farmName || "Farm not added",
      location: farmer.location || "Location not added",
      quantity: 0,
      unit: lot.unit || "kg",
      averagePrice: lot.averagePrice || 0,
      minPrice: lot.minPrice || 0,
      maxPrice: lot.maxPrice || 0,
      listingCount: 1,
    }));
  }

  return [];
};

const FarmerDragStrip = ({ farmers }) => {
  const stripRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  const handlePointerDown = (event) => {
    if (!stripRef.current) return;

    isDraggingRef.current = true;
    setIsDragging(true);

    startXRef.current = event.clientX;
    scrollLeftRef.current = stripRef.current.scrollLeft;

    stripRef.current.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!isDraggingRef.current || !stripRef.current) return;

    const distance = event.clientX - startXRef.current;
    stripRef.current.scrollLeft = scrollLeftRef.current - distance;
  };

  const stopDragging = (event) => {
    isDraggingRef.current = false;
    setIsDragging(false);

    stripRef.current?.releasePointerCapture?.(event.pointerId);
  };

  if (!farmers || farmers.length === 0) {
    return <p style={styles.noFarmersText}>No farmer details available.</p>;
  }

  return (
    <div>
      <div style={styles.dragHint}>
        <span>← Drag to view all farmers →</span>
      </div>

      <div
        ref={stripRef}
        style={{
          ...styles.farmerStrip,
          cursor: isDragging ? "grabbing" : "grab",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
        onPointerLeave={stopDragging}
      >
        {farmers.map((farmer, index) => (
          <article
            key={`${farmer.farmerId || index}-${farmer.farmerName}`}
            style={styles.farmerCard}
          >
            <div style={styles.farmerAvatar}>
              {farmer.farmerName?.charAt(0)?.toUpperCase() || "F"}
            </div>

            <div style={styles.farmerCardContent}>
              <strong style={styles.farmerName}>
                {farmer.farmerName || `Farmer ${index + 1}`}
              </strong>

              <span style={styles.farmerFarmName}>
                {farmer.farmName || "Farm not added"}
              </span>

              <span style={styles.farmerLocation}>
                📍 {farmer.location || "Location not added"}
              </span>

              {Number(farmer.quantity || 0) > 0 && (
                <div style={styles.farmerStats}>
                  <span>
                    {farmer.quantity} {farmer.unit}
                  </span>
                  <span>₹{farmer.averagePrice}/{farmer.unit}</span>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

const CollectiveSelling = ({ user }) => {
  const [lots, setLots] = useState([]);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [selectedLot, setSelectedLot] = useState(null);
  const [orderData, setOrderData] = useState({
    quantity: "",
    deliveryAddress: user?.address || "",
    buyerNote: "",
  });
  const [message, setMessage] = useState("");

  const loadLots = () => {
    setLots(getCollectiveLots());
  };

  useEffect(() => {
    loadLots();
  }, []);

  const filteredLots = useMemo(() => {
    return lots.filter((lot) => {
      const matchesCrop = lot.cropName
        .toLowerCase()
        .includes(search.trim().toLowerCase());

      const matchesLocation = lot.locationGroup
        .toLowerCase()
        .includes(location.trim().toLowerCase());

      return matchesCrop && matchesLocation;
    });
  }, [lots, search, location]);

  const selectedFarmerDetails = useMemo(() => {
    return selectedLot ? buildFarmerDetails(selectedLot) : [];
  }, [selectedLot]);

  const openOrder = (lot) => {
    setSelectedLot(lot);
    setMessage("");
    setOrderData({
      quantity: "",
      deliveryAddress: user?.address || "",
      buyerNote: "",
    });
  };

  const closeOrder = () => {
    setSelectedLot(null);
  };

  const handleOrderChange = (event) => {
    setOrderData({
      ...orderData,
      [event.target.name]: event.target.value,
    });
  };

  const handleCreateCollectiveOrder = () => {
    try {
      const result = createCollectiveBuyerOrder(user.id, {
        lot: selectedLot,
        quantity: orderData.quantity,
        deliveryAddress: orderData.deliveryAddress,
        buyerNote: orderData.buyerNote,
      });

      setMessage(
        `Collective order request created for ${result.totalQuantity} ${selectedLot.unit}.`
      );

      closeOrder();
    } catch (err) {
      setMessage(err.message || "Could not create collective order.");
    }
  };

  const totalPriceEstimate =
    selectedLot && orderData.quantity
      ? Number(orderData.quantity) * Number(selectedLot.averagePrice || 0)
      : 0;

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <div>
            <p className="mono" style={styles.eyebrow}>
              COLLECTIVE SELLING
            </p>

            <h1 style={styles.title}>
              Grouped harvest lots from nearby farmers.
            </h1>

            <p style={styles.subtitle}>
              Similar produce from nearby farmers is combined into one larger
              lot. This helps bulk buyers purchase bigger quantities and helps
              farmers sell together.
            </p>

            <div style={styles.heroActions}>
              <button style={styles.secondaryBtn} onClick={loadLots}>
                Refresh lots
              </button>

              {user?.role === "user" && (
                <Link to="/buyer-orders" style={styles.primaryBtn}>
                  My orders →
                </Link>
              )}
            </div>
          </div>

          <div style={styles.heroStats}>
            <div>
              <span>COLLECTIVE LOTS</span>
              <strong>{lots.length}</strong>
            </div>

            <div>
              <span>SHOWING</span>
              <strong>{filteredLots.length}</strong>
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
            placeholder="Search location"
            style={styles.input}
          />
        </section>

        {filteredLots.length === 0 ? (
          <section style={styles.empty}>
            <span style={styles.emptyIcon}>📦</span>

            <h2>No collective lots yet.</h2>

            <p>
              When farmers create produce listings for the same crop and nearby
              location, Farmverse will group them here.
            </p>

            {user?.role === "farmer" && (
              <Link to="/profile" style={styles.primaryBtn}>
                Add produce listing →
              </Link>
            )}
          </section>
        ) : (
          <section style={styles.grid}>
            {filteredLots.map((lot) => {
              const farmerDetails = buildFarmerDetails(lot);

              return (
                <article key={lot.id} style={styles.card}>
                  <div style={styles.cardTop}>
                    <div style={styles.lotIcon}>📦</div>

                    <div>
                      <h2 style={styles.cropName}>{lot.cropName}</h2>
                      <p style={styles.location}>📍 {lot.locationGroup}</p>
                    </div>

                    <span style={styles.badge}>
                      {lot.farmerCount} farmers
                    </span>
                  </div>

                  <div style={styles.summaryGrid}>
                    <div>
                      <span>Total quantity</span>
                      <strong>
                        {lot.totalQuantity} {lot.unit}
                      </strong>
                    </div>

                    <div>
                      <span>Avg. price</span>
                      <strong>
                        ₹{lot.averagePrice}/{lot.unit}
                      </strong>
                    </div>

                    <div>
                      <span>Price range</span>
                      <strong>
                        ₹{lot.minPrice}–₹{lot.maxPrice}
                      </strong>
                    </div>
                  </div>

                  <div style={styles.farmerBox}>
                    <div style={styles.farmerBoxHeader}>
                      <p className="mono" style={styles.boxTitle}>
                        PARTICIPATING FARMERS
                      </p>

                      <span style={styles.farmerCountText}>
                        {farmerDetails.length} shown
                      </span>
                    </div>

                    <FarmerDragStrip farmers={farmerDetails} />
                  </div>

                  <div style={styles.cardFooter}>
                    {user?.role === "user" ? (
                      <button
                        style={styles.primaryBtn}
                        onClick={() => openOrder(lot)}
                      >
                        Request collective order
                      </button>
                    ) : (
                      <Link to="/profile" style={styles.secondaryLink}>
                        Add your produce →
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        )}

        {selectedLot && (
          <div style={styles.modalBackdrop}>
            <div style={styles.modal}>
              <div style={styles.modalHeader}>
                <div>
                  <p className="mono" style={styles.modalEyebrow}>
                    COLLECTIVE ORDER REQUEST
                  </p>

                  <h2 style={styles.modalTitle}>{selectedLot.cropName}</h2>
                </div>

                <button style={styles.closeBtn} onClick={closeOrder}>
                  ✕
                </button>
              </div>

              <div style={styles.orderSummary}>
                <p>
                  Available:{" "}
                  <strong>
                    {selectedLot.totalQuantity} {selectedLot.unit}
                  </strong>
                </p>

                <p>
                  Farmers: <strong>{selectedLot.farmerCount}</strong>
                </p>

                <p>
                  Estimated average price:{" "}
                  <strong>
                    ₹{selectedLot.averagePrice}/{selectedLot.unit}
                  </strong>
                </p>
              </div>

              <div style={styles.modalFarmerBox}>
                <p className="mono" style={styles.boxTitle}>
                  FARMERS IN THIS LOT
                </p>

                <FarmerDragStrip farmers={selectedFarmerDetails} />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Required quantity *</label>

                <input
                  type="number"
                  name="quantity"
                  min="1"
                  max={selectedLot.totalQuantity}
                  value={orderData.quantity}
                  onChange={handleOrderChange}
                  placeholder="Example: 1000"
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Delivery / pickup address</label>

                <textarea
                  name="deliveryAddress"
                  value={orderData.deliveryAddress}
                  onChange={handleOrderChange}
                  placeholder="Enter delivery address or pickup details"
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
                  placeholder="Example: Need weekly supply for restaurant"
                  style={styles.textarea}
                  rows="3"
                />
              </div>

              <div style={styles.totalBox}>
                <span>Estimated total</span>
                <strong>₹{Math.round(totalPriceEstimate || 0)}</strong>
              </div>

              <button
                style={styles.confirmBtn}
                onClick={handleCreateCollectiveOrder}
              >
                Send collective order request →
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
    display: "flex",
    justifyContent: "space-between",
    gap: "24px",
    background:
      "linear-gradient(135deg, rgba(61,51,27,0.55), rgba(26,23,18,1) 70%)",
    border: "1px solid rgba(201,162,39,0.25)",
    borderRadius: "6px",
    padding: "34px",
    marginBottom: "20px",
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
    margin: 0,
  },
  subtitle: {
    color: "#c9c0b2",
    lineHeight: 1.6,
    maxWidth: "680px",
    marginTop: "10px",
  },
  heroActions: {
    display: "flex",
    gap: "10px",
    marginTop: "20px",
  },
  heroStats: {
    display: "flex",
    gap: "12px",
    alignItems: "flex-end",
    color: "#f3ede0",
  },
  filters: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
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
    gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
    gap: "16px",
  },
  card: {
    background: "#1a1712",
    border: "1px solid rgba(201,162,39,0.2)",
    borderLeft: "3px solid rgba(201,162,39,0.7)",
    borderRadius: "5px",
    padding: "20px",
    overflow: "hidden",
  },
  cardTop: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  lotIcon: {
    width: "44px",
    minWidth: "44px",
    height: "44px",
    borderRadius: "50%",
    background: "rgba(201,162,39,0.12)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  cropName: {
    color: "#f3ede0",
    fontSize: "1.15rem",
    margin: 0,
    textTransform: "capitalize",
  },
  location: {
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
    whiteSpace: "nowrap",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "10px",
    marginTop: "18px",
    color: "#a8a094",
    fontSize: "0.76rem",
  },
  farmerBox: {
    background: "#151310",
    border: "1px solid rgba(243,237,224,0.08)",
    padding: "12px",
    borderRadius: "4px",
    marginTop: "16px",
    overflow: "hidden",
  },
  farmerBoxHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    alignItems: "center",
  },
  boxTitle: {
    color: "#7c5432",
    fontSize: "0.64rem",
    letterSpacing: "0.09em",
    marginBottom: "8px",
  },
  farmerCountText: {
    color: "#8f877b",
    fontSize: "0.7rem",
  },
  dragHint: {
    color: "#8f877b",
    fontSize: "0.68rem",
    marginBottom: "8px",
  },
  farmerStrip: {
    display: "flex",
    gap: "10px",
    overflowX: "auto",
    overflowY: "hidden",
    scrollBehavior: "smooth",
    paddingBottom: "8px",
    userSelect: "none",
    scrollbarWidth: "thin",
  },
  farmerCard: {
    minWidth: "230px",
    maxWidth: "230px",
    display: "flex",
    gap: "10px",
    background: "#10100d",
    border: "1px solid rgba(201,162,39,0.16)",
    borderRadius: "5px",
    padding: "11px",
  },
  farmerAvatar: {
    minWidth: "34px",
    height: "34px",
    borderRadius: "50%",
    background: "#c9a227",
    color: "#0b0a08",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
  },
  farmerCardContent: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    minWidth: 0,
  },
  farmerName: {
    color: "#f3ede0",
    fontSize: "0.84rem",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  farmerFarmName: {
    color: "#cfc8b8",
    fontSize: "0.72rem",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  farmerLocation: {
    color: "#8f877b",
    fontSize: "0.7rem",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  farmerStats: {
    display: "flex",
    justifyContent: "space-between",
    gap: "8px",
    color: "#e3bc3f",
    fontSize: "0.7rem",
    marginTop: "4px",
  },
  noFarmersText: {
    color: "#8f877b",
    fontSize: "0.76rem",
  },
  cardFooter: {
    marginTop: "18px",
  },
  primaryBtn: {
    display: "inline-block",
    background: "#c9a227",
    color: "#0b0a08",
    border: "none",
    textDecoration: "none",
    borderRadius: "3px",
    padding: "10px 14px",
    cursor: "pointer",
    fontWeight: 700,
  },
  secondaryBtn: {
    background: "transparent",
    color: "#f3ede0",
    border: "1px solid rgba(243,237,224,0.3)",
    borderRadius: "3px",
    padding: "10px 14px",
    cursor: "pointer",
  },
  secondaryLink: {
    color: "#e3bc3f",
    textDecoration: "none",
    fontSize: "0.82rem",
  },
  message: {
    color: "#e3bc3f",
    background: "rgba(201,162,39,0.08)",
    border: "1px solid rgba(201,162,39,0.2)",
    padding: "10px",
    borderRadius: "3px",
  },
  empty: {
    background: "#1a1712",
    border: "1px solid rgba(201,162,39,0.2)",
    color: "#a8a094",
    textAlign: "center",
    padding: "70px 20px",
    borderRadius: "5px",
    lineHeight: 1.6,
  },
  emptyIcon: {
    display: "block",
    fontSize: "2.5rem",
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
    maxWidth: "560px",
    maxHeight: "90vh",
    overflowY: "auto",
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
  modalFarmerBox: {
    background: "#151310",
    border: "1px solid rgba(243,237,224,0.08)",
    padding: "12px",
    borderRadius: "4px",
    marginTop: "15px",
    overflow: "hidden",
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

export default CollectiveSelling;