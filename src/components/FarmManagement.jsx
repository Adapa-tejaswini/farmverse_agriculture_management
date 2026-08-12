import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./FarmManagement.css";

function FarmManagement() {
  const navigate = useNavigate();

  const [farm, setFarm] = useState({
    name: "",
    location: "",
    area: "",
    soil: "",
    owner: "",
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFarm({
      ...farm,
      [name]: value,
    });
  };

  // Add farm
  const handleSubmit = (e) => {
    e.preventDefault();

    // Get existing farms
    const existingFarms =
      JSON.parse(localStorage.getItem("farms")) || [];

    // Create new farm
    const newFarm = {
      id: Date.now(),
      name: farm.name,
      location: farm.location,
      area: farm.area,
      soil: farm.soil,
      owner: farm.owner,
    };

    // Add new farm to existing farms
    const updatedFarms = [
      ...existingFarms,
      newFarm,
    ];

    // Save farms to localStorage
    localStorage.setItem(
      "farms",
      JSON.stringify(updatedFarms)
    );

    alert(
      `Farm "${farm.name}" added successfully!`
    );

    // Go to Farm List
    navigate("/farms");
  };

  return (
    <div className="dashboard">

      {/* ================= PAGE HEADER ================= */}

      <div className="page-header">
        <h1>🚜 Add Farm</h1>

        <p>
          Register your farm details.
        </p>
      </div>


      {/* ================= FARM FORM ================= */}

      <form
        className="form-card"
        onSubmit={handleSubmit}
      >

        <div className="form-grid">

          {/* FARM NAME */}

          <div className="form-group">
            <label>
              Farm Name
            </label>

            <input
              type="text"
              name="name"
              value={farm.name}
              onChange={handleChange}
              placeholder="Example: Green Valley Farm"
              required
            />
          </div>


          {/* LOCATION */}

          <div className="form-group">
            <label>
              Location
            </label>

            <input
              type="text"
              name="location"
              value={farm.location}
              onChange={handleChange}
              placeholder="Village / District"
              required
            />
          </div>


          {/* AREA */}

          <div className="form-group">
            <label>
              Total Area (acres)
            </label>

            <input
              type="number"
              name="area"
              value={farm.area}
              onChange={handleChange}
              placeholder="Example: 10"
              min="0"
              step="0.1"
              required
            />
          </div>


          {/* SOIL TYPE */}

          <div className="form-group">
            <label>
              Soil Type
            </label>

            <select
              name="soil"
              value={farm.soil}
              onChange={handleChange}
              required
            >
              <option value="">
                Select soil
              </option>

              <option value="Loamy">
                Loamy
              </option>

              <option value="Clay">
                Clay
              </option>

              <option value="Sandy">
                Sandy
              </option>

              <option value="Black Soil">
                Black Soil
              </option>

              <option value="Red Soil">
                Red Soil
              </option>
            </select>
          </div>


          {/* FARMER / OWNER */}

          <div className="form-group">
            <label>
              Farmer / Owner
            </label>

            <input
              type="text"
              name="owner"
              value={farm.owner}
              onChange={handleChange}
              placeholder="Owner name"
              required
            />
          </div>

        </div>


        {/* ================= BUTTONS ================= */}

        <div className="form-buttons">

          <button
            type="button"
            className="cancel"
            onClick={() => navigate("/farms")}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="save"
          >
            🚜 Add Farm
          </button>

        </div>

      </form>

    </div>
  );
}

export default FarmManagement;