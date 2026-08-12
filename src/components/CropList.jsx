import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function CropList() {
  const navigate = useNavigate();

  const [crops, setCrops] = useState([]);
  const [search, setSearch] = useState("");
  const [seasonFilter, setSeasonFilter] = useState("All");

  // Edit and View states
  const [editingCrop, setEditingCrop] = useState(null);
  const [viewingCrop, setViewingCrop] = useState(null);

  // Load crops from localStorage
  useEffect(() => {
    const savedCrops =
      JSON.parse(localStorage.getItem("crops")) || [];

    setCrops(savedCrops);
  }, []);

  // Delete crop
  const deleteCrop = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this crop?"
    );

    if (!confirmed) return;

    const updatedCrops = crops.filter(
      (crop) => crop.id !== id
    );

    localStorage.setItem(
      "crops",
      JSON.stringify(updatedCrops)
    );

    setCrops(updatedCrops);
  };

  // Start editing
  const startEdit = (crop) => {
    setEditingCrop({
      ...crop,
      harvestDate: crop.harvestDate || "",
      status: crop.status || "Growing",
    });
  };

  // Change edited crop
  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditingCrop((previousCrop) => ({
      ...previousCrop,
      [name]: value,
    }));
  };

  // Save edited crop
  const saveEdit = () => {
    if (!editingCrop) return;

    const updatedCrops = crops.map((crop) =>
      crop.id === editingCrop.id
        ? editingCrop
        : crop
    );

    localStorage.setItem(
      "crops",
      JSON.stringify(updatedCrops)
    );

    setCrops(updatedCrops);
    setEditingCrop(null);
  };

  // Search and filter
  const filteredCrops = crops.filter((crop) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      (crop.name || "")
        .toLowerCase()
        .includes(searchText) ||
      (crop.type || "")
        .toLowerCase()
        .includes(searchText) ||
      (crop.farm || "")
        .toLowerCase()
        .includes(searchText);

    const matchesSeason =
      seasonFilter === "All" ||
      crop.season === seasonFilter;

    return matchesSearch && matchesSeason;
  });

  return (
    <div className="dashboard crop-management-page">

      {/* ================================================= */}
      {/* ================= HEADER ======================== */}
      {/* ================================================= */}

      <div
        className="crop-page-header"
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxSizing: "border-box",
          margin: "0 0 25px 0",
          padding: "0",
          gap: "20px",
        }}
      >
        {/* LEFT SIDE */}
        <div
          style={{
            flex: "1",
            minWidth: "0",
            display: "block",
            textAlign: "left",
          }}
        >
          <h1
            style={{
              margin: "0",
              padding: "0",
              fontSize: "32px",
              lineHeight: "1.2",
              fontWeight: "700",
              color: "#145c1c",
              textAlign: "left",
            }}
          >
            🌾 Crop Management
          </h1>

          <p
            style={{
              margin: "8px 0 0 0",
              padding: "0",
              fontSize: "15px",
              lineHeight: "1.5",
              color: "#6b7280",
              textAlign: "left",
            }}
          >
            View and manage your registered crops.
          </p>
        </div>

        {/* ADD CROP BUTTON */}
        <button
          className="save add-crop-button"
          onClick={() => navigate("/addcrop")}
          style={{
            flexShrink: 0,
            margin: "0",
            padding: "11px 20px",
            whiteSpace: "nowrap",
            background: "#2e7d32",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "15px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          + Add Crop
        </button>
      </div>

      {/* ================================================= */}
      {/* ================ SEARCH & FILTER ================ */}
      {/* ================================================= */}

      <div className="form-card crop-filter-card">

        <input
          type="text"
          placeholder="🔍 Search crop, type or farm..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="crop-search"
        />

        <select
          value={seasonFilter}
          onChange={(e) =>
            setSeasonFilter(e.target.value)
          }
          className="crop-season-filter"
        >
          <option value="All">
            All Seasons
          </option>

          <option value="Kharif">
            Kharif
          </option>

          <option value="Rabi">
            Rabi
          </option>

          <option value="Zaid">
            Zaid
          </option>
        </select>

      </div>

      {/* ================================================= */}
      {/* ================= NO CROPS ====================== */}
      {/* ================================================= */}

      {crops.length === 0 ? (

        <div className="form-card">

          <div
            style={{
              textAlign: "center",
              padding: "50px 20px",
            }}
          >
            <div
              style={{
                fontSize: "55px",
                marginBottom: "10px",
              }}
            >
              🌱
            </div>

            <h2>No crops added yet</h2>

            <p style={{ color: "#777" }}>
              Add your first crop to see it here.
            </p>

            <button
              className="save"
              onClick={() =>
                navigate("/addcrop")
              }
            >
              🌱 Add Your First Crop
            </button>
          </div>

        </div>

      ) : filteredCrops.length === 0 ? (

        /* ================================================= */
        /* ============== NO SEARCH RESULTS ================ */
        /* ================================================= */

        <div className="form-card">

          <div
            style={{
              textAlign: "center",
              padding: "50px 20px",
            }}
          >
            <div
              style={{
                fontSize: "50px",
                marginBottom: "10px",
              }}
            >
              🔍
            </div>

            <h2>No matching crops</h2>

            <p style={{ color: "#777" }}>
              Try another search or season.
            </p>
          </div>

        </div>

      ) : (

        /* ================================================= */
        /* ================= CROP TABLE ==================== */
        /* ================================================= */

        <div
          className="table-card"
          style={{
            overflowX: "auto",
          }}
        >

          <div className="crop-table-header">

            <div>
              <h2>My Crops</h2>

              <p>
                Manage all your registered crops
              </p>
            </div>

            <span className="crop-count">
              Showing{" "}
              <strong>
                {filteredCrops.length}
              </strong>{" "}
              of{" "}
              <strong>
                {crops.length}
              </strong>
            </span>

          </div>

          <table>

            <thead>
              <tr>
                <th>Crop Name</th>
                <th>Type</th>
                <th>Farm</th>
                <th>Area</th>
                <th>Season</th>
                <th>Planting Date</th>
                <th>Harvest Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {filteredCrops.map((crop) => (

                <tr key={crop.id}>

                  <td>
                    <strong>
                      🌱 {crop.name}
                    </strong>
                  </td>

                  <td>
                    {crop.type || "-"}
                  </td>

                  <td>
                    🚜 {crop.farm || "-"}
                  </td>

                  <td>
                    {crop.area || "-"} acres
                  </td>

                  <td>
                    {crop.season || "-"}
                  </td>

                  <td>
                    {crop.plantingDate || "-"}
                  </td>

                  <td>
                    {crop.harvestDate || "-"}
                  </td>

                  <td>
                    <span className="table-status">
                      {crop.status || "Growing"}
                    </span>
                  </td>

                  <td>

                    <div
                      style={{
                        display: "flex",
                        gap: "6px",
                        flexWrap: "wrap",
                      }}
                    >

                      {/* VIEW */}

                      <button
                        onClick={() =>
                          setViewingCrop(crop)
                        }
                        style={{
                          border: "none",
                          background: "#e8f5e9",
                          color: "#2e7d32",
                          padding: "7px 10px",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        👁️ View
                      </button>

                      {/* EDIT */}

                      <button
                        onClick={() =>
                          startEdit(crop)
                        }
                        style={{
                          border: "none",
                          background: "#e3f2fd",
                          color: "#1565c0",
                          padding: "7px 10px",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        ✏️ Edit
                      </button>

                      {/* DELETE */}

                      <button
                        onClick={() =>
                          deleteCrop(crop.id)
                        }
                        style={{
                          border: "none",
                          background: "#ffebee",
                          color: "#c62828",
                          padding: "7px 10px",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        🗑️ Delete
                      </button>

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

      {/* ================================================= */}
      {/* ================= EDIT MODAL ==================== */}
      {/* ================================================= */}

      {editingCrop && (

        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setEditingCrop(null);
            }
          }}
        >

          <div className="modal-box">

            <div className="modal-header">

              <div>
                <h2>✏️ Edit Crop</h2>

                <p>
                  Update crop information
                </p>
              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setEditingCrop(null)
                }
              >
                ✕
              </button>

            </div>

            <div className="form-grid">

              {/* Crop Name */}

              <div className="form-group">
                <label>Crop Name</label>

                <input
                  name="name"
                  value={
                    editingCrop.name || ""
                  }
                  onChange={handleEditChange}
                />
              </div>

              {/* Crop Type */}

              <div className="form-group">
                <label>Crop Type</label>

                <select
                  name="type"
                  value={
                    editingCrop.type || ""
                  }
                  onChange={handleEditChange}
                >
                  <option value="">
                    Select Crop
                  </option>

                  <option value="Rice">
                    Rice
                  </option>

                  <option value="Wheat">
                    Wheat
                  </option>

                  <option value="Tomato">
                    Tomato
                  </option>

                  <option value="Corn">
                    Corn
                  </option>

                  <option value="Potato">
                    Potato
                  </option>

                  <option value="Other">
                    Other
                  </option>
                </select>
              </div>

              {/* Farm */}

              <div className="form-group">
                <label>Farm</label>

                <input
                  name="farm"
                  value={
                    editingCrop.farm || ""
                  }
                  onChange={handleEditChange}
                />
              </div>

              {/* Area */}

              <div className="form-group">
                <label>Area (acres)</label>

                <input
                  type="number"
                  name="area"
                  min="0"
                  step="0.1"
                  value={
                    editingCrop.area || ""
                  }
                  onChange={handleEditChange}
                />
              </div>

              {/* Season */}

              <div className="form-group">
                <label>Season</label>

                <select
                  name="season"
                  value={
                    editingCrop.season || ""
                  }
                  onChange={handleEditChange}
                >
                  <option value="">
                    Select Season
                  </option>

                  <option value="Kharif">
                    Kharif
                  </option>

                  <option value="Rabi">
                    Rabi
                  </option>

                  <option value="Zaid">
                    Zaid
                  </option>
                </select>
              </div>

              {/* Planting Date */}

              <div className="form-group">
                <label>
                  Planting Date
                </label>

                <input
                  type="date"
                  name="plantingDate"
                  value={
                    editingCrop.plantingDate || ""
                  }
                  onChange={handleEditChange}
                />
              </div>

              {/* Expected Harvest Date */}

              <div className="form-group">
                <label>
                  Expected Harvest Date
                </label>

                <input
                  type="date"
                  name="harvestDate"
                  value={
                    editingCrop.harvestDate || ""
                  }
                  onChange={handleEditChange}
                />
              </div>

              {/* Status */}

              <div className="form-group">
                <label>Status</label>

                <select
                  name="status"
                  value={
                    editingCrop.status ||
                    "Growing"
                  }
                  onChange={handleEditChange}
                >
                  <option value="Planned">
                    Planned
                  </option>

                  <option value="Growing">
                    Growing
                  </option>

                  <option value="Ready for Harvest">
                    Ready for Harvest
                  </option>

                  <option value="Harvested">
                    Harvested
                  </option>
                </select>
              </div>

            </div>

            {/* Edit Buttons */}

            <div className="modal-buttons">

              <button
                className="cancel"
                onClick={() =>
                  setEditingCrop(null)
                }
              >
                Cancel
              </button>

              <button
                className="save"
                onClick={saveEdit}
              >
                💾 Save Changes
              </button>

            </div>

          </div>

        </div>

      )}
{/* ================= VIEW MODAL ================= */}

{viewingCrop && (

  <div
    className="modal-overlay"
    onClick={(e) => {
      if (e.target === e.currentTarget) {
        setViewingCrop(null);
      }
    }}
  >

    <div className="view-modal">

      {/* Header */}

      <div className="modal-header">

        <div>
          <h2>🌱 Crop Details</h2>

          <p>
            Complete information about this crop
          </p>
        </div>

        <button
          className="modal-close"
          onClick={() => setViewingCrop(null)}
        >
          ✕
        </button>

      </div>


      {/* Details */}

      <div className="crop-detail-card">

        <div className="crop-detail-title">
          🌱 {viewingCrop.name || "Unnamed Crop"}
        </div>

        <div className="detail-row">
          <span>Crop Type</span>

          <strong>
            {viewingCrop.type || "-"}
          </strong>
        </div>


        <div className="detail-row">
          <span>Farm</span>

          <strong>
            🚜 {viewingCrop.farm || "-"}
          </strong>
        </div>


        <div className="detail-row">
          <span>Area</span>

          <strong>
            {viewingCrop.area || "-"} acres
          </strong>
        </div>


        <div className="detail-row">
          <span>Season</span>

          <strong>
            {viewingCrop.season || "-"}
          </strong>
        </div>


        <div className="detail-row">
          <span>Planting Date</span>

          <strong>
            {viewingCrop.plantingDate || "-"}
          </strong>
        </div>


        <div className="detail-row">
          <span>Expected Harvest</span>

          <strong>
            {viewingCrop.harvestDate || "-"}
          </strong>
        </div>


        <div className="detail-row">
          <span>Status</span>

          <span className="table-status">
            {viewingCrop.status || "Growing"}
          </span>
        </div>

      </div>


      {/* Buttons */}

      <div className="modal-buttons">

        <button
          className="cancel"
          onClick={() => setViewingCrop(null)}
        >
          Close
        </button>

        <button
          className="save"
          onClick={() => {
            setViewingCrop(null);
            startEdit(viewingCrop);
          }}
        >
          ✏️ Edit Crop
        </button>

      </div>

    </div>

  </div>

)}

      

    </div>
  );
}

export default CropList;