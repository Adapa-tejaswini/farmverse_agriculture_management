import { NavLink } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
  const menuItems = [
    ["🏠", "Dashboard", "/"],
    ["🌱", "Crop Management", "/crops"],
    ["🚜", "Farm Management", "/farms"],
    ["💧", "Irrigation", "/irrigation"],
    ["📦", "Inventory", "/inventory"],
    ["📊", "Reports", "/reports"],
    ["⚙️", "Settings", "/settings"],
  ];

  return (
    <aside className="sidebar">

     <div className="logo">
  🌱 <span>FARMVERSE</span>
</div>

      <nav>
        {menuItems.map(([icon, name, path]) => (
          <NavLink
            key={name}
            to={path}
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            <span>{icon}</span>
            {name}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <p>🌱 Smart Agriculture</p>
        <small>FarmMS v1.0</small>
      </div>

    </aside>
  );
}

export default Sidebar;