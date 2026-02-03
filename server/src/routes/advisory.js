process.env.HTTP_PROXY = "";
process.env.HTTPS_PROXY = "";
process.env.ALL_PROXY = "";
process.env.NO_PROXY = "localhost,127.0.0.1";

import { configDotenv } from "dotenv";
configDotenv();



import express from "express";
import fetch from "node-fetch";
import Groq from "groq-sdk";


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

/* -------------------- GROQ CHATBOT -------------------- */
const groq = new Groq({
  apiKey: process.env.GROK_API_KEY,
});

router.post("/chat", async (req, res) => {
  const { question, language } = req.body;

  try {
    // 1️⃣ Try RAG first
    const ragContext = await tryRag(question);

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
      source: ragContext ? "document" : "general",
    });
  } catch (err) {
    console.error("Chat error:", err.response?.data || err.message);
    res.status(500).json({ error: "Chat service failed" });
  }
});


/* -------------------- CROP ADVISORY (ML SERVICE) -------------------- */
router.post("/crop", async (req, res) => {
  try {
    const payload = req.body;
    console.log("Calling ML service with payload:", payload);

const response = await fetch("http://127.0.0.1:8000/predict", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(payload),
});

if (!response.ok) {
  const text = await response.text();
  throw new Error(`ML service failed: ${response.status} ${text}`);
}

const mlData = await response.json();



    if (mlData.status === "error") {
      return res.status(200).json({
        message: mlData.message,
        predicted_crop: null,
      });
    }

    res.json(mlData);
  } catch (err) {
  console.error("AXIOS ERROR MESSAGE:", err.message);
  console.error("AXIOS ERROR CODE:", err.code);
  console.error("AXIOS ERROR RESPONSE:", err.response?.data);
  console.error("AXIOS ERROR STACK:", err.stack);

  res.status(500).json({
    error: err.response?.data || err.message,
  });
}

});

export default router;
