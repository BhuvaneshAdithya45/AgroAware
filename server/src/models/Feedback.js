import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
    // What feature generated this answer
    feature: {
        type: String,
        enum: ["chat", "voice", "rag", "poster", "crop_prediction"],
        required: true,
    },
    // The user's question
    question: { type: String, default: "" },
    // The AI's answer (truncated to save space)
    answer: { type: String, default: "" },
    // Rating: 1 = helpful, -1 = not helpful
    rating: { type: Number, enum: [1, -1], required: true },
    // Optional text feedback
    comment: { type: String, default: "" },
    // Language used
    language: { type: String, default: "en" },
    // User who gave feedback (optional — allows anonymous)
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    // Timestamp
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Feedback", feedbackSchema);
