process.env.HTTP_PROXY = "";
process.env.HTTPS_PROXY = "";
process.env.ALL_PROXY = "";
process.env.NO_PROXY = "localhost,127.0.0.1";

import { configDotenv } from "dotenv";
configDotenv();



import express from "express";
import fetch from "node-fetch";
import Groq from "groq-sdk";

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
  const schemeKeywords = ["scheme", "subsidy", "grant", "loan", "support", "योजना", "सब्सिडी", "ऋण", "मदद", "ಯೋಜನೆ", "ಅರ್ಹತೆ", "లాభాలు", "పథక", "సబ్సిడీ", "ఋణ"];
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
    const completion = await groq.chat.completions.create({
      model: "moonshotai/kimi-k2-instruct-0905",
      messages: [
        { role: "system", content: "You are a professional translator. Translate the following text into " + targetLang + ". Output ONLY the translated text, no introductory or concluding remarks." },
        { role: "user", content: text }
      ],
      temperature: 0.3,
    });

    res.json({ translatedText: completion.choices[0].message.content.trim() });
  } catch (err) {
    console.error("Translation error:", err.message);
    res.status(500).json({ error: "Translation failed" });
  }
});



/* -------------------- GROQ CHATBOT -------------------- */
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

router.post("/chat", async (req, res) => {
  const { question, language } = req.body;

  try {
    // 1️⃣ Try RAG first
    const ragContext = await tryRag(question);

    // 2️⃣ Detect if question is about schemes
    const isSchemeQuery = isSchemeQuestion(question);

    let prompt;

    if (ragContext) {
      // 📄 Document-grounded prompt
      prompt = `
You are AgroAware, an agriculture advisory assistant.

Answer the question strictly using the following document context.
Do NOT add outside knowledge.
Keep it simple and farmer-friendly.
Translate the final answer fully into ${language}.

DOCUMENT CONTEXT:
${ragContext}

QUESTION:
${question}
`;
    } else if (isSchemeQuery) {
      // 🏛️ Scheme-specific prompt
      prompt = `
You are AgroAware, an agriculture advisory assistant for Indian farmers.

The user is asking about government agricultural schemes.
Use the scheme information provided to give a helpful answer.

${schemesContext}

Rules:
1. Explain schemes in simple, farmer-friendly language.
2. Focus on eligibility, benefits, and how to apply.
3. Suggest visiting the official websites or calling the given numbers for exact details.
4. Recommend checking the Schemes page in AgroAware for personalized scheme recommendations.
5. Keep answers short and practical.
6. Translate the final answer fully into ${language}.
7. Output ONLY in ${language}.

Question: ${question}
`;
    } else {
      // 🌾 Normal farming chatbot prompt
      prompt = `
You are AgroAware, an agriculture advisory assistant for Indian farmers.

Rules:
1. Give accurate, simple agricultural guidance.
2. Keep answers short and practical.
3. Translate the final answer fully into ${language}.
4. Output ONLY in ${language}.

Question: ${question}
`;
    }

    const completion = await groq.chat.completions.create({
      model: "moonshotai/kimi-k2-instruct-0905",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    res.json({
      answer: completion.choices[0].message.content,
      source: ragContext ? "document" : isSchemeQuery ? "schemes" : "general",
    });
  } catch (err) {
    console.error("Chat error:", err.response?.data || err.message);
    res.status(500).json({ error: "Chat service failed" });
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
8. Output ONLY the JSON, nothing else.
`;

    const completion = await groq.chat.completions.create({
      model: "moonshotai/kimi-k2-instruct-0905",
      messages: [{ role: "user", content: captionPrompt }],
      temperature: 0.7,
    });

    let caption;
    try {
      const raw = completion.choices[0].message.content.trim();
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      caption = jsonMatch ? JSON.parse(jsonMatch[0]) : { title: topic, bullets: [], slogan: "Grow more, grow better!" };
    } catch {
      caption = { title: topic, bullets: ["Practice sustainable farming"], slogan: "Grow more, grow better!" };
    }

    // 2️⃣ Generate poster image using Pollinations.ai (free, no API key)
    const imagePrompt = `Indian farming awareness poster about ${topic}, vibrant colors, agricultural scene, crops, farmer working in field, nature, professional infographic style, no text on image`;
    const encodedPrompt = encodeURIComponent(imagePrompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=768&seed=${Date.now()}&nologo=true`;

    res.json({
      caption,
      imageUrl,
      topic,
      source: "genai"
    });
  } catch (err) {
    console.error("Poster generation error:", err.message);
    res.status(500).json({ error: "Poster generation failed" });
  }
});


/* -------------------- CROP ADVISORY (ML SERVICE) -------------------- */
router.post("/crop", async (req, res) => {
  try {
    const payload = req.body;
    // 1. Get crop prediction
    const predictResponse = await fetch("http://127.0.0.1:8800/predict", {
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
      const fertilizerResponse = await fetch("http://127.0.0.1:8800/fertilizer", {
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
