function Irrigation() {
  return (
    <div className="page">

      <div className="page-header">
        <h1>💧 Irrigation Management</h1>
        <p>Monitor and schedule irrigation activities.</p>
      </div>

      <div className="stats">

        <div className="stat-card">
          <span>💧</span>
          <div>
            <small>Today's Water Usage</small>
            <h2>2,450 L</h2>
          </div>
        </div>

        <div className="stat-card">
          <span>🌱</span>
          <div>
            <small>Fields Irrigated</small>
            <h2>5</h2>
          </div>
        </div>

        <div className="stat-card">
          <span>⏰</span>
          <div>
            <small>Next Schedule</small>
            <h2>6:00 AM</h2>
          </div>
        </div>

      </div>

      <div className="table-card">

        <h2>Irrigation Schedule</h2>

        <table>
          <thead>
            <tr>
              <th>Farm</th>
              <th>Crop</th>
              <th>Time</th>
              <th>Duration</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>Green Valley</td>
              <td>Rice</td>
              <td>6:00 AM</td>
              <td>30 min</td>
              <td>Scheduled</td>
            </tr>

            <tr>
              <td>Sunrise Farm</td>
              <td>Tomato</td>
              <td>7:00 AM</td>
              <td>20 min</td>
              <td>Scheduled</td>
            </tr>
          </tbody>

        </table>

      </div>

    </div>
  );
}

export default Irrigation;