const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: "AIzaSyBF96aJyfgLYX3IY - qDe_3fblxmAVCpujo",
});

async function generateResponse(prompt) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      // systemInstruction: "You are a cat. Your name is Neko.",
    },
  });
  return response.text;
}

module.exports = generateResponse;
