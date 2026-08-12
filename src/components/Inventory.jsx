function Inventory() {
  const items = [
    ["🌱", "Rice Seeds", "Seeds", "50 kg"],
    ["🌿", "Organic Fertilizer", "Fertilizer", "100 kg"],
    ["🧪", "Pesticide", "Pesticide", "20 L"],
    ["🚜", "Tractor", "Equipment", "1"],
  ];

  return (
    <div className="page">

      <div className="page-header">
        <h1>📦 Inventory</h1>
        <p>Manage seeds, fertilizers, pesticides and equipment.</p>
      </div>

      <div className="table-card">

        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Name</th>
              <th>Category</th>
              <th>Quantity</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item) => (
              <tr key={item[1]}>
                <td>{item[0]}</td>
                <td>{item[1]}</td>
                <td>{item[2]}</td>
                <td>{item[3]}</td>
              </tr>
            ))}
          </tbody>

        </table>

      </div>

    </div>
  );
}

export default Inventory;