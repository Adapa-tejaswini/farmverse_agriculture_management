import React, { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { getToken, removeToken } from "./api.js";

import Navbar from "./Navbar.jsx";
import Sidebar from "./Sidebar.jsx";

import Home from "./Home.jsx";
import Login from "./Login.jsx";
import Register from "./Register.jsx";

import FarmerDashboard from "./FarmerDashboard.jsx";
import FarmerProfile from "./FarmerProfile.jsx";
import FarmManagement from "./FarmManagement.jsx";
import CropManagement from "./CropManagement.jsx";
import Prediction from "./Prediction.jsx";

import WeatherForecast from "./WeatherForecast.jsx";
import CropReports from "./CropReports.jsx";
import Chatbot from "./Chatbot.jsx";

import FertilizerRecommendation from "./FertilizerRecommendation.jsx";
import CropRecommendation from "./CropRecommendation.jsx";
import PlantDiseaseDetection from "./PlantDiseaseDetection.jsx";
import SmartNotifications from "./SmartNotifications.jsx";

import Marketplace from "./Marketplace.jsx";
import BuyerOrders from "./BuyerOrders.jsx";
import UserProfile from "./UserProfile.jsx";

import CollectiveSelling from "./CollectiveSelling.jsx";
import VehicleSharing from "./VehicleSharing.jsx";

function App() {
  const [user, setUser] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("farmverse_user");
    const token = getToken();

    if (!savedUser) {
      setUser(null);
      return;
    }

    if (!token) {
      localStorage.removeItem("farmverse_user");
      setUser(null);
      return;
    }

    try {
      setUser(JSON.parse(savedUser));
    } catch (error) {
      console.error("Could not load saved user:", error);
      localStorage.removeItem("farmverse_user");
      removeToken();
      setUser(null);
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("farmverse_user", JSON.stringify(userData));
  };

  const handleUpdateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("farmverse_user", JSON.stringify(updatedUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("farmverse_user");
    removeToken();
  };

  const FarmerRoute = ({ children }) => {
    if (!user) {
      return <Navigate to="/login" replace />;
    }

    if (user.role !== "farmer") {
      return <Navigate to="/marketplace" replace />;
    }

    return children;
  };

  const BuyerRoute = ({ children }) => {
    if (!user) {
      return <Navigate to="/login" replace />;
    }

    if (user.role !== "user") {
      return <Navigate to="/dashboard" replace />;
    }

    return children;
  };

  const ProtectedRoute = ({ children }) => {
    if (!user) {
      return <Navigate to="/login" replace />;
    }

    return children;
  };

  const redirectLoggedInUser = () => {
    if (!user) return "/";
    return user.role === "farmer" ? "/dashboard" : "/marketplace";
  };

  const showSidebar = user?.role === "farmer";

  return (
    <>
      <Navbar
        user={user}
        onLogout={handleLogout}
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed((previous) => !previous)}
      />

      {showSidebar && <Sidebar user={user} collapsed={sidebarCollapsed} />}

      <div
        style={{
          ...styles.content,
          marginLeft: showSidebar
            ? sidebarCollapsed
              ? "78px"
              : "248px"
            : "0px",
        }}
      >
        <Routes>
          {/* Home route */}
          <Route
            path="/"
            element={
              user?.role === "user" ? (
                <Navigate to="/marketplace" replace />
              ) : (
                <Home user={user} />
              )
            }
          />

          {/* Auth routes */}
          <Route
            path="/login"
            element={
              user ? (
                <Navigate to={redirectLoggedInUser()} replace />
              ) : (
                <Login onLogin={handleLogin} />
              )
            }
          />

          <Route
            path="/register"
            element={
              user ? (
                <Navigate to={redirectLoggedInUser()} replace />
              ) : (
                <Register onRegister={handleLogin} />
              )
            }
          />

          {/* Buyer pages */}
          <Route
            path="/marketplace"
            element={
              <BuyerRoute>
                <Marketplace user={user} />
              </BuyerRoute>
            }
          />

          <Route
            path="/buyer-orders"
            element={
              <BuyerRoute>
                <BuyerOrders user={user} />
              </BuyerRoute>
            }
          />

          <Route
            path="/collective-selling"
            element={
              <ProtectedRoute>
                <CollectiveSelling user={user} />
              </ProtectedRoute>
            }
          />

          {/* Farmer pages */}
          <Route
            path="/dashboard"
            element={
              <FarmerRoute>
                <FarmerDashboard user={user} />
              </FarmerRoute>
            }
          />

          <Route
            path="/farm-management"
            element={
              <FarmerRoute>
                <FarmManagement user={user} />
              </FarmerRoute>
            }
          />

          <Route
            path="/crop-management"
            element={
              <FarmerRoute>
                <CropManagement user={user} />
              </FarmerRoute>
            }
          />

          <Route
            path="/fertilizer"
            element={
              <FarmerRoute>
                <FertilizerRecommendation user={user} />
              </FarmerRoute>
            }
          />

          <Route
            path="/crop-recommendation"
            element={
              <FarmerRoute>
                <CropRecommendation user={user} />
              </FarmerRoute>
            }
          />

          <Route
            path="/disease-detection"
            element={
              <FarmerRoute>
                <PlantDiseaseDetection user={user} />
              </FarmerRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <FarmerRoute>
                <SmartNotifications user={user} />
              </FarmerRoute>
            }
          />

          <Route
            path="/prediction"
            element={
              <FarmerRoute>
                <Prediction user={user} />
              </FarmerRoute>
            }
          />

          <Route
            path="/weather"
            element={
              <FarmerRoute>
                <WeatherForecast user={user} />
              </FarmerRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <FarmerRoute>
                <CropReports user={user} />
              </FarmerRoute>
            }
          />

          <Route
            path="/assistant"
            element={
              <FarmerRoute>
                <Chatbot user={user} />
              </FarmerRoute>
            }
          />

          <Route
            path="/vehicle-sharing"
            element={
              <FarmerRoute>
                <VehicleSharing user={user} />
              </FarmerRoute>
            }
          />

          {/* Profile route */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                {user?.role === "farmer" ? (
                  <FarmerProfile
                    user={user}
                    onLogout={handleLogout}
                    onUpdateUser={handleUpdateUser}
                  />
                ) : (
                  <UserProfile
                    user={user}
                    onLogout={handleLogout}
                    onUpdateUser={handleUpdateUser}
                  />
                )}
              </ProtectedRoute>
            }
          />

          {/* Keep this LAST */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  );
}

const styles = {
  content: {
    transition: "margin-left 0.25s ease",
  },
};

export default App;