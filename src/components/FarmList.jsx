import { useEffect, useState } from "react";

function FarmList() {
  const [farms, setFarms] = useState([]);
  const [viewingFarm, setViewingFarm] = useState(null);

  // Load farms from localStorage
  useEffect(() => {
    const savedFarms =
      JSON.parse(localStorage.getItem("farms")) || [];

    setFarms(savedFarms);
  }, []);

  // Delete farm
  const deleteFarm = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this farm?"
    );

    if (!confirmed) return;

    const updatedFarms = farms.filter(
      (farm) => farm.id !== id
    );

    localStorage.setItem(
      "farms",
      JSON.stringify(updatedFarms)
    );

    setFarms(updatedFarms);
  };

  return (
    <div className="dashboard">

      {/* PAGE HEADER */}
      <div className="page-header">
        <h1>🚜 Farm Management</h1>

        <p>
          View and manage your registered farms.
        </p>
      </div>

      {/* NO FARMS */}
      {farms.length === 0 ? (
        <div className="table-card">
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
              🚜
            </div>

            <h2>No farms added yet</h2>

            <p style={{ color: "#777" }}>
              Add your first farm to see it here.
            </p>
          </div>
        </div>
      ) : (

        /* FARM TABLE */
        <div className="table-card">

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "15px",
            }}
          >
            <div>
              <h2 style={{ margin: 0 }}>
                My Farms
              </h2>

              <p
                style={{
                  margin: "5px 0 0",
                  color: "#777",
                }}
              >
                All your registered farms
              </p>
            </div>

            <span
              style={{
                background: "#e8f5e9",
                color: "#2e7d32",
                padding: "7px 12px",
                borderRadius: "20px",
                fontSize: "13px",
              }}
            >
              {farms.length} Farm
              {farms.length !== 1 ? "s" : ""}
            </span>
          </div>

          <table>

            <thead>
              <tr>
                <th>Farm Name</th>
                <th>Location</th>
                <th>Area</th>
                <th>Soil</th>
                <th>Owner</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {farms.map((farm) => (

                <tr key={farm.id}>

                  <td>
                    <strong>
                      🚜 {farm.name}
                    </strong>
                  </td>

                  <td>
                    📍 {farm.location}
                  </td>

                  <td>
                    {farm.area} acres
                  </td>

                  <td>
                    {farm.soil}
                  </td>

                  <td>
                    👨‍🌾 {farm.owner}
                  </td>

                  <td>

                    <div
                      style={{
                        display: "flex",
                        gap: "7px",
                        flexWrap: "wrap",
                      }}
                    >

                      {/* VIEW */}
                      <button
                        onClick={() =>
                          setViewingFarm(farm)
                        }
                        style={{
                          border: "none",
                          background: "#e8f5e9",
                          color: "#2e7d32",
                          padding: "7px 11px",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        👁️ View
                      </button>

                      {/* DELETE */}
                      <button
                        onClick={() =>
                          deleteFarm(farm.id)
                        }
                        style={{
                          border: "none",
                          background: "#ffebee",
                          color: "#c62828",
                          padding: "7px 11px",
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

      {/* ================= VIEW FARM POPUP ================= */}

      {viewingFarm && (

        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setViewingFarm(null);
            }
          }}
        >

          <div className="view-modal">

            {/* HEADER */}
            <div className="modal-header">

              <div>
                <h2>🚜 Farm Details</h2>

                <p>
                  Complete information about this farm
                </p>
              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setViewingFarm(null)
                }
              >
                ✕
              </button>

            </div>

            {/* DETAILS */}
            <div className="crop-detail-card">

              <div className="crop-detail-title">
                🚜 {viewingFarm.name}
              </div>

              <div className="detail-row">
                <span>Location</span>

                <strong>
                  📍 {viewingFarm.location}
                </strong>
              </div>

              <div className="detail-row">
                <span>Total Area</span>

                <strong>
                  {viewingFarm.area} acres
                </strong>
              </div>

              <div className="detail-row">
                <span>Soil Type</span>

                <strong>
                  🌱 {viewingFarm.soil}
                </strong>
              </div>

              <div className="detail-row">
                <span>Farmer / Owner</span>

                <strong>
                  👨‍🌾 {viewingFarm.owner}
                </strong>
              </div>

            </div>

            {/* CLOSE */}
            <div className="modal-buttons">

              <button
                className="cancel"
                onClick={() =>
                  setViewingFarm(null)
                }
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default FarmList;