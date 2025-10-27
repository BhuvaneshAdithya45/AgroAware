import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import recommendRoutes from "./routes/recommend.js";
import seasonalRoutes from "./routes/seasonal.js";  

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/advisory/seasonal", seasonalRoutes);
mongoose.connect(process.env.MONGO_URI).then(()=>console.log("MongoDB connected"));

app.get("/", (req,res)=>res.json({status:"ok", service:"AgroAware API"}));
app.use("/api/auth", authRoutes);
app.use("/api/advisory", recommendRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=>console.log("Server running on", PORT));
