import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import authRoutes from "./src/routes/auth.js";
import recommendRoutes from "./src/routes/recommend.js";
import seasonalRoutes from "./src/routes/seasonal.js";
import advisoryRoutes from "./src/routes/advisory.js";
import feedbackRoutes from "./src/routes/feedback.js";
import auth from "./src/middleware/auth.js";

dotenv.config();

const app = express();

/* ---------------------- Basic Security & Logging ---------------------- */
app.use(helmet()); // secure HTTP headers

// log requests in development
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// trust reverse proxies (only if needed)
if (String(process.env.TRUST_PROXY).toLowerCase() === "true") {
  app.set("trust proxy", 1);
}

/* ---------------------- CORS ---------------------- */
/*
  FRONTEND_URL can contain one or more comma-separated URLs.
  Example:
    FRONTEND_URL=http://localhost:5173,http://127.0.0.1:5173
*/
const rawOrigins = process.env.FRONTEND_URL || "http://localhost:5173";
const allowedOrigins = rawOrigins
  .split(",")
  .map((s) => s.trim().replace(/\/$/, ""))
  .filter(Boolean);

function normalizeOrigin(origin) {
  if (!origin) return origin;
  try {
    const u = new URL(origin);
    return `${u.protocol}//${u.hostname}${u.port ? `:${u.port}` : ""}`;
  } catch {
    return origin.trim().replace(/\/$/, "");
  }
}

// Expand common local hostnames so `localhost` and `127.0.0.1` are both allowed
function expandLocalVariants(origins) {
  const extra = [];
  for (const o of origins) {
    try {
      const u = new URL(o);
      if (u.hostname === "localhost") {
        extra.push(`${u.protocol}//127.0.0.1${u.port ? `:${u.port}` : ""}`);
      }
      if (u.hostname === "127.0.0.1") {
        extra.push(`${u.protocol}//localhost${u.port ? `:${u.port}` : ""}`);
      }
    } catch {
      // ignore parse errors
    }
  }
  return [...new Set([...origins, ...extra])];
}

const expandedAllowed = expandLocalVariants(allowedOrigins);
const normalizedAllowed = expandedAllowed.map(normalizeOrigin);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow curl, Postman, mobile apps
      const norm = normalizeOrigin(origin);
      if (normalizedAllowed.includes(norm)) return callback(null, true);
      console.warn(`🚫 CORS blocked for origin: ${origin}`);
      return callback(new Error("CORS blocked: origin not allowed"));
    },
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

/* ---------------------- Rate Limiting & Body Parsing ---------------------- */
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: Number(process.env.RATE_LIMIT) || 100, // max requests per minute
});
app.use(limiter);

// parse JSON body (limit to 50kb)
app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ extended: true }));

/* ---------------------- Routes ---------------------- */

// Auth (public — no middleware)
app.use("/api/auth", authRoutes);

// 🔹 ML crop recommendation (protected)
app.use("/api/recommend", auth, recommendRoutes);

// 🔹 Seasonal crop info (protected)
app.use("/api/advisory/seasonal", auth, seasonalRoutes);

// 🔹 Poster image proxy (public — no auth needed for <img> tags)
app.get("/api/advisory/poster-image", async (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: "Missing image id" });

  // Override Helmet's CORP/CORS headers so <img> tags can load cross-origin
  res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  res.set('Access-Control-Allow-Origin', '*');

  try {
    const unsplashUrl = `https://images.unsplash.com/${id}?w=1024&h=768&fit=crop&q=80`;
    const imgRes = await fetch(unsplashUrl);
    if (!imgRes.ok) throw new Error(`Unsplash returned ${imgRes.status}`);
    res.set('Content-Type', imgRes.headers.get('content-type') || 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=86400');
    const buffer = await imgRes.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error("Image proxy error:", err.message);
    res.set('Content-Type', 'image/png');
    res.send(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64'));
  }
});

// 🔹 Advisory chatbot + RAG + crop ML bridge (protected)
app.use("/api/advisory", auth, advisoryRoutes);

// 🔹 User feedback on AI answers (auth optional — for user tracking)
app.use("/api/feedback", feedbackRoutes);


// Health check route
app.get("/", async (req, res) => {
  let mlStatus = "unknown";
  try {
    const mlRes = await fetch(`${process.env.ML_URL || "http://localhost:8000"}/health`);
    if (mlRes.ok) mlStatus = "online";
  } catch {
    mlStatus = "offline";
  }

  const geminiConfigured = process.env.GEMINI_API_KEY &&
    process.env.GEMINI_API_KEY !== "your_gemini_api_key_here" &&
    !process.env.GEMINI_API_KEY.includes("placeholder");

  res.json({
    status: "ok",
    service: "AgroAware API",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    ml_service: mlStatus,
    ai_advisor: geminiConfigured ? "configured" : "missing_key",
    env: process.env.NODE_ENV || "development",
  });
});

/* ---------------------- Error Handling ---------------------- */
// 404
app.use((req, _res, next) => {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// Central error handler
app.use((err, req, res, _next) => {
  console.error("⚠ Unhandled error:", err.message);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
});

/* ---------------------- MongoDB Connection & Server Start ---------------------- */
const PORT = Number(process.env.PORT || 5000);
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ Missing MONGO_URI in .env — cannot start server");
  process.exit(1);
}

async function start() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected successfully");

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
      console.log("🌍 Allowed CORS origins:", allowedOrigins);
    });

    // graceful shutdown
    const shutdown = async () => {
      console.log("🛑 Shutting down server...");
      await mongoose.disconnect();
      server.close(() => {
        console.log("✅ Server closed gracefully");
        process.exit(0);
      });
    };
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

start();

export default app;