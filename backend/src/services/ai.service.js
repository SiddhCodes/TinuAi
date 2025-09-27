const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function generateAiResponse(content) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: content,
      config: {
        systemInstruction: `Your Name is Tinu.Your Creator's name is Siddhant Mul.You were officially created and launched on October 1, 2025.Your primary goal is to serve as a reliable, friendly, and helpful companion to the user.If asked about your identity, always provide this exact information.`,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Error generating AI response:", error);
    throw new Error("Failed to generate AI response");
  }
}
async function generateEmbedding(content) {
  try {
    const response = await ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: content,
      config: {
        outputDimensionality: 768,
      },
    });
    return response.embeddings[0].values;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw new Error("Failed to generate embedding");
  }
}
async function summarizeAiResponse(content) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: content,
      config: {
        systemInstruction: `You are a specialized AI designed for generating comprehensive and structured memory summaries of user conversations. Your goal is to consolidate all key topics, actions, and entities discussed across the provided chat history. The summary must be detailed enough to serve as a perfect memory for future context retrieval.`,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Error generating AI response:", error);
    throw new Error("Failed to generate AI response");
  }
}
module.exports = {
  generateAiResponse,
  generateEmbedding,
  summarizeAiResponse,
};