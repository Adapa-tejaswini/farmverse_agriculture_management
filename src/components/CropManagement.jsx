import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SmartRecommendation from "./SmartRecommendation";
import "./CropManagement.css";

function CropManagement() {
  const navigate = useNavigate();

  const [crops, setCrops] = useState([]);

  useEffect(() => {
    const savedCrops =
      JSON.parse(localStorage.getItem("crops")) || [];

    setCrops(savedCrops);
  }, []);

  const handleDelete = (id) => {
    const updatedCrops = crops.filter(
      (crop) => crop.id !== id
    );

    setCrops(updatedCrops);

    localStorage.setItem(
      "crops",
      JSON.stringify(updatedCrops)
    );
  };

  return (
    <div className="crop-management">

      {/* Header */}

      <div className="crop-management-header">

        <div>
          <span className="crop-label">
            FARM MANAGEMENT
          </span>

          <h1>🌱 Crop Management</h1>

          <p>
            Manage, monitor and track your crops.
          </p>
        </div>

        <button
          className="add-crop-btn"
          onClick={() => navigate("/addcrop")}
        >
          + Add Crop
        </button>

      </div>


      {/* Statistics */}

      <div className="crop-stats">

        <div className="crop-stat-card">
          <span>🌱</span>
          <div>
            <small>Total Crops</small>
            <h2>{crops.length}</h2>
          </div>
        </div>

        <div className="crop-stat-card">
          <span>🌿</span>
          <div>
            <small>Growing</small>
            <h2>
              {
                crops.filter(
                  (crop) => crop.status === "Growing"
                ).length
              }
            </h2>
          </div>
        </div>

        <div className="crop-stat-card">
          <span>🌾</span>
          <div>
            <small>Ready</small>
            <h2>
              {
                crops.filter(
                  (crop) =>
                    crop.status === "Ready" ||
                    crop.status === "Ready for Harvest"
                ).length
              }
            </h2>
          </div>
        </div>

      </div>


      {/* Crop Table */}

      <div className="crop-table-card">

        <div className="table-heading">

          <div>
            <h2>Your Crops</h2>
            <p>
              View and manage your registered crops.
            </p>
          </div>

        </div>


        {crops.length === 0 ? (

          <div className="no-crops">

            <div className="no-crops-icon">
              🌱
            </div>

            <h3>
              No crops added yet
            </h3>

            <p>
              Add your first crop to start managing
              your farm.
            </p>

            <button
              onClick={() => navigate("/addcrop")}
            >
              + Add Crop
            </button>

          </div>

        ) : (

          <div className="crop-table-wrapper">

            <table>

              <thead>
                <tr>
                  <th>Crop</th>
                  <th>Farm</th>
                  <th>Area</th>
                  <th>Season</th>
                  <th>Planting Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {crops.map((crop) => (

                  <tr key={crop.id}>

                    <td>
                      <strong>
                        🌱 {crop.name}
                      </strong>
                    </td>

                    <td>
                      {crop.farm}
                    </td>

                    <td>
                      {crop.area} acres
                    </td>

                    <td>
                      {crop.season}
                    </td>

                    <td>
                      {crop.plantingDate}
                    </td>

                    <td>

                      <span className="crop-status">
                        {crop.status || "Growing"}
                      </span>

                    </td>

                    <td>

                      <button
                        className="delete-crop"
                        onClick={() =>
                          handleDelete(crop.id)
                        }
                      >
                        Delete
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {/* Smart Recommendations */}

      <SmartRecommendation
        crop={
          crops.length > 0
            ? crops[crops.length - 1]
            : null
        }
      />

    </div>
  );
}

export default CropManagement;