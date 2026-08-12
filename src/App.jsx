import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

import Dashboard from "./components/Dashboard";
import AddCrop from "./components/AddCrop";
import CropList from "./components/CropList";
import FarmManagement from "./components/FarmManagement";
import FarmList from "./components/FarmList";
import Irrigation from "./components/Irrigation";
import Inventory from "./components/Inventory";
import Reports from "./components/Reports";
import Settings from "./components/Settings";
import CropManagement from "./components/CropManagement";
import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <div className="app">

        <Sidebar />

        <main className="main-content">
          <Navbar />

          <Routes>
            <Route path="/" element={<Dashboard />} />

            <Route path="/addcrop" element={<AddCrop />} />
            <Route path="/crops" element={<CropManagement />} />

            <Route path="/farm" element={<FarmManagement />} />
            <Route path="/farms" element={<FarmList />} />

            <Route path="/irrigation" element={<Irrigation />} />

            <Route path="/inventory" element={<Inventory />} />

            <Route path="/reports" element={<Reports />} />

            <Route path="/settings" element={<Settings />} />
         
          </Routes>

        </main>

      </div>
    </BrowserRouter>
  );
}

export default App;