// server/src/routes/recommend.js
import express from "express";
import axios from "axios";

const router = express.Router();

// required numeric fields expected by ML service
const REQUIRED_FIELDS = ["N", "P", "K", "ph", "temperature", "rainfall"];

// ML service base URL (can override with env var)
const ML_BASE = process.env.ML_SERVICE_URL || "http://localhost:8800";

// helper to check numbers
function isNumberLike(v) {
  return v !== null && v !== undefined && !Number.isNaN(Number(v));
}

/* ============ GET /list - Seasonal metadata ============ */
router.get("/list", async (req, res) => {
  try {
    // Forward to seasonal service
    const response = await axios.get("http://localhost:5000/api/advisory/seasonal/list", {
      timeout: 5000
    });
    return res.json(response.data);
  } catch (err) {
    console.error("Error fetching seasonal metadata:", err?.message);
    return res.status(500).json({ error: "Failed to fetch seasonal data" });
  }
});

router.post("/crop", async (req, res) => {
  try {
    const body = req.body || {};

    // Build payload with exactly the keys ML expects
    // Accept lowercase keys too (robustness)
    const normalized = {};
    for (const key of REQUIRED_FIELDS) {
      // support both uppercase/lowercase incoming (just in case)
      let value = body[key];
      if (value === undefined) value = body[key.toLowerCase()];
      normalized[key] = value;
    }

    // Validate presence + numeric
    const missing = [];
    const notNumber = [];
    for (const k of REQUIRED_FIELDS) {
      if (normalized[k] === undefined || normalized[k] === null || normalized[k] === "") {
        missing.push(k);
      } else if (!isNumberLike(normalized[k])) {
        notNumber.push(k);
      }
    }

    if (missing.length > 0 || notNumber.length > 0) {
      return res.status(400).json({
        error: "Validation failed",
        details: {
          missing,
          notNumber
        },
        // echo what we received so you can debug quickly
        received: req.body
      });
    }

    // Convert to numbers (ML expects numeric types)
    const payload = {};
    for (const k of REQUIRED_FIELDS) payload[k] = Number(normalized[k]);

    // Debug log so you can inspect what Node will send to ML
    console.log("Calling ML service with payload:", payload);

    // call ML service predict endpoint
    const mlUrl = `${ML_BASE.replace(/\/$/, "")}/predict`; // ensures no double slashes
    const { data } = await axios.post(mlUrl, payload, {
      headers: { "Content-Type": "application/json" },
      timeout: 15000
    });

    // send result back to frontend
    return res.json(data);
  } catch (err) {
    console.error("Error in /api/advisory/crop:", err?.message || err);
    // if ML responded with details, forward useful bits
    if (err.response?.data) {
      return res.status(err.response.status || 500).json({
        error: "ML service error",
        mlResponse: err.response.data
      });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
});

/* ============ GET /weather - Real-time weather ============ */
router.get("/weather", async (req, res) => {
  try {
    const { district } = req.query;
    if (!district) {
      return res.status(400).json({ error: "District parameter required" });
    }

    const apiKey = process.env.WEATHER_API_KEY || "cfedd2b10c42dd82a683ed537be2b883";
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(district)}&appid=${apiKey}&units=metric`;
    
    const { data } = await axios.get(weatherUrl, { timeout: 10000 });
    
    return res.json({
      district: data.name,
      temperature: data.main.temp,
      humidity: data.main.humidity,
      rainfall: data.clouds.all,
      description: data.weather[0].description
    });
  } catch (err) {
    console.error("Error fetching weather:", err?.message);
    return res.status(500).json({ error: "Failed to fetch weather data" });
  }
});

export default router;