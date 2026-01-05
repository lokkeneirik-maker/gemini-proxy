// api/gemini.js

export default async function handler(req, res) {
  // CORS-headere
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "Missing imageBase64" });
    }

    // 🔥 EKTE GEMINI-KALL — RIKTIG MODELL
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text:
                    "You are reading a receipt. Extract ONLY the total amount and the store name. " +
                    "Return STRICT JSON like this: {\"amount\":\"123.45\",\"store\":\"Rema 1000\"}. " +
                    "Do not add explanations, comments, or extra text."
                },
                {
                  inlineData: {
                    mimeType: "image/jpeg",
                    data: imageBase64
                  }
                }
              ]
            }
          ]
        })
      }
    );

    const data = await geminiResponse.json();

    // Hent tekst fra Gemini
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return res.status(500).json({
        error: "No text returned from Gemini",
        raw: data
      });
    }

    // Prøv å parse JSON
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      return res.status(500).json({
        error: "Could not parse JSON from Gemini",
        rawText: text
      });
    }

    return res.status(200).json(parsed);
  }
