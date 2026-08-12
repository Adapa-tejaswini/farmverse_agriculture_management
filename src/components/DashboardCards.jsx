import { useNavigate } from "react-router-dom";

function DashboardCard() {
  const navigate = useNavigate();

  const cards = [
    {
      icon: "🌱",
      title: "Add Crop",
      text: "Register a new crop.",
      button: "Add Crop",
      path: "/addcrop",
    },
    {
      icon: "🚜",
      title: "Add Farm",
      text: "Register a new farm.",
      button: "Add Farm",
      path: "/farm",
    },
    {
      icon: "🌾",
      title: "Crop List",
      text: "View your registered crops.",
      button: "View Crops",
      path: "/crops",
    },
    {
      icon: "🏡",
      title: "Farm List",
      text: "View your registered farms.",
      button: "View Farms",
      path: "/farms",
    },
  ];

  return (
    <div className="dashboard-actions">

      {cards.map((card) => (
        <div className="action-card" key={card.title}>

          <div className="action-icon">
            {card.icon}
          </div>

          <h2>{card.title}</h2>

          <p>{card.text}</p>

          <button onClick={() => navigate(card.path)}>
            {card.button}
          </button>

        </div>
      ))}

    </div>
  );
}

export default DashboardCard;