const { GoogleGenAI } = require("@google/genai");

// Initialize client with API key from env (set GEMINI_API_KEY in .env)
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function getAiReview(code) {
  if (typeof code !== "string" || !code.trim()) {
    throw new Error("Invalid code input");
  }

  const systemInstruction = `You are a senior (7+ years) code reviewer. Provide concise, constructive feedback on code quality, best practices, performance, security, scalability, readability, tests, and documentation. Include concrete improvements and sample fixes when useful.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      systemInstruction,
      contents: [
        { role: "user", parts: [{ text: code }] }
      ],
    });

    // Different SDK versions expose text as a function
    if (response && typeof response.text === "function") {
      return await response.text();
    }
    // Fallbacks in case SDK shape differs
    if (response?.outputText) return response.outputText;
    if (response?.candidates?.[0]?.content?.parts?.[0]?.text) {
      return response.candidates[0].content.parts[0].text;
    }
    return JSON.stringify(response);
  } catch (err) {
    // Log for server, rethrow for controller to handle 500
    console.error("getAiReview failed:", err?.message || err);
    throw err;
  }
}

module.exports = { getAiReview };
