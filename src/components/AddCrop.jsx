import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AddCrop.css";

function AddCrop() {
  const navigate = useNavigate();

  const [crop, setCrop] = useState({
    name: "",
    type: "",
    farm: "",
    area: "",
    season: "",
    plantingDate: "",
    harvestDate: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setCrop((previousCrop) => ({
      ...previousCrop,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const oldCrops =
      JSON.parse(localStorage.getItem("crops")) || [];

    const newCrop = {
      id: Date.now(),
      ...crop,
      status: "Growing",
    };

    const allCrops = [...oldCrops, newCrop];

    localStorage.setItem(
      "crops",
      JSON.stringify(allCrops)
    );

    navigate("/crops");
  };

  return (
    <div className="page">

      {/* ================= PAGE HEADER ================= */}

      <div className="page-header">
        <h1>🌱 Add Crop</h1>

        <p>
          Add a new crop to your farm.
        </p>
      </div>

      {/* ================= ADD CROP FORM ================= */}

      <form
        className="form-card"
        onSubmit={handleSubmit}
      >

        <div className="form-grid">

          {/* Crop Name */}
          <div className="form-group">
            <label>Crop Name</label>

            <input
              name="name"
              value={crop.name}
              onChange={handleChange}
              placeholder="Example: Rice"
              required
            />
          </div>

          {/* Crop Type */}
          <div className="form-group">
            <label>Crop Type</label>

            <select
              name="type"
              value={crop.type}
              onChange={handleChange}
              required
            >
              <option value="">
                Select crop
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
              value={crop.farm}
              onChange={handleChange}
              placeholder="Farm name"
              required
            />
          </div>

          {/* Area */}
          <div className="form-group">
            <label>Area (acres)</label>

            <input
              type="number"
              name="area"
              value={crop.area}
              onChange={handleChange}
              placeholder="Example: 5"
              min="0"
              step="0.1"
              required
            />
          </div>

          {/* Season */}
          <div className="form-group">
            <label>Season</label>

            <select
              name="season"
              value={crop.season}
              onChange={handleChange}
              required
            >
              <option value="">
                Select season
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
            <label>Planting Date</label>

            <input
              type="date"
              name="plantingDate"
              value={crop.plantingDate}
              onChange={handleChange}
              required
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
              value={crop.harvestDate}
              onChange={handleChange}
              required
            />
          </div>

        </div>

        {/* ================= BUTTONS ================= */}

        <div className="form-buttons">

          <button
            type="button"
            className="cancel"
            onClick={() => navigate("/")}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="save"
          >
            🌱 Add Crop
          </button>

        </div>

      </form>

    </div>
  );
}

export default AddCrop;