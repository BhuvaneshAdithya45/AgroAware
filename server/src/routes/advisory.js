import { configDotenv } from "dotenv";
configDotenv();
import express from "express";
import Groq from "groq-sdk";
const router = express.Router();

const key = "###########"; // Add your groq API Key
const groq = new Groq({ apiKey: key });

router.post("/chat", async (req, res) => {
  const { question, language } = req.body;
  try {
    const prompt = `
        You are AgroAware, an agriculture advisory assistant for Indian farmers.
        Your job:
        1. Give accurate, simple agricultural guidance with small description.
        2. Translate the final answer fully into ${language}.
        3. Keep answers short, clear, practical for real farmers and farmer-friendly.
        4. Translate internally but output ONLY in ${language} language.
        Question: ${question}
    `;

    const completion = await groq.chat.completions.create({
      //   model: "llama3-8b-8192",
      model: "moonshotai/kimi-k2-instruct-0905",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
    });

    const answer = completion.choices[0].message.content;

    res.json({ answer });
  } catch (err) {
    console.log("Groq Error:", err);
    res.status(500).json({ error: "Advisory service failed" });
  }
});

export default router;
