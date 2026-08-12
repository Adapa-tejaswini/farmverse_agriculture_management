import { useMemo } from "react";
import "./SmartRecommendation.css";

function SmartRecommendation({ crop }) {
  const recommendations = useMemo(() => {
    if (!crop) {
      return [
        {
          icon: "🌱",
          title: "Add a crop",
          text: "Add crop information to receive smart farming recommendations.",
          type: "info",
        },
      ];
    }

    const result = [];

    const stage = (crop.growthStage || crop.stage || "").toLowerCase();
    const health = (crop.health || "").toLowerCase();
    const irrigation = (crop.irrigation || "").toLowerCase();

    // Irrigation recommendation
    if (
      irrigation.includes("dry") ||
      irrigation.includes("needed") ||
      irrigation.includes("no")
    ) {
      result.push({
        icon: "💧",
        title: "Irrigation recommended",
        text: "The crop may require additional water. Check soil moisture and consider irrigation.",
        type: "water",
      });
    } else {
      result.push({
        icon: "💧",
        title: "Maintain irrigation",
        text: "Continue monitoring soil moisture and maintain the current irrigation schedule.",
        type: "good",
      });
    }

    // Growth-stage recommendation
    if (stage.includes("flower")) {
      result.push({
        icon: "🌼",
        title: "Flowering stage",
        text: "Monitor water availability and check the crop regularly for pests during flowering.",
        type: "growth",
      });
    } else if (stage.includes("fruit")) {
      result.push({
        icon: "🍅",
        title: "Fruiting stage",
        text: "Maintain consistent irrigation and monitor the crop for disease or pest damage.",
        type: "growth",
      });
    } else if (stage.includes("seed")) {
      result.push({
        icon: "🌱",
        title: "Early growth",
        text: "Keep the soil adequately moist and monitor the young plants regularly.",
        type: "growth",
      });
    } else {
      result.push({
        icon: "🌿",
        title: "Monitor crop growth",
        text: "Regularly check the crop's growth stage and update its information.",
        type: "growth",
      });
    }

    // Health recommendation
    if (
      health.includes("poor") ||
      health.includes("critical") ||
      health.includes("disease")
    ) {
      result.push({
        icon: "⚠️",
        title: "Crop health needs attention",
        text: "Inspect the crop for visible signs of disease, pests, or nutrient deficiency.",
        type: "warning",
      });
    } else {
      result.push({
        icon: "🟢",
        title: "Crop health looks good",
        text: "Continue regular monitoring to maintain healthy crop growth.",
        type: "good",
      });
    }

    return result;
  }, [crop]);

  return (
    <section className="smart-recommendation">

      <div className="smart-header">

        <div className="smart-icon">
          🤖
        </div>

        <div>
          <span className="smart-label">
            SMART FARMING
          </span>

          <h2>
            Smart Recommendations
          </h2>

          <p>
            Suggestions based on your crop information.
          </p>
        </div>

      </div>

      <div className="recommendation-list">

        {recommendations.map((item, index) => (
          <div
            className={`recommendation-card ${item.type}`}
            key={index}
          >

            <div className="recommendation-icon">
              {item.icon}
            </div>

            <div className="recommendation-content">

              <h3>
                {item.title}
              </h3>

              <p>
                {item.text}
              </p>

            </div>

          </div>
        ))}

      </div>

    </section>
  );
}

export default SmartRecommendation;