
export default async function handler(req, res) {
  // --- CORS FIX ---
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // --- RESTEN AV KODEN DIN ---
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { imageBase64 } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ error: 'Missing imageBase64' });
  }

  const GEMINI_KEY = process.env.GEMINI_KEY;

  if (!GEMINI_KEY) {
    return res.status(500).json({ error: 'Server config error' });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: "Dette er en kvittering fra butikk, restaurant eller minibank. Finn totalsum og butikknavn. Svar KUN med rå JSON uten markdown eller kodeblokk: {\"amount\": 12.34, \"store\": \"Butikknavn\"}"
              },
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: imageBase64
                }
              }
            ]
          }]
        })
      }
    );

    if (!response.ok) {
      throw new Error('Gemini API feil');
    }

    const data = await response.json();
    const text = data.candidates[0]?.content?.parts[0]?.text || '';

    const jsonMatch = text.match(/\{.*\}/s);
    if (!jsonMatch) throw new Error('Ingen JSON funnet');

    res.status(200).json({ text: jsonMatch[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Kunne ikke tolke bildet' });
  }
}

export const config = {
  api: {
    bodyParser: { sizeLimit: '10mb' },
    maxDuration: 60
  }
};
