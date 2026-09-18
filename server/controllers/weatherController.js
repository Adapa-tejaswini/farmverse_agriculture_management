const pool = require("../config/db");

/*
  Open-Meteo weather code descriptions
*/
const getWeatherDescription = (code) => {
  const weatherCodes = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Foggy",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Heavy drizzle",
    56: "Freezing drizzle",
    57: "Heavy freezing drizzle",
    61: "Light rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Freezing rain",
    67: "Heavy freezing rain",
    71: "Light snowfall",
    73: "Moderate snowfall",
    75: "Heavy snowfall",
    77: "Snow grains",
    80: "Light rain showers",
    81: "Moderate rain showers",
    82: "Heavy rain showers",
    85: "Light snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Heavy thunderstorm with hail",
  };

  return weatherCodes[code] || "Weather information unavailable";
};

/*
  Maps weather code to a simple frontend-friendly emoji.
*/
const getWeatherIcon = (code) => {
  if (code === 0 || code === 1) return "☀";
  if (code === 2 || code === 3) return "⛅";
  if (code === 45 || code === 48) return "🌫";
  if (code >= 51 && code <= 67) return "🌧";
  if (code >= 71 && code <= 77) return "❄";
  if (code >= 80 && code <= 82) return "🌦";
  if (code >= 95) return "⛈";

  return "⛅";
};

/*
  Creates practical farm advisory based on weather conditions.
*/
const generateAdvisories = ({
  currentTemperature,
  currentHumidity,
  currentWindSpeed,
  maxRainChance,
  weeklyRainfall,
}) => {
  const advisories = [];

  if (maxRainChance >= 60) {
    advisories.push({
      type: "irrigation",
      icon: "💧",
      title: "Irrigation advisory",
      text: `Rain is likely during the next 7 days (${maxRainChance}% maximum rain probability). Check soil moisture before irrigating and avoid unnecessary watering.`,
    });
  } else {
    advisories.push({
      type: "irrigation",
      icon: "💧",
      title: "Irrigation advisory",
      text: "Rain probability is currently low. Monitor soil moisture and irrigate crops when the soil becomes dry.",
    });
  }

  if (currentTemperature >= 38) {
    advisories.push({
      type: "heat",
      icon: "☀",
      title: "High temperature advisory",
      text: "High temperature can cause crop stress. Water crops during early morning or evening and avoid watering during peak afternoon heat.",
    });
  } else if (currentTemperature <= 12) {
    advisories.push({
      type: "cold",
      icon: "❄",
      title: "Low temperature advisory",
      text: "Low temperature may affect sensitive crops. Monitor young plants and protect them if cold conditions continue.",
    });
  } else {
    advisories.push({
      type: "crop-care",
      icon: "☘",
      title: "Crop care advisory",
      text: "Temperature conditions are currently moderate. Continue routine crop monitoring, irrigation planning, and pest inspection.",
    });
  }

  if (currentWindSpeed >= 25) {
    advisories.push({
      type: "spraying",
      icon: "🌬",
      title: "Spraying advisory",
      text: "Strong wind is expected. Avoid pesticide, fertilizer, or foliar spray applications until wind conditions improve.",
    });
  } else if (maxRainChance >= 50) {
    advisories.push({
      type: "spraying",
      icon: "🌧",
      title: "Spraying advisory",
      text: "Rain is possible soon. Avoid spraying pesticide or fertilizer immediately before rainfall.",
    });
  } else {
    advisories.push({
      type: "spraying",
      icon: "🌿",
      title: "Spraying advisory",
      text: "If spraying is necessary, choose calm morning or evening hours. Always follow local agriculture guidance.",
    });
  }

  if (currentHumidity >= 85 || weeklyRainfall >= 30) {
    advisories.push({
      type: "disease",
      icon: "⚠",
      title: "Disease risk advisory",
      text: "High humidity or frequent rainfall can increase fungal disease risk. Inspect leaves regularly and avoid waterlogging.",
    });
  }

  return advisories;
};

/*
  Finds latitude and longitude for a farm location using
  Open-Meteo Geocoding API.
*/
const getCoordinatesFromLocation = async (location) => {
  const geocodingUrl = new URL(
    "https://geocoding-api.open-meteo.com/v1/search"
  );

  geocodingUrl.searchParams.set("name", location);
  geocodingUrl.searchParams.set("count", "1");
  geocodingUrl.searchParams.set("language", "en");
  geocodingUrl.searchParams.set("format", "json");

  const response = await fetch(geocodingUrl);

  if (!response.ok) {
    throw new Error("Unable to find coordinates for this farm location.");
  }

  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    throw new Error(
      "Location could not be found. Update your farm location with a city, district, or state."
    );
  }

  const place = data.results[0];

  return {
    latitude: place.latitude,
    longitude: place.longitude,
    resolvedLocation: [
      place.name,
      place.admin1,
      place.country,
    ]
      .filter(Boolean)
      .join(", "),
  };
};

/*
  Gets actual weather and 7-day forecast from Open-Meteo.
*/
const getOpenMeteoWeather = async (latitude, longitude) => {
  const weatherUrl = new URL(
    "https://api.open-meteo.com/v1/forecast"
  );

  weatherUrl.searchParams.set("latitude", latitude);
  weatherUrl.searchParams.set("longitude", longitude);

  weatherUrl.searchParams.set(
    "current",
    "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m"
  );

  weatherUrl.searchParams.set(
    "daily",
    "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum"
  );

  weatherUrl.searchParams.set("forecast_days", "7");
  weatherUrl.searchParams.set("timezone", "auto");

  const response = await fetch(weatherUrl);

  if (!response.ok) {
    throw new Error("Unable to fetch weather forecast.");
  }

  return response.json();
};

/*
  GET /api/weather/farm/:farmId

  Returns current weather + 7 day forecast for a selected farm.
*/
const getFarmWeather = async (req, res) => {
  try {
    const farmId = Number(req.params.farmId);

    if (!farmId) {
      return res.status(400).json({
        message: "Invalid farm ID.",
      });
    }

    /*
      Farmer can access weather only for their own farm.
    */
    const farmResult = await pool.query(
      `SELECT *
       FROM farms
       WHERE id = $1 AND farmer_id = $2`,
      [farmId, req.user.id]
    );

    if (farmResult.rows.length === 0) {
      return res.status(404).json({
        message: "Farm not found or you do not have access to it.",
      });
    }

    const farm = farmResult.rows[0];

    if (!farm.location) {
      return res.status(400).json({
        message:
          "Farm location is missing. Update the farm location before checking weather.",
      });
    }

    let latitude = farm.latitude ? Number(farm.latitude) : null;
    let longitude = farm.longitude ? Number(farm.longitude) : null;
    let resolvedLocation = farm.location;

    /*
      If latitude/longitude were not saved, find them using the farm location.
    */
    if (!latitude || !longitude) {
      const coordinates = await getCoordinatesFromLocation(farm.location);

      latitude = coordinates.latitude;
      longitude = coordinates.longitude;
      resolvedLocation = coordinates.resolvedLocation;

      /*
        Save discovered coordinates in database so future weather requests
        do not need geocoding every time.
      */
      await pool.query(
        `UPDATE farms
         SET latitude = $1, longitude = $2, updated_at = CURRENT_TIMESTAMP
         WHERE id = $3`,
        [latitude, longitude, farmId]
      );
    }

    const weatherData = await getOpenMeteoWeather(latitude, longitude);

    const current = weatherData.current;
    const daily = weatherData.daily;

    const forecast = daily.time.map((date, index) => ({
      date,
      day: new Date(`${date}T12:00:00`).toLocaleDateString("en-IN", {
        weekday: "short",
      }),
      weatherCode: daily.weather_code[index],
      weatherDescription: getWeatherDescription(daily.weather_code[index]),
      icon: getWeatherIcon(daily.weather_code[index]),
      temperatureMax: daily.temperature_2m_max[index],
      temperatureMin: daily.temperature_2m_min[index],
      rainChance: daily.precipitation_probability_max[index] || 0,
      rainfall: daily.precipitation_sum[index] || 0,
    }));

    const weeklyRainfall = forecast.reduce(
      (total, day) => total + Number(day.rainfall || 0),
      0
    );

    const maxRainChance = Math.max(
      ...forecast.map((day) => Number(day.rainChance || 0))
    );

    const advisories = generateAdvisories({
      currentTemperature: Number(current.temperature_2m),
      currentHumidity: Number(current.relative_humidity_2m),
      currentWindSpeed: Number(current.wind_speed_10m),
      maxRainChance,
      weeklyRainfall,
    });

    return res.status(200).json({
      message: "Weather forecast fetched successfully.",
      farm: {
        id: farm.id,
        farmName: farm.farm_name,
        location: farm.location,
      },
      location: {
        displayName: resolvedLocation,
        latitude,
        longitude,
      },
      current: {
        temperature: current.temperature_2m,
        humidity: current.relative_humidity_2m,
        windSpeed: current.wind_speed_10m,
        weatherCode: current.weather_code,
        weatherDescription: getWeatherDescription(current.weather_code),
        icon: getWeatherIcon(current.weather_code),
      },
      weeklyRainfall: Number(weeklyRainfall.toFixed(2)),
      maxRainChance,
      forecast,
      advisories,
    });
  } catch (error) {
    console.error("Farm weather error:", error);

    return res.status(500).json({
      message: error.message || "Could not fetch farm weather forecast.",
    });
  }
};

/*
  GET /api/weather/location?location=Nashik

  Useful for testing a location without creating/selecting a farm.
*/
const getWeatherByLocation = async (req, res) => {
  try {
    const { location } = req.query;

    if (!location || !location.trim()) {
      return res.status(400).json({
        message: "Please provide a location. Example: ?location=Nashik",
      });
    }

    const coordinates = await getCoordinatesFromLocation(location);
    const weatherData = await getOpenMeteoWeather(
      coordinates.latitude,
      coordinates.longitude
    );

    const current = weatherData.current;
    const daily = weatherData.daily;

    const forecast = daily.time.map((date, index) => ({
      date,
      day: new Date(`${date}T12:00:00`).toLocaleDateString("en-IN", {
        weekday: "short",
      }),
      weatherCode: daily.weather_code[index],
      weatherDescription: getWeatherDescription(daily.weather_code[index]),
      icon: getWeatherIcon(daily.weather_code[index]),
      temperatureMax: daily.temperature_2m_max[index],
      temperatureMin: daily.temperature_2m_min[index],
      rainChance: daily.precipitation_probability_max[index] || 0,
      rainfall: daily.precipitation_sum[index] || 0,
    }));

    const weeklyRainfall = forecast.reduce(
      (total, day) => total + Number(day.rainfall || 0),
      0
    );

    const maxRainChance = Math.max(
      ...forecast.map((day) => Number(day.rainChance || 0))
    );

    const advisories = generateAdvisories({
      currentTemperature: Number(current.temperature_2m),
      currentHumidity: Number(current.relative_humidity_2m),
      currentWindSpeed: Number(current.wind_speed_10m),
      maxRainChance,
      weeklyRainfall,
    });

    return res.status(200).json({
      message: "Weather forecast fetched successfully.",
      location: {
        displayName: coordinates.resolvedLocation,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      },
      current: {
        temperature: current.temperature_2m,
        humidity: current.relative_humidity_2m,
        windSpeed: current.wind_speed_10m,
        weatherCode: current.weather_code,
        weatherDescription: getWeatherDescription(current.weather_code),
        icon: getWeatherIcon(current.weather_code),
      },
      weeklyRainfall: Number(weeklyRainfall.toFixed(2)),
      maxRainChance,
      forecast,
      advisories,
    });
  } catch (error) {
    console.error("Location weather error:", error);

    return res.status(500).json({
      message: error.message || "Could not fetch location weather forecast.",
    });
  }
};

module.exports = {
  getFarmWeather,
  getWeatherByLocation,
};