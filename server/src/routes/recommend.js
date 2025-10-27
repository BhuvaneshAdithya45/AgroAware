import express from "express";
import axios from "axios";
import auth from "../middleware/auth.js";
import AdvisoryLog from "../models/AdvisoryLog.js";
import { recommendFertilizer } from "../utils/fertilizer.js";

const router = express.Router();
const ML_API = process.env.ML_API_URL || "http://localhost:8000";

router.post("/crop", auth, async (req, res) => {
  try {
    const { N, P, K, ph, temperature, rainfall } = req.body;

    // Call ML API
    const { data } = await axios.post(`${ML_API}/predict`, { N, P, K, ph, temperature, rainfall });
    console.log("ML response ->", data); // DEBUG
    const crop = data.recommended_crop;  // ✅ correct field
    const confidence = data.confidence;  // ✅ correct field
    console.log("Using crop ->", crop);  // DEBUG

    const fertilizer = recommendFertilizer({ N, P, K, ph }, crop);

    // Save advisory log
    const log = await AdvisoryLog.create({
      userId: req.user.uid,
      input: { N, P, K, ph, temperature, rainfall },
      output: { recommended_crop: crop, confidence, fertilizer }
    });

    // Send final result to frontend
    return res.json({ recommended_crop: crop, confidence, fertilizer, logId: log._id });
  } catch (error) {
    console.error(error?.response?.data || error);
    return res.status(500).json({ error: "Failed to get recommendation" });
  }
});

export default router; 