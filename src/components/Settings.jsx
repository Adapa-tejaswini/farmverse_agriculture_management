function Settings() {
  return (
    <div className="page">

      <div className="page-header">
        <h1>⚙️ Settings</h1>
        <p>Manage your FarmMS preferences.</p>
      </div>

      <div className="form-card">

        <h2>Farm Profile</h2>

        <div className="form-grid">

          <div className="form-group">
            <label>Farm Name</label>
            <input
              placeholder="Green Valley Farm"
            />
          </div>

          <div className="form-group">
            <label>Owner Name</label>
            <input
              placeholder="Farmer name"
            />
          </div>

          <div className="form-group">
            <label>Location</label>
            <input
              placeholder="Farm location"
            />
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input
              placeholder="Phone number"
            />
          </div>

        </div>

        <div className="form-buttons">
          <button className="save">
            Save Settings
          </button>
        </div>

      </div>

    </div>
  );
}

export default Settings;