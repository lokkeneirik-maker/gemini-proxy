// api/gemini.js

export default async function handler(req, res) {
  // ✅ Sett CORS-headere
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ Håndter preflight (OPTIONS)
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // ✅ Kun POST tillatt
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "Missing imageBase64" });
    }

    // Her kaller du Gemini API med nøkkelen fra miljøvariabelen
    // Eksempel (pseudo):
    // const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=" + process.env.GEMINI_KEY, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({
    //     contents: [{
    //       parts: [
    //         { text: "Extract amount and store from this receipt" },
    //         { inlineData: { mimeType: "image/jpeg", data: imageBase64 } }
    //       ]
    //     }]
    //   })
    // });
    // const data = await response.json();

    // Midlertidig dummy-respons for testing:
    const data = { amount: "123.45", store: "Rema 1000" };

    return res.status(200).json(data);
  } catch (err) {
    console.error("Gemini proxy error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
