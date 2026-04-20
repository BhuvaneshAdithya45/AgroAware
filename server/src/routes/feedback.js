import express from "express";
import rateLimit from "express-rate-limit";
import Feedback from "../models/Feedback.js";

const router = express.Router();

// Rate limit: max 10 feedback submissions per 15 minutes per IP
const feedbackLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: "Too many feedback submissions. Please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * POST /api/feedback
 * Body: { feature, question, answer, rating, comment, language }
 * Rating: 1 = helpful (thumbs up), -1 = not helpful (thumbs down)
 */
router.post("/", feedbackLimiter, async (req, res) => {
    try {
        const { feature, question, answer, rating, comment, language } = req.body;

        if (!feature || !rating) {
            return res.status(400).json({ error: "Feature and rating are required" });
        }

        if (![1, -1].includes(rating)) {
            return res.status(400).json({ error: "Rating must be 1 or -1" });
        }

        const feedback = await Feedback.create({
            feature,
            question: (question || "").slice(0, 500),
            answer: (answer || "").slice(0, 1000), // truncate to save DB space
            rating,
            comment: (comment || "").slice(0, 500),
            language: language || "en",
            userId: req.user?.uid || null,
        });

        res.json({ ok: true, id: feedback._id });
    } catch (err) {
        console.error("Feedback error:", err.message);
        res.status(500).json({ error: "Failed to save feedback" });
    }
});

/**
 * GET /api/feedback/stats
 * Returns aggregated feedback stats (for admin dashboard)
 */
router.get("/stats", async (req, res) => {
    try {
        const stats = await Feedback.aggregate([
            {
                $group: {
                    _id: "$feature",
                    totalFeedback: { $sum: 1 },
                    helpful: { $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] } },
                    notHelpful: { $sum: { $cond: [{ $eq: ["$rating", -1] }, 1, 0] } },
                },
            },
            { $sort: { totalFeedback: -1 } },
        ]);

        const total = stats.reduce((sum, s) => sum + s.totalFeedback, 0);
        const totalHelpful = stats.reduce((sum, s) => sum + s.helpful, 0);
        const trustScore = total > 0 ? Math.round((totalHelpful / total) * 100) : 0;

        res.json({
            trustScore,
            totalFeedback: total,
            byFeature: stats,
        });
    } catch (err) {
        console.error("Feedback stats error:", err.message);
        res.status(500).json({ error: "Failed to get stats" });
    }
});

export default router;
