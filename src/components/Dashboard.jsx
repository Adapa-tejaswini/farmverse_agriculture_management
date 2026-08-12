import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardCards from "./DashboardCards";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  // ================= DATA =================

  const [crops, setCrops] = useState([]);
  const [farms, setFarms] = useState([]);

  // Load data from localStorage
  useEffect(() => {
    const loadData = () => {
      const savedCrops =
        JSON.parse(localStorage.getItem("crops")) || [];

      const savedFarms =
        JSON.parse(localStorage.getItem("farms")) || [];

      setCrops(savedCrops);
      setFarms(savedFarms);
    };

    loadData();

    // Reload data whenever dashboard becomes active
    window.addEventListener("focus", loadData);

    return () => {
      window.removeEventListener("focus", loadData);
    };
  }, []);

  // ================= STATISTICS =================

  const totalCrops = crops.length;

  const totalFarms = farms.length;

  // Count farms that have irrigation enabled
  const irrigationCount = farms.filter((farm) => {
    return (
      farm.irrigation === "Yes" ||
      farm.irrigation === "yes" ||
      farm.irrigation === true ||
      farm.irrigation === "Available"
    );
  }).length;

  return (
    <div className="dashboard">

      {/* ================================================= */}
      {/* ================= FARMVERSE HERO BANNER =========== */}
      {/* ================================================= */}

      <section className="farmore-banner">

        {/* Decorative background elements */}

        <div className="banner-decoration decoration-one"></div>
        <div className="banner-decoration decoration-two"></div>
        <div className="banner-decoration decoration-three"></div>


        {/* Banner Content */}

        <div className="farmore-banner-content">

          {/* LEFT CONTENT */}

          <div className="farmore-banner-text">

            <div className="farmore-brand">

              <div className="farmore-logo">
                🌱
              </div>

              <div>
                <strong>FARMVERSE</strong>

                <span>
                  SMART FARM MANAGEMENT
                </span>
              </div>

            </div>


            <h1>
              Grow Smarter.
              <br />
              <span>Farm Better.</span>
            </h1>


            <p>
              Manage your farms, crops and agricultural
              activities efficiently with smart and simple
              farm management tools.
            </p>


            <div className="farmore-features">

              <div className="farmore-feature">

                <span>🌾</span>

                <div>
                  <strong>
                    Crop Management
                  </strong>

                  <small>
                    Track your crops
                  </small>
                </div>

              </div>


              <div className="farmore-feature">

                <span>🚜</span>

                <div>
                  <strong>
                    Farm Management
                  </strong>

                  <small>
                    Manage your farms
                  </small>
                </div>

              </div>

            </div>

          </div>


          {/* RIGHT VISUAL */}

          <div className="farmore-banner-visual">

            <div className="farmore-glow"></div>


            <div className="farmore-circle">

              <div className="farmore-inner-circle">
                🌾
              </div>


              <div className="floating-icon icon-leaf">
                🌿
              </div>


              <div className="floating-icon icon-water">
                💧
              </div>


              <div className="floating-icon icon-crop">
                🌱
              </div>

            </div>


            <div className="farmore-orbit"></div>

          </div>

        </div>

      </section>


      {/* ================================================= */}
      {/* ================= STATISTICS ==================== */}
      {/* ================================================= */}

      <section className="stats">

        {/* TOTAL CROPS */}

        <div className="stat-card">

          <div className="stat-icon green">
            🌱
          </div>

          <div>

            <small>
              Total Crops
            </small>

            <h2>
              {totalCrops}
            </h2>

            <span className="stat-info">
              Registered crops
            </span>

          </div>

        </div>


        {/* TOTAL FARMS */}

        <div className="stat-card">

          <div className="stat-icon blue">
            🚜
          </div>

          <div>

            <small>
              Total Farms
            </small>

            <h2>
              {totalFarms}
            </h2>

            <span className="stat-info">
              Registered farms
            </span>

          </div>

        </div>


        {/* IRRIGATION */}

        <div className="stat-card">

          <div className="stat-icon water">
            💧
          </div>

          <div>

            <small>
              Irrigation
            </small>

            <h2>
              {irrigationCount}
            </h2>

            <span className="stat-info">
              Active systems
            </span>

          </div>

        </div>


        {/* INVENTORY */}

        <div className="stat-card">

          <div className="stat-icon orange">
            📦
          </div>

          <div>

            <small>
              Inventory
            </small>

            <h2>
              24
            </h2>

            <span className="stat-info">
              Items available
            </span>

          </div>

        </div>

      </section>


      {/* ================================================= */}
      {/* ================= QUICK ACTIONS ================= */}
      {/* ================================================= */}

      <div className="quick-actions-header">
  <div className="quick-actions-title">
    <div className="quick-actions-icon">
      ⚡
    </div>

    <div>
      <span>FARM MANAGEMENT</span>

      <h2>Quick Actions</h2>

      <p>
        Manage your crops and farms from one place.
      </p>
    </div>
  </div>
</div>

<DashboardCards />
<section className="activity">

  <div className="activity-header">

    <div className="activity-heading">

      <div className="activity-title-icon">
        🌱
      </div>

      <div>
        <span className="activity-label">
          FARM UPDATES
        </span>

        <h2>
          Recent Crop Activity
        </h2>

        <p>
          Keep track of your latest crop additions and updates.
        </p>
      </div>

    </div>

    <button
      className="view-all-btn"
      onClick={() => navigate("/crops")}
    >
      View All →
    </button>

  </div>


  {crops.length === 0 ? (

    <div className="empty-activity">

      <div className="empty-activity-icon">
        🌱
      </div>

      <h3>
        No crop activity yet
      </h3>

      <p>
        Add your first crop to start tracking your farm activity.
      </p>

      <button
        className="save"
        onClick={() => navigate("/addcrop")}
      >
        + Add Crop
      </button>

    </div>

  ) : (

    <div className="activity-list">

      {crops
        .slice()
        .reverse()
        .slice(0, 5)
        .map((crop, index) => {

          const status = crop.status || "Growing";

          const isReady =
            status === "Ready" ||
            status === "Ready for Harvest";

          return (

            <div
              className="activity-row"
              key={
                crop.id ||
                `${crop.name}-${index}`
              }
            >

              <div className="activity-crop">

                <div
                  className={`activity-icon ${
                    isReady ? "tomato" : "rice"
                  }`}
                >
                  🌱
                </div>

                <div>

                  <strong>
                    {crop.name || "Unnamed Crop"}
                  </strong>

                  <small>
                    {crop.type
                      ? `${crop.type} • Crop activity`
                      : "Crop activity"}
                  </small>

                </div>

              </div>


              <span
                className={`status ${
                  isReady ? "ready" : "growing"
                }`}
              >
                {status}
              </span>


              <span className="activity-time">
                {crop.plantingDate
                  ? crop.plantingDate
                  : "Recently added"}
              </span>

            </div>

          );

        })}

    </div>

  )}

</section>

    </div>
  );
}

export default Dashboard;