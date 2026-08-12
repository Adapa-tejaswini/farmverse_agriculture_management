function Reports() {
  return (
    <div className="page">

      <div className="page-header">
        <h1>📊 Reports</h1>
        <p>View your farm performance reports.</p>
      </div>

      <div className="stats">

        <div className="stat-card">
          <span>🌾</span>
          <div>
            <small>Total Production</small>
            <h2>4.8 Tons</h2>
          </div>
        </div>

        <div className="stat-card">
          <span>💰</span>
          <div>
            <small>Total Revenue</small>
            <h2>₹85,000</h2>
          </div>
        </div>

        <div className="stat-card">
          <span>💸</span>
          <div>
            <small>Total Expenses</small>
            <h2>₹32,000</h2>
          </div>
        </div>

        <div className="stat-card">
          <span>📈</span>
          <div>
            <small>Profit</small>
            <h2>₹53,000</h2>
          </div>
        </div>

      </div>

      <div className="table-card">

        <h2>Monthly Report</h2>

        <table>
          <thead>
            <tr>
              <th>Month</th>
              <th>Production</th>
              <th>Revenue</th>
              <th>Expenses</th>
              <th>Profit</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>January</td>
              <td>1.2 Tons</td>
              <td>₹25,000</td>
              <td>₹10,000</td>
              <td>₹15,000</td>
            </tr>

            <tr>
              <td>February</td>
              <td>1.8 Tons</td>
              <td>₹32,000</td>
              <td>₹12,000</td>
              <td>₹20,000</td>
            </tr>

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default Reports;