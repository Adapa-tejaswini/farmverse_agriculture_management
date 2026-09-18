import React, { useEffect, useMemo, useState } from "react";
import {
  addVehiclePost,
  closeVehiclePost,
  deleteVehiclePost,
  getAllVehiclePosts,
} from "./api.js";

const initialPost = {
  postType: "Need Vehicle",
  vehicleType: "",
  cropName: "",
  quantity: "",
  unit: "kg",
  fromLocation: "",
  toLocation: "",
  date: "",
  contactPhone: "",
  notes: "",
};

const VehicleSharing = ({ user }) => {
  const [posts, setPosts] = useState([]);
  const [formData, setFormData] = useState(initialPost);
  const [filter, setFilter] = useState("all");
  const [message, setMessage] = useState("");

  const loadPosts = () => {
    setPosts(getAllVehiclePosts());
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const filteredPosts = useMemo(() => {
    if (filter === "all") return posts;
    return posts.filter((post) => post.postType === filter);
  }, [posts, filter]);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setMessage("");

    try {
      addVehiclePost(user.id, formData);
      setFormData(initialPost);
      loadPosts();
      setMessage("Vehicle sharing post added successfully.");
    } catch (err) {
      setMessage(err.message || "Could not add vehicle post.");
    }
  };

  const handleDelete = (postId) => {
    if (!window.confirm("Delete this vehicle post?")) return;

    deleteVehiclePost(user.id, postId);
    loadPosts();
    setMessage("Vehicle post deleted.");
  };

  const handleClose = (postId) => {
    closeVehiclePost(user.id, postId);
    loadPosts();
    setMessage("Vehicle post closed.");
  };

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <div>
            <p className="mono" style={styles.eyebrow}>
              VEHICLE SHARING
            </p>

            <h1 style={styles.title}>Share transport for farm produce.</h1>

            <p style={styles.subtitle}>
              Farmers can post vehicle needs or available vehicles. This helps
              reduce transport cost and improve harvest movement.
            </p>
          </div>

          <div style={styles.heroStats}>
            <div>
              <span>ACTIVE POSTS</span>
              <strong>{posts.length}</strong>
            </div>
          </div>
        </section>

        {message && <p style={styles.message}>{message}</p>}

        <div style={styles.layout}>
          <section style={styles.formCard}>
            <p className="mono" style={styles.cardEyebrow}>
              NEW VEHICLE POST
            </p>

            <h2 style={styles.sectionTitle}>Create transport request</h2>

            <form onSubmit={handleSubmit}>
              <div style={styles.field}>
                <label style={styles.label}>Post type</label>

                <select
                  name="postType"
                  value={formData.postType}
                  onChange={handleChange}
                  style={styles.input}
                >
                  <option value="Need Vehicle">Need Vehicle</option>
                  <option value="Vehicle Available">Vehicle Available</option>
                </select>
              </div>

              <div style={styles.twoColumn}>
                <Field
                  label="Vehicle type *"
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleChange}
                  placeholder="Mini truck, tractor trolley"
                />

                <Field
                  label="Date *"
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                />
              </div>

              <div style={styles.twoColumn}>
                <Field
                  label="Crop name"
                  name="cropName"
                  value={formData.cropName}
                  onChange={handleChange}
                  placeholder="Tomato"
                />

                <div style={styles.twoColumnSmall}>
                  <Field
                    label="Quantity"
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    placeholder="500"
                  />

                  <div style={styles.field}>
                    <label style={styles.label}>Unit</label>
                    <select
                      name="unit"
                      value={formData.unit}
                      onChange={handleChange}
                      style={styles.input}
                    >
                      <option value="kg">kg</option>
                      <option value="quintal">quintal</option>
                      <option value="tons">tons</option>
                    </select>
                  </div>
                </div>
              </div>

              <Field
                label="From location *"
                name="fromLocation"
                value={formData.fromLocation}
                onChange={handleChange}
                placeholder="Village / pickup location"
              />

              <Field
                label="To location"
                name="toLocation"
                value={formData.toLocation}
                onChange={handleChange}
                placeholder="Market / buyer location"
              />

              <Field
                label="Contact phone"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
                placeholder={user?.phone || "Phone number"}
              />

              <div style={styles.field}>
                <label style={styles.label}>Notes</label>

                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Example: Need vehicle tomorrow morning for tomato harvest."
                  style={styles.textarea}
                  rows="3"
                />
              </div>

              <button style={styles.primaryBtn} type="submit">
                Add vehicle post →
              </button>
            </form>
          </section>

          <section style={styles.listCard}>
            <div style={styles.listHeader}>
              <div>
                <p className="mono" style={styles.cardEyebrow}>
                  TRANSPORT POSTS
                </p>

                <h2 style={styles.sectionTitle}>Vehicle sharing board</h2>
              </div>

              <select
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                style={styles.filterSelect}
              >
                <option value="all">All posts</option>
                <option value="Need Vehicle">Need Vehicle</option>
                <option value="Vehicle Available">Vehicle Available</option>
              </select>
            </div>

            {filteredPosts.length === 0 ? (
              <div style={styles.empty}>
                <span style={styles.emptyIcon}>🚛</span>
                <h3>No vehicle posts yet.</h3>
                <p>Create a request or availability post.</p>
              </div>
            ) : (
              <div style={styles.posts}>
                {filteredPosts.map((post) => {
                  const isOwner = String(post.ownerId) === String(user.id);

                  return (
                    <article key={`${post.ownerId}-${post.id}`} style={styles.postCard}>
                      <div style={styles.postTop}>
                        <span
                          style={
                            post.postType === "Need Vehicle"
                              ? styles.needBadge
                              : styles.availableBadge
                          }
                        >
                          {post.postType}
                        </span>

                        <span style={styles.dateBadge}>
                          {new Date(post.date).toLocaleDateString("en-IN")}
                        </span>
                      </div>

                      <h3 style={styles.vehicleTitle}>{post.vehicleType}</h3>

                      <p style={styles.ownerText}>
                        Posted by {post.ownerName || "Farmer"}
                      </p>

                      <div style={styles.infoGrid}>
                        <Info label="Crop" value={post.cropName || "Not specified"} />
                        <Info
                          label="Quantity"
                          value={
                            post.quantity
                              ? `${post.quantity} ${post.unit}`
                              : "Not specified"
                          }
                        />
                        <Info label="From" value={post.fromLocation} />
                        <Info label="To" value={post.toLocation || "Not specified"} />
                      </div>

                      {post.notes && <p style={styles.notes}>{post.notes}</p>}

                      {post.contactPhone && (
                        <p style={styles.contact}>☎ {post.contactPhone}</p>
                      )}

                      {isOwner && (
                        <div style={styles.postActions}>
                          <button
                            style={styles.closePostBtn}
                            onClick={() => handleClose(post.id)}
                          >
                            Close
                          </button>

                          <button
                            style={styles.deletePostBtn}
                            onClick={() => handleDelete(post.id)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
};

const Field = ({ label, name, value, onChange, placeholder, type = "text" }) => (
  <div style={styles.field}>
    <label style={styles.label}>{label}</label>

    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={styles.input}
    />
  </div>
);

const Info = ({ label, value }) => (
  <div style={styles.infoBox}>
    <span>{label}</span>
    <strong>{value}</strong>
  </div>
);

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
    maxWidth: "660px",
    marginTop: "10px",
  },
  heroStats: {
    color: "#f3ede0",
  },
  message: {
    color: "#e3bc3f",
    background: "rgba(201,162,39,0.08)",
    border: "1px solid rgba(201,162,39,0.2)",
    padding: "10px",
    borderRadius: "3px",
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "0.9fr 1.1fr",
    gap: "20px",
  },
  formCard: {
    background: "#1a1712",
    border: "1px solid rgba(201,162,39,0.2)",
    borderRadius: "5px",
    padding: "28px",
  },
  listCard: {
    background: "#1a1712",
    border: "1px solid rgba(201,162,39,0.2)",
    borderRadius: "5px",
    padding: "28px",
  },
  cardEyebrow: {
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
  field: {
    marginTop: "15px",
  },
  label: {
    display: "block",
    color: "#a8a094",
    fontSize: "0.78rem",
    marginBottom: "6px",
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
  twoColumn: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  twoColumnSmall: {
    display: "grid",
    gridTemplateColumns: "1fr 0.8fr",
    gap: "8px",
  },
  primaryBtn: {
    marginTop: "22px",
    background: "#c9a227",
    color: "#0b0a08",
    border: "none",
    borderRadius: "3px",
    padding: "11px 15px",
    fontWeight: 700,
    cursor: "pointer",
  },
  listHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "15px",
    alignItems: "flex-start",
  },
  filterSelect: {
    background: "#12110e",
    color: "#e3bc3f",
    border: "1px solid rgba(201,162,39,0.35)",
    borderRadius: "3px",
    padding: "8px",
  },
  empty: {
    color: "#a8a094",
    textAlign: "center",
    padding: "70px 20px",
  },
  emptyIcon: {
    fontSize: "2.5rem",
  },
  posts: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginTop: "20px",
  },
  postCard: {
    background: "#151310",
    border: "1px solid rgba(243,237,224,0.1)",
    borderLeft: "3px solid rgba(201,162,39,0.65)",
    borderRadius: "4px",
    padding: "17px",
  },
  postTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
  },
  needBadge: {
    color: "#ffc1a6",
    border: "1px solid rgba(224,122,79,0.35)",
    borderRadius: "14px",
    padding: "4px 8px",
    fontSize: "0.68rem",
  },
  availableBadge: {
    color: "#e3bc3f",
    border: "1px solid rgba(201,162,39,0.35)",
    borderRadius: "14px",
    padding: "4px 8px",
    fontSize: "0.68rem",
  },
  dateBadge: {
    color: "#8f877b",
    fontSize: "0.72rem",
  },
  vehicleTitle: {
    color: "#f3ede0",
    fontSize: "1.08rem",
    margin: "14px 0 0",
  },
  ownerText: {
    color: "#8f877b",
    fontSize: "0.75rem",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "8px",
    marginTop: "14px",
  },
  infoBox: {
    background: "rgba(201,162,39,0.05)",
    padding: "9px",
    color: "#a8a094",
    fontSize: "0.72rem",
  },
  notes: {
    color: "#cfc8b8",
    background: "#12110e",
    border: "1px solid rgba(243,237,224,0.08)",
    padding: "10px",
    marginTop: "12px",
    fontSize: "0.78rem",
    lineHeight: 1.5,
  },
  contact: {
    color: "#e3bc3f",
    fontSize: "0.78rem",
    marginTop: "10px",
  },
  postActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "8px",
    marginTop: "14px",
  },
  closePostBtn: {
    background: "transparent",
    color: "#e3bc3f",
    border: "1px solid rgba(201,162,39,0.4)",
    padding: "7px 10px",
    borderRadius: "3px",
    cursor: "pointer",
  },
  deletePostBtn: {
    background: "transparent",
    color: "#e07a4f",
    border: "1px solid rgba(224,122,79,0.35)",
    padding: "7px 10px",
    borderRadius: "3px",
    cursor: "pointer",
  },
};

export default VehicleSharing;