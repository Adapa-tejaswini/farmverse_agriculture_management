import React, { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import Navbar from "./Navbar.jsx";
import Home from "./Home.jsx";
import Login from "./Login.jsx";
import Register from "./Register.jsx";
import FarmerDashboard from "./FarmerDashboard.jsx";
import FarmerProfile from "./FarmerProfile.jsx";
import FarmManagement from "./FarmManagement.jsx";
import CropManagement from "./CropManagement.jsx";
import Prediction from "./Prediction.jsx";
import UserProfile from "./UserProfile.jsx";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("farmverse_user");

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("farmverse_user");
      }
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
  };

  const FarmerRoute = ({ children }) => {
    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== "farmer") return <Navigate to="/profile" replace />;
    return children;
  };

  const ProtectedRoute = ({ children }) => {
    if (!user) return <Navigate to="/login" replace />;
    return children;
  };

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} />

      <Routes>
        <Route path="/" element={<Home user={user} />} />

        <Route
          path="/login"
          element={
            user ? (
              <Navigate to={user.role === "farmer" ? "/dashboard" : "/profile"} replace />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />

        <Route
          path="/register"
          element={
            user ? (
              <Navigate to={user.role === "farmer" ? "/dashboard" : "/profile"} replace />
            ) : (
              <Register onRegister={handleLogin} />
            )
          }
        />

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

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;