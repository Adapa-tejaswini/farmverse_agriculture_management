import "./Navbar.css";

function Navbar() {
  return (
    <header className="navbar">

      <h2>Dashboard</h2>

      <div className="navbar-right">

        <input
          type="text"
          placeholder="Search..."
        />

        <div className="notification">
          🔔
        </div>

        <div className="profile">
          👤
        </div>

      </div>

    </header>
  );
}

export default Navbar;