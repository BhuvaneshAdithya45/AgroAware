process.env.HTTP_PROXY = "";
process.env.HTTPS_PROXY = "";
process.env.ALL_PROXY = "";
process.env.NO_PROXY = "localhost,127.0.0.1";

import { configDotenv } from "dotenv";
configDotenv();



import express from "express";
import fetch from "node-fetch";
import Groq from "groq-sdk";
import multer from "multer";
import FormData from "form-data";
import fs from "fs";

const upload = multer({ dest: "uploads/" });

// Initialize Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "dummy_key",
});

const DEFAULT_MODEL = "llama-3.3-70b-versatile";

// Scheme context data
const schemesContext = `
GOVERNMENT AGRICULTURAL SCHEMES FOR INDIAN FARMERS:

1. PM-KISAN: ₹6,000 per year to farmers with agricultural land (eligibility: ₹2 lakh income limit)
2. PMFBY: Crop insurance coverage up to 150% of crop value, premium 1.5-5% of sum insured
3. SMAM: 50-80% subsidy on farm machinery (tractors, harvesters, pumps)
4. NABARD: Agricultural loans at 4-7% interest with government subsidy on interest
5. KCC: Kisan Credit Card with credit limit up to ₹3 lakh at low interest
6. Soil Health Card: Free soil testing with nutrient recommendations
7. Zero Budget Natural Farming: ₹10,000-50,000 subsidy for organic farming (select states)
8. Mission Green Farming: ₹1,000-5,000 per hectare subsidy on green manuring
9. Dairy Enterprise: ₹15,000-50,000 subsidy on dairy equipment
10. Poly House Farming: 30-50% subsidy on poly house construction (up to ₹10 lakh)
11. PMKSY Irrigation: Subsidy on drip irrigation (40-60%), sprinkler systems
12. Agricultural Storage: 50% subsidy on farm storage facility
13. e-NAM: Digital platform for direct crop sales without middleman commission
14. ATMA: Free training on crop varieties, pest management, organic farming
15. Women Farmer Schemes: Extra subsidy 15-20% on machinery for female farmers
16. Organic Certification: 25-50% subsidy on certification (up to ₹10,000)
17. Agricultural Export Policy: Export subsidies, logistics support, quality certification

For detailed eligibility, benefits, and application process, use the Schemes page in AgroAware.
`;

function isSchemeQuestion(question) {
  const schemeKeywords = ["scheme", "subsidy", "grant", "loan", "support", "योजना", "सब्सिडी", "ऋण", "मदद", "ಯೋಜನೆ", "ಅರ್ಹತೆ", "లాభాలు", "పథక", "సబ్సిడీ", "ఋణ", "திட்டம்", "மானியம்", "கடன்"];
  const lowerQ = question.toLowerCase();
  return schemeKeywords.some(keyword => lowerQ.includes(keyword));
}

async function tryRag(question) {
  try {
    const res = await fetch("http://127.0.0.1:8000/rag/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });

    const data = await res.json();

    // Simple quality check: enough context text
    if (
      data.status === "success" &&
      data.context &&
      data.context.length > 300
    ) {
      return data.context;
    }

    return null;
  } catch (e) {
    return null; // silently fallback to normal chat
  }
}

const router = express.Router();

/* -------------------- TRANSLATION SERVICE -------------------- */
router.post("/translate", async (req, res) => {
  const { text, targetLang } = req.body;

  if (!text || !targetLang) {
    return res.status(400).json({ error: "Text and targetLang are required" });
  }

  try {
    const prompt = `You are a professional translator. Translate the following text into ${targetLang}. Output ONLY the translated text, no introductory or concluding remarks. Text: ${text}`;

    const response = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: DEFAULT_MODEL,
    });

    res.json({ translatedText: response.choices[0].message.content.trim() });
  } catch (err) {
    console.error("Translation error:", err.message);
    res.status(500).json({ error: "Translation failed" });
  }
});



/* -------------------- GROQ CHATBOT -------------------- */
router.post("/chat", async (req, res) => {
  const { question, language } = req.body;

  try {
    // 1️⃣ Try RAG first
    const ragContext = await tryRag(question);

    // 2️⃣ Detect if question is about schemes
    const isSchemeQuery = isSchemeQuestion(question);

    let prompt;
    let systemPrompt = "You are AgroAware, an agriculture advisory assistant for Indian farmers.";

    if (ragContext) {
      // 📄 Document-grounded prompt
      systemPrompt += " Answer the question strictly using the provided document context. Do NOT add outside knowledge.";
      prompt = `
DOCUMENT CONTEXT:
${ragContext}

QUESTION:
${question}

Instructions: Keep it simple and farmer-friendly. Translate the final answer fully into ${language}. Output ONLY in ${language}.
`;
    } else if (isSchemeQuery) {
      // 🏛️ Scheme-specific prompt
      prompt = `
The user is asking about government agricultural schemes.
Use the scheme information provided to give a helpful answer.

${schemesContext}

Rules:
1. Explain schemes in simple, farmer-friendly language.
2. Focus on eligibility, benefits, and how to apply.
3. Suggest visiting the official websites or calling numbers for exact details.
4. Recommend checking the Schemes page in AgroAware for personalized recommendations.
5. Keep answers short and practical.
6. Translate the final answer fully into ${language}.
7. Output ONLY in ${language}.

Question: ${question}
`;
    } else {
      // 🌾 Normal farming chatbot prompt
      prompt = `
Rules:
1. Give accurate, simple agricultural guidance.
2. Keep answers short and practical.
3. Translate the final answer fully into ${language}.
4. Output ONLY in ${language}.

Question: ${question}
`;
    }

    const response = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      model: DEFAULT_MODEL,
    });

    const answer = response.choices[0].message.content.trim();

    res.json({
      answer,
      source: ragContext ? "document" : isSchemeQuery ? "schemes" : "general",
    });
  } catch (err) {
    console.error("❌ Chat error detail:", err);
    res.status(500).json({
      error: "Chat service failed",
      details: err.message,
      hint: err.message.includes("API_KEY") ? "Check your GROQ_API_KEY in .env" : "Unknown error [V2.0]"
    });
  }
});


/* -------------------- AI POSTER GENERATOR -------------------- */
router.post("/poster", async (req, res) => {
  const { topic, language } = req.body;

  if (!topic) {
    return res.status(400).json({ error: "Topic is required" });
  }

  try {
    // 1️⃣ Generate poster caption using Groq
    const captionPrompt = `
You are a farming awareness poster designer for Indian farmers.
Create a short, impactful awareness poster content for the topic: "${topic}"

Rules:
1. Generate a catchy TITLE (max 8 words)
2. Generate 3-4 short bullet points (max 10 words each)
3. Generate a motivational SLOGAN (max 12 words)
4. Keep language simple, farmer-friendly
5. Include practical actionable advice
6. Output ONLY in ${language || "English"}
7. Format as JSON: {"title": "...", "bullets": ["...", "..."], "slogan": "..."}
8. Output ONLY the JSON code block, nothing else.
`;

    let caption;
    let source = "genai";

    try {
      const response = await groq.chat.completions.create({
        messages: [{ role: "user", content: captionPrompt }],
        model: DEFAULT_MODEL,
      });

      const raw = response.choices[0].message.content.trim();
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      caption = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (aiErr) {
      console.warn("⚠️ Groq poster text failed (using fallback):", aiErr.message?.substring(0, 80));
      caption = null;
      source = "fallback";
    }

    // Fallback pre-built poster content when Gemini is unavailable
    if (!caption) {
      const fallbackPosters = {
        'soil': {
          title: "Healthy Soil, Healthy Life",
          bullets: ["Use compost and organic manure", "Avoid chemical overuse", "Practice crop rotation", "Test soil regularly"],
          slogan: "Nurture the soil, it will nurture you!"
        },
        'water': {
          title: "Every Drop Counts",
          bullets: ["Use drip irrigation to save water", "Harvest rainwater for dry seasons", "Mulch crops to reduce evaporation", "Avoid flood irrigation"],
          slogan: "Save water today, grow food tomorrow!"
        },
        'organic': {
          title: "Go Organic, Go Natural",
          bullets: ["Avoid chemical pesticides", "Use neem-based solutions", "Compost kitchen waste", "Grow cover crops"],
          slogan: "Organic farming: good for you, great for earth!"
        },
        'tree': {
          title: "Plant Trees, Grow Prosperity",
          bullets: ["Trees prevent soil erosion", "Agroforestry boosts income", "Trees attract rain", "Shade protects crops"],
          slogan: "A tree planted today feeds generations tomorrow!"
        },
        'bee': {
          title: "Save Bees, Save Agriculture",
          bullets: ["Bees pollinate 75% of crops", "Avoid harmful pesticides", "Plant native flowers", "Support local beekeepers"],
          slogan: "No bees, no food — protect our pollinators!"
        },
        'sustain': {
          title: "Farm Smart, Farm Sustainable",
          bullets: ["Rotate crops each season", "Use natural pest control", "Conserve water resources", "Reduce chemical inputs"],
          slogan: "Sustainable farming today, food security forever!"
        },
        'pest': {
          title: "Protect Your Crops Naturally",
          bullets: ["Use neem oil spray for insects", "Practice companion planting", "Remove infected plants early", "Encourage beneficial insects"],
          slogan: "Healthy crops start with smart protection!"
        }
      };

      // Build a dynamic fallback using the actual topic name
      const topicKey = topic.toLowerCase();
      let fallbackKey = null;
      if (topicKey.includes('soil')) fallbackKey = 'soil';
      else if (topicKey.includes('water') || topicKey.includes('irrigation')) fallbackKey = 'water';
      else if (topicKey.includes('organic')) fallbackKey = 'organic';
      else if (topicKey.includes('tree') || topicKey.includes('forest')) fallbackKey = 'tree';
      else if (topicKey.includes('bee') || topicKey.includes('pollinator')) fallbackKey = 'bee';
      else if (topicKey.includes('sustain')) fallbackKey = 'sustain';
      else if (topicKey.includes('pest') || topicKey.includes('disease')) fallbackKey = 'pest';

      if (fallbackKey) {
        caption = fallbackPosters[fallbackKey];
      } else {
        // Use the actual topic name for custom topics
        const topicName = topic.charAt(0).toUpperCase() + topic.slice(1);
        caption = {
          title: `Best Practices: ${topicName}`,
          bullets: ["Choose the right season and climate", "Use quality seeds and proper spacing", "Apply balanced fertilizer schedule", "Monitor crops and control pests early"],
          slogan: `Grow better ${topicName.toLowerCase()}, grow a better future!`
        };
      }
    }

    // 2️⃣ Use curated Unsplash images mapped to topics
    const topicLower = topic.toLowerCase();
    const farmImages = {
      soil: [
        'photo-1625246333195-78d9c38ad449',
        'photo-1500382017468-9049fed747ef',
        'photo-1574943320219-553eb213f72d',
      ],
      water: [
        'photo-1473448912268-2022ce9509d8',
        'photo-1501004318855-6e60ba4ce90c',
        'photo-1559827291-bab1413b425b',
      ],
      organic: [
        'photo-1574943320219-553eb213f72d',
        'photo-1464226184884-fa280b87c399',
        'photo-1592982537447-6f2a6a0c7c11',
      ],
      tree: [
        'photo-1441974231531-c6227db76b6e',
        'photo-1513836279014-a89f7a76ae86',
        'photo-1542601906990-b4d3fb778b09',
      ],
      bee: [
        'photo-1558642452-9d2a7deb7f62',
        'photo-1490750967868-88aa4f44baee',
        'photo-1457530378978-8bac673b8062',
      ],
      tomato: [
        'photo-1592841200221-a6898f307baa', // tomatoes on vine
        'photo-1546094096-0df4bcaaa337', // fresh tomatoes
        'photo-1561136594-7f68413baa99', // tomato harvest
      ],
      rice: [
        'photo-1559827291-bab1413b425b', // rice paddy
        'photo-1536304993881-070c01b39a27', // rice field
        'photo-1504973960431-1c1c6a586c5e', // rice harvest
      ],
      wheat: [
        'photo-1574323347407-f5e1ad6d020b', // wheat field
        'photo-1437252611977-07f74518abd7', // golden wheat
        'photo-1506744038136-46273834b3fb', // wheat landscape
      ],
      vegetable: [
        'photo-1540420773420-3366772f4999', // fresh vegetables
        'photo-1566385101042-1a0aa4c1c900', // veggie market
        'photo-1488459716781-31db52582fe9', // vegetable garden
      ],
      fruit: [
        'photo-1619566636858-adf3ef46400b', // fruit harvest
        'photo-1488459716781-31db52582fe9', // fruit farm
        'photo-1464226184884-fa280b87c399', // fresh fruits
      ],
      pest: [
        'photo-1416879595882-3373a0480b5b', // crop field
        'photo-1625246333195-78d9c38ad449', // healthy crops
        'photo-1500382017468-9049fed747ef', // farmland
      ],
      default: [
        'photo-1625246333195-78d9c38ad449',
        'photo-1500382017468-9049fed747ef',
        'photo-1464226184884-fa280b87c399',
      ]
    };

    let category = 'default';
    if (topicLower.includes('tomato')) category = 'tomato';
    else if (topicLower.includes('rice') || topicLower.includes('paddy')) category = 'rice';
    else if (topicLower.includes('wheat') || topicLower.includes('grain')) category = 'wheat';
    else if (topicLower.includes('vegetable') || topicLower.includes('veggie')) category = 'vegetable';
    else if (topicLower.includes('fruit') || topicLower.includes('mango') || topicLower.includes('banana')) category = 'fruit';
    else if (topicLower.includes('soil')) category = 'soil';
    else if (topicLower.includes('water') || topicLower.includes('irrigation')) category = 'water';
    else if (topicLower.includes('organic')) category = 'organic';
    else if (topicLower.includes('tree') || topicLower.includes('forest')) category = 'tree';
    else if (topicLower.includes('bee') || topicLower.includes('pollinator')) category = 'bee';
    else if (topicLower.includes('pest') || topicLower.includes('disease')) category = 'pest';
    // For any farming/crop topic, show relevant crop images
    else if (topicLower.includes('farm') || topicLower.includes('crop') || topicLower.includes('plant') || topicLower.includes('grow') || topicLower.includes('harvest')) category = 'vegetable';

    const photos = farmImages[category];
    const picked = photos[Math.floor(Math.random() * photos.length)];
    // Serve via our own proxy to avoid CORS issues in the browser
    const imageUrl = `/api/advisory/poster-image?id=${encodeURIComponent(picked)}`;

    res.json({
      caption,
      imageUrl,
      topic,
      source
    });
  } catch (err) {
    console.error("Poster generation error:", err.message);
    res.status(500).json({ error: "Poster generation failed" });
  }
});


/* -------------------- IMAGE PROXY (Avoids CORS) -------------------- */
router.get("/poster-image", async (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: "Missing image id" });

  try {
    const unsplashUrl = `https://images.unsplash.com/${id}?w=1024&h=768&fit=crop&q=80`;
    const imgRes = await fetch(unsplashUrl);

    if (!imgRes.ok) {
      throw new Error(`Unsplash returned ${imgRes.status}`);
    }

    // Forward content-type and pipe the image data
    res.set('Content-Type', imgRes.headers.get('content-type') || 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=86400'); // Cache for 24h

    // Convert to buffer and send
    const buffer = await imgRes.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error("Image proxy error:", err.message);
    // Return a 1x1 transparent pixel as fallback
    res.set('Content-Type', 'image/png');
    res.send(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64'));
  }
});

/* -------------------- RAG UPLOAD PROXY -------------------- */
router.post("/rag-upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    const mlUrl = process.env.ML_URL || "http://127.0.0.1:8000";
    const formData = new FormData();
    formData.append("file", fs.createReadStream(req.file.path), {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const mlResponse = await fetch(`${mlUrl}/rag/upload`, {
      method: "POST",
      body: formData,
      headers: formData.getHeaders(),
    });

    const data = await mlResponse.json();

    // Clean up local temp file
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

    if (mlResponse.ok) {
      res.json(data);
    } else {
      res.status(mlResponse.status).json(data);
    }
  } catch (err) {
    console.error("RAG upload error:", err.message);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: "Failed to proxy RAG upload. Make sure ML service is running on port 8000." });
  }
});


/* -------------------- CROP ADVISORY (ML SERVICE) -------------------- */
router.post("/crop", async (req, res) => {
  try {
    const payload = req.body;
    // 1. Get crop prediction
    const predictResponse = await fetch("http://127.0.0.1:8000/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!predictResponse.ok) {
      const text = await predictResponse.text();
      throw new Error(`ML prediction failed: ${predictResponse.status} ${text}`);
    }

    const mlData = await predictResponse.json();

    if (mlData.status === "error") {
      return res.status(200).json({
        message: mlData.message,
        predicted_crop: null,
      });
    }

    // 2. Get fertilizer recommendation using predicted crop
    let fertilizerData = null;
    try {
      const fertilizerResponse = await fetch("http://127.0.0.1:8000/fertilizer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          crop: mlData.predicted_crop,
          N: payload.N,
          P: payload.P,
          K: payload.K,
        }),
      });

      if (fertilizerResponse.ok) {
        fertilizerData = await fertilizerResponse.json();
      }
    } catch (fertErr) {
      console.warn("Fertilizer fetch failed (non-fatal):", fertErr.message);
    }

    // 3. Combine both responses
    res.json({
      ...mlData,
      fertilizer: fertilizerData,
    });
  } catch (err) {
    console.error("CROP ADVISORY ERROR:", err.message);
    console.error("STACK:", err.stack);

    res.status(500).json({
      error: err.message || "Crop advisory service failed",
    });
  }
});

export default router;
