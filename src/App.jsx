import React, { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { getToken, removeToken } from "./api.js";

import Navbar from "./Navbar.jsx";
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

import UserProfile from "./UserProfile.jsx";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("farmverse_user");
    const token = getToken();

    if (!savedUser) {
      setUser(null);
      return;
    }

    /*
      If an old localStorage user exists but backend JWT token does not exist,
      remove old login data and force proper backend login.
    */
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
      return <Navigate to="/profile" replace />;
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

    return user.role === "farmer" ? "/dashboard" : "/profile";
  };

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} />

      <Routes>
        {/* Public pages */}
        <Route path="/" element={<Home user={user} />} />

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

        {/* Profile route: Farmer Profile or Buyer Profile */}
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

        {/* Any invalid route redirects home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;