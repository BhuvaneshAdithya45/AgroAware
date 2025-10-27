import express from "express";
import { seasonalCrops } from "../data/seasonalCrops.js";
const router = express.Router();

router.post("/recommend", (req, res) => {
  const { state, district, season } = req.body;

  try {
    const crops = seasonalCrops[state?.toLowerCase()]?.[district?.toLowerCase()]?.[season?.toLowerCase()];
    if (!crops) return res.status(404).json({ error: "No data available for selection" });

    return res.json({
      state,
      district,
      season,
      recommended_crops: crops
    });

  } catch (err) {
    return res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;